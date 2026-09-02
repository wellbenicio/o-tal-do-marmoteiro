import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentSlotStatus } from '@marmoteiro/shared';
import { AppointmentSlotStatusController } from './appointment-slot-status.controller';
import { AppointmentSlotStatusService } from './appointment-slot-status.service';
import { InvalidAppointmentSlotStatusTransitionError } from './appointment-slot-status.machine';

describe('AppointmentSlotStatusController', () => {
  let controller: AppointmentSlotStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentSlotStatusController],
      providers: [AppointmentSlotStatusService],
    }).compile();

    controller = module.get(AppointmentSlotStatusController);
  });

  it('reporta se a transição é possível sem lançar exceção', () => {
    expect(
      controller.canTransition({
        currentStatus: AppointmentSlotStatus.BOOKED,
        event: { type: 'HOLD' },
      }),
    ).toEqual({ canTransition: false });
  });

  it('aplica a transição e retorna o novo status', () => {
    expect(
      controller.transition({
        currentStatus: AppointmentSlotStatus.AVAILABLE,
        event: { type: 'HOLD' },
      }),
    ).toEqual({ status: AppointmentSlotStatus.HELD });
  });

  it('propaga InvalidAppointmentSlotStatusTransitionError em transições inválidas', () => {
    expect(() =>
      controller.transition({
        currentStatus: AppointmentSlotStatus.BOOKED,
        event: { type: 'HOLD' },
      }),
    ).toThrow(InvalidAppointmentSlotStatusTransitionError);
  });
});
