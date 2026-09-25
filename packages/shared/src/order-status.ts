/**
 * Estados do Pedido — eixo de estado independente de Pagamento e Atendimento
 * (seção 10: "Pedido, pagamento e atendimento são domínios distintos").
 *
 * Fonte: o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md, seção 10.1.
 * A especificação cita apenas CONFIRMADO/CANCELADO como exemplos (seção 10);
 * o enum completo e as transições foram definidos em
 * docs/adr/0017-maquina-de-estado-do-pedido.md.
 */
export enum OrderStatus {
  CREATED = 'CREATED',
  CONFIRMED = 'CONFIRMED',
  CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED',
  CANCELLED = 'CANCELLED',
}
