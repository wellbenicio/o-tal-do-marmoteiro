import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionStore } from './session-store';
import { Principal } from './principal';

/** `Request` com o `Principal` anexado por `AuthGuard`. */
export interface RequestWithPrincipal extends Request {
  principal?: Principal;
}

const BEARER_PREFIX = 'Bearer ';

/**
 * Autentica a requisição a partir do token opaco de sessão (seção 7.3:
 * "controle seguro de sessão"). Anexa o `Principal` resolvido a
 * `request.principal`; lança `UnauthorizedException` (integra-se ao
 * `DomainErrorFilter` da ADR 0011 pelo ramo `HttpException`) se o token
 * estiver ausente, inválido ou expirado. Ver
 * docs/adr/0012-autenticacao-e-rbac.md.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly sessionStore: SessionStore) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Token de sessão ausente.');
    }

    const session = await this.sessionStore.find(token);
    if (!session) {
      throw new UnauthorizedException('Token de sessão inválido ou expirado.');
    }

    request.principal = { id: session.principalId, role: session.role };
    return true;
  }

  private extractToken(request: RequestWithPrincipal): string | undefined {
    const header = request.headers.authorization;
    if (!header?.startsWith(BEARER_PREFIX)) {
      return undefined;
    }

    return header.slice(BEARER_PREFIX.length).trim() || undefined;
  }
}
