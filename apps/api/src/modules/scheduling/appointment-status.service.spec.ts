import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentStatus } from '@marmoteiro/shared';
import { AppointmentStatusService } from './appointment-status.service';
import { InvalidAppointmentStatusTransitionError } from './appointment-status.machine';

describe('AppointmentStatusService', () => {
  let service: AppointmentStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppointmentStatusService],
    }).compile();

    service = module.get(AppointmentStatusService);
  });

  it('agenda o atendimento quando o pagamento é aprovado', () => {
    expect(
      service.transition(AppointmentStatus.NOT_STARTED, {
        type: 'PAYMENT_APPROVED',
      }),
    ).toBe(AppointmentStatus.SCHEDULED);
  });

  it('reporta transições impossíveis sem lançar exceção via canTransition', () => {
    expect(
      service.canTransition(AppointmentStatus.NOT_STARTED, { type: 'CANCEL' }),
    ).toBe(false);
  });

  it('propaga InvalidAppointmentStatusTransitionError em transições inválidas', () => {
    expect(() =>
      service.transition(AppointmentStatus.NOT_STARTED, { type: 'CANCEL' }),
    ).toThrow(InvalidAppointmentStatusTransitionError);
  });
});
