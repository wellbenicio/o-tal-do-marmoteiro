import 'dotenv/config';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../../prisma/prisma.module';
import { PrismaService } from '../../../prisma/prisma.service';
import { IdentityModule } from '../identity.module';
import { AdminAuthService } from './admin-auth.service';
import { hashPassword, tokenHash } from './credentials';
import { randomUUID } from 'node:crypto';
const suite =
  process.env.RUN_DATABASE_TESTS === 'true' ? describe : describe.skip;
suite(
  'administrative access with PostgreSQL',
  () => {
    let app: INestApplication;
    let db: PrismaService;
    let service: AdminAuthService;
    let url: string;
    let adminId: string;
    const email = `qa-${randomUUID()}@example.com`;
    const password = 'Temporary integration passphrase 2026';
    const clientKey = randomUUID();
    let savedSecret: string | undefined;
    beforeAll(async () => {
      savedSecret = process.env.ADMIN_API_SECRET;
      process.env.ADMIN_API_SECRET = 'only-integration-' + randomUUID();
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true }),
          PrismaModule,
          IdentityModule,
        ],
      }).compile();
      app = module.createNestApplication();
      await app.listen(0, '127.0.0.1');
      url = await app.getUrl();
      db = app.get(PrismaService);
      service = app.get(AdminAuthService);
      const admin = await db.adminUser.create({
        data: {
          email,
          name: 'Temporary QA',
          passwordHash: await hashPassword(password),
          role: 'OWNER',
        },
      });
      adminId = admin.id;
    });
    afterAll(async () => {
      if (db && adminId) {
        await db.auditLog.deleteMany({ where: { actorAdminId: adminId } });
        await db.adminUser.delete({ where: { id: adminId } });
        await db.adminLoginBucket.deleteMany({
          where: {
            key: {
              in: [
                tokenHash('account:' + email),
                tokenHash('client:' + clientKey),
                tokenHash('account:missing-' + email),
                tokenHash('client:limit-' + clientKey),
              ],
            },
          },
        });
      }
      await app?.close();
      if (savedSecret === undefined) delete process.env.ADMIN_API_SECRET;
      else process.env.ADMIN_API_SECRET = savedSecret;
    });
    it('has no administrative registration endpoint and rejects calls outside the trusted BFF', async () => {
      expect(
        (await fetch(url + '/admin/auth/signup', { method: 'POST' })).status,
      ).toBe(404);
      expect((await fetch(url + '/admin/auth/session')).status).toBe(401);
      expect(
        (
          await fetch(url + '/admin/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })
        ).status,
      ).toBe(401);
    });
    it('persists only the token hash, grants the authorized owner and invalidates logout/expiry/revocation', async () => {
      const result = await service.login(email, password, clientKey);
      const stored = await db.adminSession.findUnique({
        where: { tokenHash: tokenHash(result.token) },
      });
      expect(stored?.tokenHash).not.toBe(result.token);
      expect((await service.session(result.token)).email).toBe(email);
      await service.logout(result.token);
      await expect(service.session(result.token)).rejects.toThrow();
      const expired = await service.login(email, password, clientKey);
      await db.adminSession.update({
        where: { tokenHash: tokenHash(expired.token) },
        data: { expiresAt: new Date(0) },
      });
      await expect(service.session(expired.token)).rejects.toThrow();
    });
    it('rejects fabricated tokens, wrong passwords, disabled accounts and non-owner roles', async () => {
      await expect(service.session('forged')).rejects.toThrow();
      await expect(
        service.login(email, 'incorrect', clientKey),
      ).rejects.toThrow('E-mail ou senha inválidos.');
      await db.adminUser.update({
        where: { id: adminId },
        data: { active: false },
      });
      await expect(service.login(email, password, clientKey)).rejects.toThrow(
        'E-mail ou senha inválidos.',
      );
      await db.adminUser.update({
        where: { id: adminId },
        data: { active: true, role: 'CUSTOMER' },
      });
      await expect(service.login(email, password, clientKey)).rejects.toThrow(
        'E-mail ou senha inválidos.',
      );
      await db.adminUser.update({
        where: { id: adminId },
        data: { role: 'OWNER' },
      });
    });
    it('persists throttling for unknown accounts too', async () => {
      for (let i = 0; i < 8; i++)
        await expect(
          service.login('missing-' + email, 'incorrect', 'limit-' + clientKey),
        ).rejects.toThrow('E-mail ou senha inválidos.');
      await expect(
        service.login('missing-' + email, 'incorrect', 'limit-' + clientKey),
      ).rejects.toThrow('Muitas tentativas.');
    });
  },
  30000,
);
