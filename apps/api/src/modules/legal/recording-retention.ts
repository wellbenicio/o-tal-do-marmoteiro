/**
 * Retenção de gravação de consulta e legal hold — ver ADR 0014
 * (docs/adr/0014-retencao-de-gravacao-e-legal-hold.md). Funções puras, não
 * uma máquina de estado: calculam o prazo de retenção da gravação (seção
 * 26.3) e se ela já está elegível para exclusão automática, dado um
 * eventual legal hold ativo (seção 26.4).
 */

/** Prazo máximo de retenção da gravação, em dias corridos, após o atendimento (seção 26.3). */
export const RECORDING_RETENTION_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;
const RECORDING_RETENTION_MS = RECORDING_RETENTION_DAYS * DAY_MS;

export type RecordingRetentionReasonCode =
  | 'ELIGIBLE_FOR_DELETION'
  | 'LEGAL_HOLD_ACTIVE'
  | 'RETENTION_PERIOD_NOT_ELAPSED';

export interface RecordingRetentionEligibility {
  eligibleForDeletion: boolean;
  reasonCode: RecordingRetentionReasonCode;
}

/**
 * Calcula o instante em que a retenção padrão da gravação se encerra: 90
 * dias corridos (seção 26.3) a partir da conclusão do atendimento — não há
 * calendário de horas úteis envolvido aqui (diferente da ADR 0009).
 *
 * `appointmentCompletedAt` é o instante em que o atendimento (consulta
 * online) foi concluído — o chamador é responsável por obtê-lo (ex.: a
 * partir do momento em que `Appointment.status` se tornou `COMPLETED`);
 * esta função permanece agnóstica quanto à origem exata do dado, seguindo
 * o mesmo padrão já usado na ADR 0010 (`optionsPresentedAt`).
 */
export function calculateRecordingRetentionExpiresAt(
  appointmentCompletedAt: Date,
): Date {
  return new Date(appointmentCompletedAt.getTime() + RECORDING_RETENTION_MS);
}

/**
 * Avalia se a gravação já está elegível para exclusão automática em
 * `now`. Enquanto houver legal hold ativo, a exclusão automática deve
 * permanecer suspensa (seção 26.4), independentemente do prazo decorrido
 * — a verificação do legal hold precede e prevalece sobre o cálculo do
 * prazo de retenção.
 */
export function evaluateRecordingRetentionEligibility(
  appointmentCompletedAt: Date,
  now: Date,
  legalHoldActive: boolean,
): RecordingRetentionEligibility {
  if (legalHoldActive) {
    return { eligibleForDeletion: false, reasonCode: 'LEGAL_HOLD_ACTIVE' };
  }

  const retentionExpiresAt = calculateRecordingRetentionExpiresAt(
    appointmentCompletedAt,
  );
  if (now.getTime() > retentionExpiresAt.getTime()) {
    return { eligibleForDeletion: true, reasonCode: 'ELIGIBLE_FOR_DELETION' };
  }

  return {
    eligibleForDeletion: false,
    reasonCode: 'RETENTION_PERIOD_NOT_ELAPSED',
  };
}
