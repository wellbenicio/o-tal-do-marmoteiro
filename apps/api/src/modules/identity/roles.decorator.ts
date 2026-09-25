import { SetMetadata } from '@nestjs/common';
import { AuthRole } from '@marmoteiro/shared';

export const ROLES_KEY = 'roles';

/**
 * Declara quais `AuthRole` podem acessar um handler/controller — lido por
 * `RolesGuard` (seção 28: RBAC administrativo). Ver
 * docs/adr/0012-autenticacao-e-rbac.md.
 */
export const Roles = (...roles: AuthRole[]) => SetMetadata(ROLES_KEY, roles);
