import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  newSessionToken,
  normalizeEmail,
  tokenHash,
  validEmail,
  verifyPassword,
} from './credentials';
export const SESSION_MS = 8 * 60 * 60 * 1000;
@Injectable()
export class AdminAuthService {
  private verifying = 0;
  constructor(private readonly db: PrismaService) {}
  async limit(key: string, limit: number) {
    const expiresAt = new Date(Date.now() + 15 * 60000);
    const rows = await this.db.$queryRaw<
      { attempts: number }[]
    >`INSERT INTO "AdminLoginBucket" ("key","attempts","expiresAt") VALUES (${key},1,${expiresAt}) ON CONFLICT ("key") DO UPDATE SET "attempts"=CASE WHEN "AdminLoginBucket"."expiresAt"<=NOW() THEN 1 ELSE "AdminLoginBucket"."attempts"+1 END,"expiresAt"=CASE WHEN "AdminLoginBucket"."expiresAt"<=NOW() THEN ${expiresAt} ELSE "AdminLoginBucket"."expiresAt" END RETURNING "attempts"`;
    if (rows[0].attempts > limit)
      throw new HttpException(
        'Muitas tentativas. Aguarde 15 minutos e tente novamente.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
  }
  async login(email: unknown, password: unknown, clientKey: string) {
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      password.length > 128 ||
      !validEmail(normalizeEmail(email))
    )
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    const normalized = normalizeEmail(email);
    await this.limit(tokenHash('client:' + clientKey), 30);
    await this.limit(tokenHash('account:' + normalized), 8);
    if (this.verifying >= 3)
      throw new HttpException('Tente novamente em instantes.', 429);
    this.verifying++;
    let admin;
    let valid = false;
    try {
      admin = await this.db.adminUser.findUnique({
        where: { email: normalized },
      });
      valid = await verifyPassword(password, admin?.passwordHash);
    } finally {
      this.verifying--;
    }
    if (!admin || !valid || !admin.active || admin.role !== 'OWNER')
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    const token = newSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MS);
    await this.db.$transaction(async (tx) => {
      const current = await tx.adminUser.findUnique({
        where: { id: admin.id },
      });
      if (
        !current?.active ||
        current.role !== 'OWNER' ||
        current.passwordHash !== admin.passwordHash
      )
        throw new UnauthorizedException();
      await tx.adminSession.create({
        data: { adminId: admin.id, tokenHash: tokenHash(token), expiresAt },
      });
      await tx.auditLog.create({
        data: {
          actorAdminId: admin.id,
          entityType: 'ADMIN_SESSION',
          entityId: admin.id,
          action: 'ADMIN_LOGIN',
        },
      });
    });
    return {
      token,
      expiresAt: expiresAt.toISOString(),
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }
  async session(token: string) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new UnauthorizedException();
    const session = await this.db.adminSession.findUnique({
      where: { tokenHash: tokenHash(token) },
      include: { admin: true },
    });
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      !session.admin.active ||
      session.admin.role !== 'OWNER' ||
      session.admin.updatedAt > session.createdAt
    )
      throw new UnauthorizedException();
    return {
      id: session.admin.id,
      name: session.admin.name,
      email: session.admin.email,
      role: session.admin.role,
      expiresAt: session.expiresAt.toISOString(),
    };
  }
  async logout(token: string) {
    if (!token) return;
    await this.db.adminSession.updateMany({
      where: { tokenHash: tokenHash(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
