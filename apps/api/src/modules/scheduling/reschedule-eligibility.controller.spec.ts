import { Test, TestingModule } from '@nestjs/testing';
import { RescheduleEligibilityController } from './reschedule-eligibility.controller';
import { RescheduleEligibilityService } from './reschedule-eligibility.service';

describe('RescheduleEligibilityController', () => {
  let controller: RescheduleEligibilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RescheduleEligibilityController],
      providers: [RescheduleEligibilityService],
    }).compile();

    controller = module.get(RescheduleEligibilityController);
  });

  it('avalia a elegibilidade do consulente', () => {
    const result = controller.evaluate({
      scheduledAt: new Date('2026-09-01T10:00:00.000Z'),
      requestedAt: new Date('2026-08-25T10:00:00.000Z'),
      rescheduleUsed: false,
    });

    expect(result).toEqual({ eligible: true, reasonCode: 'ELIGIBLE' });
  });

  it('calcula o prazo-limite de escolha das opções', () => {
    const optionsPresentedAt = new Date('2026-08-24T09:00:00.000Z');

    expect(controller.calculateOptionsExpireAt({ optionsPresentedAt })).toEqual(
      { optionsExpireAt: new Date('2026-08-26T09:00:00.000Z') },
    );
  });

  it('verifica se o prazo de escolha já expirou', () => {
    const optionsExpireAt = new Date('2026-08-26T09:00:00.000Z');
    const now = new Date('2026-08-27T00:00:00.000Z');

    expect(controller.isChoiceExpired({ optionsExpireAt, now })).toEqual({
      expired: true,
    });
  });
});
