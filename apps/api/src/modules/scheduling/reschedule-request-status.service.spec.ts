import { Test, TestingModule } from '@nestjs/testing';
import { RescheduleRequestStatus } from '@marmoteiro/shared';
import { RescheduleRequestStatusService } from './reschedule-request-status.service';
import { InvalidRescheduleRequestStatusTransitionError } from './reschedule-request-status.machine';

describe('RescheduleRequestStatusService', () => {
  let service: RescheduleRequestStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RescheduleRequestStatusService],
    }).compile();

    service = module.get(RescheduleRequestStatusService);
  });

  it('confirma a solicitação quando o cliente escolhe o novo horário', () => {
    expect(
      service.transition(RescheduleRequestStatus.PENDING, { type: 'CONFIRM' }),
    ).toBe(RescheduleRequestStatus.CONFIRMED);
  });

  it('reporta transições impossíveis sem lançar exceção via canTransition', () => {
    expect(
      service.canTransition(RescheduleRequestStatus.EXPIRED, {
        type: 'CONFIRM',
      }),
    ).toBe(false);
  });

  it('propaga InvalidRescheduleRequestStatusTransitionError em transições inválidas', () => {
    expect(() =>
      service.transition(RescheduleRequestStatus.EXPIRED, { type: 'CONFIRM' }),
    ).toThrow(InvalidRescheduleRequestStatusTransitionError);
  });
});
