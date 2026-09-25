import {
  RECORDING_RETENTION_DAYS,
  calculateRecordingRetentionExpiresAt,
  evaluateRecordingRetentionEligibility,
} from './recording-retention';

describe('calculateRecordingRetentionExpiresAt', () => {
  it('soma exatamente 90 dias corridos ao instante de conclusão do atendimento', () => {
    const appointmentCompletedAt = new Date('2026-01-01T12:00:00.000Z');

    expect(
      calculateRecordingRetentionExpiresAt(appointmentCompletedAt),
    ).toEqual(
      new Date(
        appointmentCompletedAt.getTime() +
          RECORDING_RETENTION_DAYS * 24 * 60 * 60 * 1000,
      ),
    );
  });

  it('não pula fins de semana ou feriados — o prazo é em dias corridos, não úteis (contraste com a ADR 0009)', () => {
    const appointmentCompletedAt = new Date('2026-01-01T12:00:00.000Z');

    expect(
      calculateRecordingRetentionExpiresAt(appointmentCompletedAt),
    ).toEqual(new Date('2026-04-01T12:00:00.000Z'));
  });
});

describe('evaluateRecordingRetentionEligibility', () => {
  const appointmentCompletedAt = new Date('2026-01-01T12:00:00.000Z');
  const retentionExpiresAt = calculateRecordingRetentionExpiresAt(
    appointmentCompletedAt,
  );

  it('não é elegível para exclusão antes do prazo de 90 dias, sem legal hold', () => {
    expect(
      evaluateRecordingRetentionEligibility(
        appointmentCompletedAt,
        new Date(retentionExpiresAt.getTime() - 1),
        false,
      ),
    ).toEqual({
      eligibleForDeletion: false,
      reasonCode: 'RETENTION_PERIOD_NOT_ELAPSED',
    });
  });

  it('não é elegível exatamente no instante em que o prazo se encerra (limite inclusive na retenção)', () => {
    expect(
      evaluateRecordingRetentionEligibility(
        appointmentCompletedAt,
        retentionExpiresAt,
        false,
      ),
    ).toEqual({
      eligibleForDeletion: false,
      reasonCode: 'RETENTION_PERIOD_NOT_ELAPSED',
    });
  });

  it('é elegível para exclusão após o prazo de 90 dias, sem legal hold', () => {
    expect(
      evaluateRecordingRetentionEligibility(
        appointmentCompletedAt,
        new Date(retentionExpiresAt.getTime() + 1),
        false,
      ),
    ).toEqual({
      eligibleForDeletion: true,
      reasonCode: 'ELIGIBLE_FOR_DELETION',
    });
  });

  it('permanece inelegível após o prazo de 90 dias quando há legal hold ativo (seção 26.4)', () => {
    expect(
      evaluateRecordingRetentionEligibility(
        appointmentCompletedAt,
        new Date(retentionExpiresAt.getTime() + 1),
        true,
      ),
    ).toEqual({
      eligibleForDeletion: false,
      reasonCode: 'LEGAL_HOLD_ACTIVE',
    });
  });

  it('prioriza LEGAL_HOLD_ACTIVE mesmo quando o prazo de retenção também não decorreu', () => {
    expect(
      evaluateRecordingRetentionEligibility(
        appointmentCompletedAt,
        new Date(retentionExpiresAt.getTime() - 1),
        true,
      ),
    ).toEqual({
      eligibleForDeletion: false,
      reasonCode: 'LEGAL_HOLD_ACTIVE',
    });
  });
});
