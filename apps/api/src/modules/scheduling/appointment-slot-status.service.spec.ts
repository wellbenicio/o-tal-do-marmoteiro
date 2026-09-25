import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentSlotStatus } from '@marmoteiro/shared';
import { AppointmentSlotStatusService } from './appointment-slot-status.service';
import { InvalidAppointmentSlotStatusTransitionError } from './appointment-slot-status.machine';

describe('AppointmentSlotStatusService', () => {
  let service: AppointmentSlotStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentSlotStatusService],
    }).compile();

    service = module.get(AppointmentSlotStatusService);
  });

  it('reserva o horário quando o cliente inicia o checkout', () => {
    expect(
      service.transition(AppointmentSlotStatus.AVAILABLE, { type: 'HOLD' }),
    ).toBe(AppointmentSlotStatus.HELD);
  });

  it('libera o horário retido quando o hold expira/é abandonado', () => {
    expect(
      service.transition(AppointmentSlotStatus.HELD, { type: 'RELEASE' }),
    ).toBe(AppointmentSlotStatus.AVAILABLE);
  });

  it('reporta transições impossíveis sem lançar exceção via canTransition', () => {
    expect(
      service.canTransition(AppointmentSlotStatus.BOOKED, { type: 'HOLD' }),
    ).toBe(false);
  });

  it('propaga InvalidAppointmentSlotStatusTransitionError em transições inválidas', () => {
    expect(() =>
      service.transition(AppointmentSlotStatus.AVAILABLE, {
        type: 'PAYMENT_APPROVED',
      }),
    ).toThrow(InvalidAppointmentSlotStatusTransitionError);
  });
});
