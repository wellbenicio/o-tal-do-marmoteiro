/**
 * Decisões possíveis do Refund Policy Engine (motor de reembolso centralizado).
 *
 * Fonte: o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md, seção 20.3.
 * `NO_REFUND` somente pode ocorrer quando juridicamente e contratualmente válido.
 */
export enum RefundDecision {
  FULL_REFUND = 'FULL_REFUND',
  PARTIAL_REFUND = 'PARTIAL_REFUND',
  NO_REFUND = 'NO_REFUND',
  MANUAL_REVIEW_REQUIRED = 'MANUAL_REVIEW_REQUIRED',
}

/**
 * Estados de tratamento de situações excepcionais (seção 18).
 */
export enum ExceptionCaseStatus {
  AUTOMATIC_DECISION = 'AUTOMATIC_DECISION',
  MANUAL_REVIEW_REQUIRED = 'MANUAL_REVIEW_REQUIRED',
  MANUAL_OVERRIDE = 'MANUAL_OVERRIDE',
}
