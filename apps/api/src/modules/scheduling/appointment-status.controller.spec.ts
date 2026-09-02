import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentStatus } from '@marmoteiro/shared';
import { AppointmentStatusController } from './appointment-status.controller';
import { AppointmentStatusService } from './appointment-status.service';
import { InvalidAppointmentStatusTransitionError } from './appointment-status.machine';

describe('AppointmentStatusController', () => {
  let controller: AppointmentStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentStatusController],
      providers: [AppointmentStatusService],
    }).compile();

    controller = module.get(AppointmentStatusController);
  });

  it('reporta se a transição é possível sem lançar exceção', () => {
    expect(
      controller.canTransition({
        currentStatus: AppointmentStatus.COMPLETED,
        event: { type: 'CANCEL' },
      }),
    ).toEqual({ canTransition: false });
  });

  it('aplica a transição e retorna o novo status', () => {
    expect(
      controller.transition({
        currentStatus: AppointmentStatus.NOT_STARTED,
        event: { type: 'PAYMENT_APPROVED' },
      }),
    ).toEqual({ status: AppointmentStatus.SCHEDULED });
  });

  it('propaga InvalidAppointmentStatusTransitionError em transições inválidas', () => {
    expect(() =>
      controller.transition({
        currentStatus: AppointmentStatus.COMPLETED,
        event: { type: 'CANCEL' },
      }),
    ).toThrow(InvalidAppointmentStatusTransitionError);
  });
});
