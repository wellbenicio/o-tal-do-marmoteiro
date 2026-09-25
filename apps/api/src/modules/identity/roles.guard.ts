import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthRole } from '@marmoteiro/shared';
import { ROLES_KEY } from './roles.decorator';
import type { RequestWithPrincipal } from './auth.guard';

/**
 * Autoriza a requisição conforme os `AuthRole` declarados via `@Roles(...)`
 * (seção 28: RBAC administrativo). Se nenhum papel for declarado no
 * handler/controller, permite o acesso. Deve rodar depois de `AuthGuard`
 * (que popula `request.principal`); nega o acesso (não lança) se
 * `principal` estiver ausente — defensivo, não deveria ocorrer se os
 * guards estiverem na ordem correta. Ver
 * docs/adr/0012-autenticacao-e-rbac.md.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AuthRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithPrincipal>();
    const principal = request.principal;
    if (!principal) {
      return false;
    }

    return requiredRoles.includes(principal.role);
  }
}
