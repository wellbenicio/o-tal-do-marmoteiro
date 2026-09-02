/**
 * Papel do AdminUser dentro do painel administrativo.
 *
 * Fonte: o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md, seção 28
 * ("Controle de acesso administrativo... a solução técnica deverá permitir
 * evolução para RBAC/permissões"). Hoje existe um único valor (`ADMIN`); o
 * enum (em vez de `String`) é a decisão técnica registrada em
 * docs/adr/0012-autenticacao-e-rbac.md que viabiliza essa evolução futura
 * sem alterar o tipo da coluna.
 */
export enum AdminRole {
  ADMIN = 'ADMIN',
}
