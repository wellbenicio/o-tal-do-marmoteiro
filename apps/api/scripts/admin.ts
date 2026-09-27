import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { emitKeypressEvents } from 'node:readline';
import {
  hashPassword,
  normalizeEmail,
  validEmail,
} from '../src/modules/identity/admin/credentials';
function option(name: string) {
  const index = process.argv.indexOf('--' + name);
  return index < 0 ? '' : process.argv[index + 1] || '';
}
function hidden(prompt: string): Promise<string> {
  if (!process.stdin.isTTY)
    throw new Error(
      'Execute em um terminal interativo. A senha não deve ser enviada como argumento ou variável de ambiente.',
    );
  return new Promise((resolve, reject) => {
    let value = '';
    process.stdout.write(prompt);
    emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const finish = () => {
      process.stdin.off('keypress', key);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write('\n');
    };
    const key = (text: string, key: { name?: string; ctrl?: boolean }) => {
      if (key.ctrl && key.name === 'c') {
        finish();
        reject(new Error('Operação cancelada.'));
      } else if (key.name === 'return') {
        finish();
        resolve(value);
      } else if (key.name === 'backspace') {
        value = value.slice(0, -1);
      } else if (text && !key.ctrl && value.length < 129) {
        value += text;
      }
    };
    process.stdin.on('keypress', key);
  });
}
async function main() {
  const action = process.argv[2];
  const email = normalizeEmail(option('email'));
  if (
    !['create', 'reset-password', 'disable'].includes(action) ||
    !validEmail(email)
  )
    throw new Error(
      'Uso: npm run admin:manage -- <create|reset-password|disable> --email pessoa@dominio.com [--name Nome]',
    );
  if (!process.env.DATABASE_URL)
    throw new Error('Configure DATABASE_URL em apps/api/.env.');
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const existing = await db.adminUser.findUnique({ where: { email } });
    if (action === 'create' && existing)
      throw new Error(
        'Esta conta já existe; use reset-password se necessário.',
      );
    if (action !== 'create' && !existing)
      throw new Error('Conta não encontrada.');
    let passwordHash = '';
    if (action !== 'disable') {
      const password = await hidden(
        'Senha (15 a 128 caracteres; entrada oculta): ',
      );
      const confirmation = await hidden('Confirme a senha: ');
      if (password !== confirmation)
        throw new Error('As senhas não coincidem.');
      passwordHash = await hashPassword(password);
    }
    await db.$transaction(async (tx) => {
      const admin =
        action === 'create'
          ? await tx.adminUser.create({
              data: {
                email,
                name: option('name').trim() || 'O Marmoteiro',
                passwordHash,
                role: 'OWNER',
                active: true,
              },
            })
          : await tx.adminUser.update({
              where: { id: existing!.id },
              data: action === 'disable' ? { active: false } : { passwordHash },
            });
      if (action !== 'create')
        await tx.adminSession.updateMany({
          where: { adminId: admin.id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      await tx.auditLog.create({
        data: {
          actorAdminId: admin.id,
          entityType: 'ADMIN_USER',
          entityId: admin.id,
          action: 'ADMIN_CLI_' + action.toUpperCase().replace('-', '_'),
          metadata: { source: 'server-cli' },
        },
      });
    });
    console.log(
      `Operação concluída: ${action} · ${email}. Nenhuma senha ou link de cadastro foi enviado por e-mail.`,
    );
  } finally {
    await db.$disconnect();
  }
}
main().catch((error: unknown) => {
  console.error(
    error instanceof Error
      ? error.message
      : 'Não foi possível concluir a operação.',
  );
  process.exitCode = 1;
});
