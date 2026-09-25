/**
 * Tipo de principal autenticado — distingue Consulente de Administrador
 * (seção 4: "4.2 Consulente" / "4.3 Administrador / Oraculista").
 *
 * Não é um enum do Prisma nem uma coluna persistida: é um conceito da
 * camada de autenticação/autorização (guards HTTP), definido em
 * docs/adr/0012-autenticacao-e-rbac.md. Não confundir com `AdminRole`,
 * que é a coluna persistida em `AdminUser.role` para RBAC dentro do
 * painel administrativo (seção 28). "Visitante" (seção 4.1) não é um
 * valor deste enum — é a ausência de um principal autenticado.
 */
export enum AuthRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}
