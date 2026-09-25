import { Test, TestingModule } from '@nestjs/testing';
import { BusinessHoursCalendar } from './question-sla';
import { QuestionSlaService } from './question-sla.service';

const ALWAYS_OPEN_CALENDAR: BusinessHoursCalendar = {
  isWithinBusinessHours: () => true,
};

describe('QuestionSlaService', () => {
  let service: QuestionSlaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionSlaService],
    }).compile();

    service = module.get(QuestionSlaService);
  });

  it('delega o cálculo do prazo para calculateQuestionSlaDeadline', () => {
    const paymentConfirmedAt = new Date('2026-08-24T09:00:00.000Z');

    const deadline = service.calculateDeadline(
      paymentConfirmedAt,
      ALWAYS_OPEN_CALENDAR,
    );

    expect(deadline).toEqual(new Date('2026-08-26T09:00:00.000Z'));
  });

  it('delega a verificação de estouro para isQuestionSlaExceeded', () => {
    const paymentConfirmedAt = new Date('2026-08-24T09:00:00.000Z');
    const now = new Date('2026-08-27T00:00:00.000Z');

    expect(
      service.isExceeded(paymentConfirmedAt, now, ALWAYS_OPEN_CALENDAR),
    ).toBe(true);
  });
});
