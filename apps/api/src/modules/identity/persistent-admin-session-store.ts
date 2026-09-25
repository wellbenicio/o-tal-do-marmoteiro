import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRole } from '@marmoteiro/shared';
import { AdminAuthService } from './admin/admin-auth.service';
import { SessionStore, type Session } from './session-store';

@Injectable()
export class PersistentAdminSessionStore extends SessionStore {
  constructor(private readonly auth: AdminAuthService) {
    super();
  }

  create(): Promise<Session> {
    return Promise.reject(
      new ForbiddenException('Use o login administrativo autenticado.'),
    );
  }

  async find(token: string): Promise<Session | undefined> {
    try {
      const admin = await this.auth.session(token);
      return {
        token,
        principalId: admin.id,
        role: AuthRole.ADMIN,
        expiresAt: new Date(admin.expiresAt),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) return undefined;
      throw error;
    }
  }

  async revoke(token: string): Promise<void> {
    await this.auth.logout(token);
  }
}
