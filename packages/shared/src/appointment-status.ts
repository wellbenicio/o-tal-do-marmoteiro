/**
 * Estados do Atendimento (execução) da Consulta Online — eixo de estado
 * independente de Pedido e Pagamento (seção 10). Não se aplica à Pergunta
 * Avulsa, cujo eixo de atendimento já é coberto integralmente por
 * `QuestionStatus` (seção 11.3).
 *
 * Fonte: o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md,
 * seção 10 (exemplos AGENDADO/CONCLUÍDO/NÃO_INICIADO), seção 17 (no-show) e
 * seção 29 (exemplo de auditoria "BOOKED → NO_SHOW"). Definido em
 * docs/adr/0003-maquina-de-estado-do-atendimento.md — reagendamento,
 * cancelamento tardio e no-show permanecem modelados como eventos e regras
 * financeiras (RescheduleRequest, CancellationRequest, RefundDecision), não
 * como estados adicionais fechados neste enum.
 */
export enum AppointmentStatus {
  NOT_STARTED = 'NOT_STARTED',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
}

/**
 * Estados da solicitação de reagendamento (seção 15.3–15.5) — decisão
 * vinculada à máquina de estado do Atendimento. Ver
 * docs/adr/0003-maquina-de-estado-do-atendimento.md.
 */
export enum RescheduleRequestStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  EXPIRED = 'EXPIRED',
}
