import { Module } from '@nestjs/common';
import { AdminAuthService } from './admin/admin-auth.service';
import { AdminAuthController } from './admin/admin-auth.controller';
import { AdminSessionGuard, InternalApiGuard } from './admin/admin-auth.guard';
@Module({
  controllers: [AdminAuthController],
  providers: [AdminAuthService, AdminSessionGuard, InternalApiGuard],
  exports: [AdminAuthService, AdminSessionGuard, InternalApiGuard],
})
export class IdentityModule {}
