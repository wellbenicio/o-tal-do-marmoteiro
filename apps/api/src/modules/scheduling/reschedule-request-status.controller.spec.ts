import { Test, TestingModule } from '@nestjs/testing';
import { RescheduleRequestStatus } from '@marmoteiro/shared';
import { RescheduleRequestStatusController } from './reschedule-request-status.controller';
import { RescheduleRequestStatusService } from './reschedule-request-status.service';
import { InvalidRescheduleRequestStatusTransitionError } from './reschedule-request-status.machine';

describe('RescheduleRequestStatusController', () => {
  let controller: RescheduleRequestStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RescheduleRequestStatusController],
      providers: [RescheduleRequestStatusService],
    }).compile();

    controller = module.get(RescheduleRequestStatusController);
  });

  it('reporta se a transição é possível sem lançar exceção', () => {
    expect(
      controller.canTransition({
        currentStatus: RescheduleRequestStatus.CONFIRMED,
        event: { type: 'EXPIRE' },
      }),
    ).toEqual({ canTransition: false });
  });

  it('aplica a transição e retorna o novo status', () => {
    expect(
      controller.transition({
        currentStatus: RescheduleRequestStatus.PENDING,
        event: { type: 'CONFIRM' },
      }),
    ).toEqual({ status: RescheduleRequestStatus.CONFIRMED });
  });

  it('propaga InvalidRescheduleRequestStatusTransitionError em transições inválidas', () => {
    expect(() =>
      controller.transition({
        currentStatus: RescheduleRequestStatus.CONFIRMED,
        event: { type: 'EXPIRE' },
      }),
    ).toThrow(InvalidRescheduleRequestStatusTransitionError);
  });
});
