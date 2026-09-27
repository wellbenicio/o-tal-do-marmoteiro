/**
 * Elegibilidade e prazo de reagendamento da Consulta Online — ver ADR
 * 0010 (docs/adr/0010-elegibilidade-e-prazo-de-reagendamento.md). Funções
 * puras, não uma máquina de estado: decidem se o consulente pode abrir
 * uma solicitação de reagendamento e calculam o prazo de escolha das
 * opções apresentadas.
 */

/** Antecedência mínima exigida para solicitar reagendamento (seção 15.2). */
export const RESCHEDULE_MINIMUM_NOTICE_HOURS = 24;

/** Prazo (em horas corridas, não úteis) para escolher uma nova opção após apresentação (seção 15.4). */
export const RESCHEDULE_OPTIONS_CHOICE_WINDOW_HOURS = 48;

const HOUR_MS = 60 * 60 * 1000;
const RESCHEDULE_MINIMUM_NOTICE_MS = RESCHEDULE_MINIMUM_NOTICE_HOURS * HOUR_MS;
const RESCHEDULE_OPTIONS_CHOICE_WINDOW_MS =
  RESCHEDULE_OPTIONS_CHOICE_WINDOW_HOURS * HOUR_MS;

export type RescheduleEligibilityReasonCode =
  'ELIGIBLE' | 'RESCHEDULE_ALREADY_USED' | 'INSUFFICIENT_NOTICE';

export interface RescheduleEligibilityInput {
  /** Horário atualmente agendado do atendimento. */
  scheduledAt: Date;
  /** Instante em que o consulente está solicitando o reagendamento. */
  requestedAt: Date;
  /** `Appointment.rescheduleUsed` — o único reagendamento contratual já foi consumido? */
  rescheduleUsed: boolean;
}

export interface RescheduleEligibilityResult {
  eligible: boolean;
  reasonCode: RescheduleEligibilityReasonCode;
}

/**
 * Avalia se o consulente pode abrir uma solicitação de reagendamento por
 * iniciativa própria. Aplica-se somente ao reagendamento do cliente —
 * **não** deve ser usada para o reagendamento provocado pelo prestador
 * (seção 15.7), que não tem restrição de antecedência nem consome este
 * direito.
 */
export function evaluateCustomerRescheduleEligibility(
  input: RescheduleEligibilityInput,
): RescheduleEligibilityResult {
  if (input.rescheduleUsed) {
    return { eligible: false, reasonCode: 'RESCHEDULE_ALREADY_USED' };
  }

  const noticeMs = input.scheduledAt.getTime() - input.requestedAt.getTime();
  if (noticeMs < RESCHEDULE_MINIMUM_NOTICE_MS) {
    return { eligible: false, reasonCode: 'INSUFFICIENT_NOTICE' };
  }

  return { eligible: true, reasonCode: 'ELIGIBLE' };
}

/**
 * Calcula o instante-limite para o consulente escolher uma nova opção de
 * horário: 48 horas corridas (seção 15.4) a partir da apresentação das
 * opções — diferente da ADR 0009 (SLA da Pergunta Avulsa), não há
 * calendário de horas úteis envolvido aqui.
 */
export function calculateRescheduleOptionsExpireAt(
  optionsPresentedAt: Date,
): Date {
  return new Date(
    optionsPresentedAt.getTime() + RESCHEDULE_OPTIONS_CHOICE_WINDOW_MS,
  );
}

/**
 * Indica se o prazo de 48 horas para escolha (seção 15.4) já foi
 * ultrapassado em `now`, dado o prazo-limite calculado.
 */
export function isRescheduleChoiceExpired(
  optionsExpireAt: Date,
  now: Date,
): boolean {
  return now.getTime() > optionsExpireAt.getTime();
}
