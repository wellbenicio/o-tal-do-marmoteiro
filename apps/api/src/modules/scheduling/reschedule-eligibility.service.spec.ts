import { Test, TestingModule } from '@nestjs/testing';
import { RescheduleEligibilityService } from './reschedule-eligibility.service';

describe('RescheduleEligibilityService', () => {
  let service: RescheduleEligibilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RescheduleEligibilityService],
    }).compile();

    service = module.get(RescheduleEligibilityService);
  });

  it('delega a avaliação de elegibilidade para evaluateCustomerRescheduleEligibility', () => {
    const result = service.evaluateCustomerEligibility({
      scheduledAt: new Date('2026-09-01T10:00:00.000Z'),
      requestedAt: new Date('2026-08-25T10:00:00.000Z'),
      rescheduleUsed: false,
    });

    expect(result).toEqual({ eligible: true, reasonCode: 'ELIGIBLE' });
  });

  it('delega o cálculo do prazo para calculateRescheduleOptionsExpireAt', () => {
    const optionsPresentedAt = new Date('2026-08-24T09:00:00.000Z');

    expect(service.calculateOptionsExpireAt(optionsPresentedAt)).toEqual(
      new Date('2026-08-26T09:00:00.000Z'),
    );
  });

  it('delega a verificação de expiração para isRescheduleChoiceExpired', () => {
    const optionsExpireAt = new Date('2026-08-26T09:00:00.000Z');
    const now = new Date('2026-08-27T00:00:00.000Z');

    expect(service.isChoiceExpired(optionsExpireAt, now)).toBe(true);
  });
});
