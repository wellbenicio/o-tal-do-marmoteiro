import {
  BusinessHoursCalendar,
  QUESTION_SLA_HOURS,
  calculateQuestionSlaDeadline,
  isQuestionSlaExceeded,
} from './question-sla';

/** Calendário sempre aberto — usado apenas para isolar a mecânica de avanço nos testes. */
const ALWAYS_OPEN_CALENDAR: BusinessHoursCalendar = {
  isWithinBusinessHours: () => true,
};

/**
 * Calendário de teste: expediente de segunda a sexta, 09h-18h (UTC), sem
 * feriados. Fixture usada apenas para validar o algoritmo de avanço —
 * não representa o calendário operacional real (seção 11.2/37, fora do
 * escopo desta ADR).
 */
const WEEKDAY_9_TO_18_CALENDAR: BusinessHoursCalendar = {
  isWithinBusinessHours: (instant) => {
    const day = instant.getUTCDay();
    const hour = instant.getUTCHours();
    return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
  },
};

describe('calculateQuestionSlaDeadline', () => {
  it('usa exatamente 48 horas corridas quando o calendário está sempre aberto', () => {
    const paymentConfirmedAt = new Date('2026-08-24T09:00:00.000Z');

    const deadline = calculateQuestionSlaDeadline(
      paymentConfirmedAt,
      ALWAYS_OPEN_CALENDAR,
    );

    expect(deadline).toEqual(
      new Date(
        paymentConfirmedAt.getTime() + QUESTION_SLA_HOURS * 60 * 60 * 1000,
      ),
    );
  });

  it('pula fins de semana e conta somente minutos dentro do expediente configurado', () => {
    // Segunda-feira 09h (seção 11.1: referência é payment.confirmedAt).
    const paymentConfirmedAt = new Date('2026-08-24T09:00:00.000Z');

    const deadline = calculateQuestionSlaDeadline(
      paymentConfirmedAt,
      WEEKDAY_9_TO_18_CALENDAR,
    );

    // 9h úteis/dia × 5 dias (seg-sex) = 45h; restam 3h, consumidas na
    // segunda-feira seguinte a partir das 09h → prazo às 12h.
    expect(deadline).toEqual(new Date('2026-08-31T12:00:00.000Z'));
  });

  it('não inicia a contagem fora do expediente quando a confirmação ocorre num fim de semana', () => {
    // Sábado — fora do expediente; a contagem só deve começar na segunda seguinte.
    const paymentConfirmedAt = new Date('2026-08-22T12:00:00.000Z');

    const deadline = calculateQuestionSlaDeadline(
      paymentConfirmedAt,
      WEEKDAY_9_TO_18_CALENDAR,
    );

    // Igual ao caso partindo da segunda-feira 09h (mesma contagem de 48h úteis).
    expect(deadline).toEqual(new Date('2026-08-31T12:00:00.000Z'));
  });
});

describe('isQuestionSlaExceeded', () => {
  const paymentConfirmedAt = new Date('2026-08-24T09:00:00.000Z');

  it('retorna false antes do prazo', () => {
    const beforeDeadline = new Date(
      paymentConfirmedAt.getTime() + 47 * 60 * 60 * 1000,
    );

    expect(
      isQuestionSlaExceeded(
        paymentConfirmedAt,
        beforeDeadline,
        ALWAYS_OPEN_CALENDAR,
      ),
    ).toBe(false);
  });

  it('retorna true após o prazo', () => {
    const afterDeadline = new Date(
      paymentConfirmedAt.getTime() + 49 * 60 * 60 * 1000,
    );

    expect(
      isQuestionSlaExceeded(
        paymentConfirmedAt,
        afterDeadline,
        ALWAYS_OPEN_CALENDAR,
      ),
    ).toBe(true);
  });
});
