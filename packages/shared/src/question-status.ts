/**
 * Estados funcionais da Pergunta Avulsa.
 *
 * Fonte: o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md, seção 11.3.
 * Transcrito literalmente da especificação — não deve ser reinterpretado ou
 * simplificado (ver seção 38 do documento-fonte).
 */
export enum QuestionStatus {
  CREATED = 'CREATED',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  PAID = 'PAID',
  QUEUED = 'QUEUED',
  IN_PROGRESS = 'IN_PROGRESS',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  // Estados auxiliares (seção 11.3)
  CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED',
  CANCELLED = 'CANCELLED',
  REFUND_PENDING = 'REFUND_PENDING',
  REFUNDED = 'REFUNDED',
  MANUAL_REVIEW = 'MANUAL_REVIEW',
}
