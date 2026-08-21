/**
 * Estados financeiros do pagamento.
 *
 * Fonte: o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md, seção 21.2.
 * O documento apresenta esta lista como "exemplos de estados" — a etapa técnica
 * pode detalhar transições, mas não deve remover ou descaracterizar os estados
 * citados (ver seção 38 do documento-fonte).
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REFUND_PENDING = 'REFUND_PENDING',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  REFUNDED = 'REFUNDED',
}
