/**
 * Cálculo do prazo de SLA da Pergunta Avulsa — ver ADR 0009
 * (docs/adr/0009-calculo-sla-pergunta-avulsa.md). Função pura, não uma
 * máquina de estado: calcula o instante-limite de entrega a partir da
 * confirmação do pagamento, avançando apenas por horas úteis.
 */

/** Prazo máximo de resposta da Pergunta Avulsa (seção 11.1) — fixo, não configurável (não consta na lista de parâmetros da seção 37). */
export const QUESTION_SLA_HOURS = 48;

const MINUTE_MS = 60 * 1000;
const SLA_TOTAL_MINUTES = QUESTION_SLA_HOURS * 60;

/**
 * Calendário operacional configurável (seção 11.2). Esta ADR não fornece
 * uma implementação concreta — dias de atendimento, horário de
 * expediente e feriados são parâmetros operacionais (seção 37) fora do
 * escopo funcional/regulatório.
 */
export interface BusinessHoursCalendar {
  /** Indica se o instante informado está dentro do expediente configurado. */
  isWithinBusinessHours(instant: Date): boolean;
}

/**
 * Calcula o instante-limite de entrega da Pergunta Avulsa: 48 horas úteis
 * (seção 11.1) a partir de `paymentConfirmedAt` (`payment.confirmedAt`,
 * nunca a criação do carrinho/pedido ou o início do checkout), avançando
 * minuto a minuto e contando somente os minutos em que `calendar`
 * caracteriza expediente. Independe de prioridade (regra invariante nº 5,
 * seção 32).
 */
export function calculateQuestionSlaDeadline(
  paymentConfirmedAt: Date,
  calendar: BusinessHoursCalendar,
): Date {
  let remainingMinutes = SLA_TOTAL_MINUTES;
  let cursor = paymentConfirmedAt.getTime();

  while (remainingMinutes > 0) {
    if (calendar.isWithinBusinessHours(new Date(cursor))) {
      remainingMinutes -= 1;
    }
    cursor += MINUTE_MS;
  }

  return new Date(cursor);
}

/**
 * Indica se o prazo de 48 horas úteis (seção 11.1) já foi ultrapassado em
 * `now`, dado o instante de confirmação do pagamento e o calendário
 * operacional vigente.
 */
export function isQuestionSlaExceeded(
  paymentConfirmedAt: Date,
  now: Date,
  calendar: BusinessHoursCalendar,
): boolean {
  const deadline = calculateQuestionSlaDeadline(paymentConfirmedAt, calendar);
  return now.getTime() > deadline.getTime();
}
