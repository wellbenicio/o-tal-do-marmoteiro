import { Module } from '@nestjs/common';
import { PasswordHasher, ScryptPasswordHasher } from './password-hasher';
import { SessionStore } from './session-store';
import { PersistentAdminSessionStore } from './persistent-admin-session-store';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { AdminAuthService } from './admin/admin-auth.service';
import { AdminAuthController } from './admin/admin-auth.controller';
import { AdminSessionGuard, InternalApiGuard } from './admin/admin-auth.guard';
@Module({
  controllers: [AdminAuthController],
  providers: [
    { provide: PasswordHasher, useClass: ScryptPasswordHasher },
    { provide: SessionStore, useClass: PersistentAdminSessionStore },
    AuthGuard,
    RolesGuard,
    AdminAuthService,
    AdminSessionGuard,
    InternalApiGuard,
  ],
  exports: [
    PasswordHasher,
    SessionStore,
    AuthGuard,
    RolesGuard,
    AdminAuthService,
    AdminSessionGuard,
    InternalApiGuard,
  ],
})
export class IdentityModule {}
