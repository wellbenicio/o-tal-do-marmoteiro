import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { equalSecret } from './credentials';
export type AdminRequest = Request & {
  admin?: Awaited<ReturnType<AdminAuthService['session']>>;
};
export function bearer(req: Request) {
  const auth = req.header('authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : '';
}
@Injectable()
export class InternalApiGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(ctx: ExecutionContext) {
    const secret = this.config.get<string>('ADMIN_API_SECRET');
    const actual =
      ctx.switchToHttp().getRequest<Request>().header('x-admin-service-key') ||
      '';
    if (!secret || secret.length < 32 || !equalSecret(secret, actual))
      throw new UnauthorizedException();
    return true;
  }
}
@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private readonly auth: AdminAuthService) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AdminRequest>();
    req.admin = await this.auth.session(bearer(req));
    return true;
  }
}
