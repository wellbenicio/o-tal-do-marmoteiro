import {
  RESCHEDULE_MINIMUM_NOTICE_HOURS,
  RESCHEDULE_OPTIONS_CHOICE_WINDOW_HOURS,
  calculateRescheduleOptionsExpireAt,
  evaluateCustomerRescheduleEligibility,
  isRescheduleChoiceExpired,
} from './reschedule-eligibility';

describe('evaluateCustomerRescheduleEligibility', () => {
  const scheduledAt = new Date('2026-09-01T10:00:00.000Z');

  it('é elegível quando o reagendamento ainda não foi usado e há antecedência suficiente', () => {
    const requestedAt = new Date('2026-08-25T10:00:00.000Z');

    expect(
      evaluateCustomerRescheduleEligibility({
        scheduledAt,
        requestedAt,
        rescheduleUsed: false,
      }),
    ).toEqual({ eligible: true, reasonCode: 'ELIGIBLE' });
  });

  it('rejeita quando o único reagendamento contratual já foi consumido (seção 15.1/15.6)', () => {
    const requestedAt = new Date('2026-08-25T10:00:00.000Z');

    expect(
      evaluateCustomerRescheduleEligibility({
        scheduledAt,
        requestedAt,
        rescheduleUsed: true,
      }),
    ).toEqual({ eligible: false, reasonCode: 'RESCHEDULE_ALREADY_USED' });
  });

  it('rejeita quando faltam menos de 24 horas para o horário agendado (seção 15.2)', () => {
    const requestedAt = new Date(
      scheduledAt.getTime() -
        (RESCHEDULE_MINIMUM_NOTICE_HOURS * 60 * 60 * 1000 - 1),
    );

    expect(
      evaluateCustomerRescheduleEligibility({
        scheduledAt,
        requestedAt,
        rescheduleUsed: false,
      }),
    ).toEqual({ eligible: false, reasonCode: 'INSUFFICIENT_NOTICE' });
  });

  it('é elegível quando a solicitação ocorre a exatamente 24 horas do horário agendado', () => {
    const requestedAt = new Date(
      scheduledAt.getTime() - RESCHEDULE_MINIMUM_NOTICE_HOURS * 60 * 60 * 1000,
    );

    expect(
      evaluateCustomerRescheduleEligibility({
        scheduledAt,
        requestedAt,
        rescheduleUsed: false,
      }),
    ).toEqual({ eligible: true, reasonCode: 'ELIGIBLE' });
  });

  it('prioriza RESCHEDULE_ALREADY_USED mesmo quando também falta antecedência', () => {
    const requestedAt = new Date(scheduledAt.getTime() - 60 * 60 * 1000);

    expect(
      evaluateCustomerRescheduleEligibility({
        scheduledAt,
        requestedAt,
        rescheduleUsed: true,
      }),
    ).toEqual({ eligible: false, reasonCode: 'RESCHEDULE_ALREADY_USED' });
  });

  it('rejeita quando a solicitação ocorre após o horário agendado (antecedência negativa)', () => {
    const requestedAt = new Date(scheduledAt.getTime() + 60 * 60 * 1000);

    expect(
      evaluateCustomerRescheduleEligibility({
        scheduledAt,
        requestedAt,
        rescheduleUsed: false,
      }),
    ).toEqual({ eligible: false, reasonCode: 'INSUFFICIENT_NOTICE' });
  });
});

describe('calculateRescheduleOptionsExpireAt', () => {
  it('soma exatamente 48 horas corridas ao instante de apresentação das opções', () => {
    const optionsPresentedAt = new Date('2026-08-24T09:00:00.000Z');

    expect(calculateRescheduleOptionsExpireAt(optionsPresentedAt)).toEqual(
      new Date(
        optionsPresentedAt.getTime() +
          RESCHEDULE_OPTIONS_CHOICE_WINDOW_HOURS * 60 * 60 * 1000,
      ),
    );
  });

  it('não pula fins de semana — o prazo é em horas corridas, não úteis (contraste com a ADR 0009)', () => {
    // Sexta-feira: se fosse "horas úteis" como na ADR 0009, o prazo
    // cruzaria o fim de semana. Aqui deve ser simplesmente +48h corridas.
    const optionsPresentedAt = new Date('2026-08-28T09:00:00.000Z');

    expect(calculateRescheduleOptionsExpireAt(optionsPresentedAt)).toEqual(
      new Date('2026-08-30T09:00:00.000Z'),
    );
  });
});

describe('isRescheduleChoiceExpired', () => {
  const optionsExpireAt = new Date('2026-08-26T09:00:00.000Z');

  it('retorna false antes do prazo', () => {
    expect(
      isRescheduleChoiceExpired(
        optionsExpireAt,
        new Date(optionsExpireAt.getTime() - 1),
      ),
    ).toBe(false);
  });

  it('retorna true após o prazo', () => {
    expect(
      isRescheduleChoiceExpired(
        optionsExpireAt,
        new Date(optionsExpireAt.getTime() + 1),
      ),
    ).toBe(true);
  });
});
