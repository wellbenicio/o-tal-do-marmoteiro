import { AuthRole } from '@marmoteiro/shared';

/**
 * Identidade autenticada anexada à requisição por `AuthGuard` — distingue
 * Consulente (seção 4.2) de Administrador (seção 4.3). Ver
 * docs/adr/0012-autenticacao-e-rbac.md.
 */
export interface Principal {
  id: string;
  role: AuthRole;
}
