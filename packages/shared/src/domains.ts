/**
 * Domínios conceituais do monólito modular.
 *
 * Fonte: o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md,
 * seções 33 (Domínios conceituais esperados) e 34 (Arquitetura funcional
 * recomendada). Os nomes técnicos podem diferir dos nomes funcionais, desde
 * que os limites de domínio sejam preservados.
 */
export const DOMAIN_MODULES = [
  'identity',
  'customer',
  'catalog',
  'ordering',
  'payment',
  'scheduling',
  'question',
  'fulfillment',
  'cancellation',
  'legal',
  'privacy',
  'notification',
  'administration',
  'audit',
] as const;

export type DomainModuleName = (typeof DOMAIN_MODULES)[number];
