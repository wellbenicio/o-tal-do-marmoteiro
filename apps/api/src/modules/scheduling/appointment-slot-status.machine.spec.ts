import { AppointmentSlotStatus } from '@marmoteiro/shared';
import {
  InvalidAppointmentSlotStatusTransitionError,
  canTransitionAppointmentSlotStatus,
  transitionAppointmentSlotStatus,
} from './appointment-slot-status.machine';

describe('appointment-slot-status.machine', () => {
  describe('transições válidas (docs/adr/0005-maquina-de-estado-do-slot-de-agenda.md)', () => {
    it('AVAILABLE --HOLD--> HELD', () => {
      expect(
        transitionAppointmentSlotStatus(AppointmentSlotStatus.AVAILABLE, {
          type: 'HOLD',
        }),
      ).toBe(AppointmentSlotStatus.HELD);
    });

    it('HELD --PAYMENT_APPROVED--> BOOKED', () => {
      expect(
        transitionAppointmentSlotStatus(AppointmentSlotStatus.HELD, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(AppointmentSlotStatus.BOOKED);
    });

    it('HELD --RELEASE--> AVAILABLE', () => {
      expect(
        transitionAppointmentSlotStatus(AppointmentSlotStatus.HELD, {
          type: 'RELEASE',
        }),
      ).toBe(AppointmentSlotStatus.AVAILABLE);
    });
  });

  describe('transições inválidas', () => {
    it('AVAILABLE não aceita PAYMENT_APPROVED nem RELEASE', () => {
      expect(
        canTransitionAppointmentSlotStatus(AppointmentSlotStatus.AVAILABLE, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(false);
      expect(
        canTransitionAppointmentSlotStatus(AppointmentSlotStatus.AVAILABLE, {
          type: 'RELEASE',
        }),
      ).toBe(false);
    });

    it('BOOKED é terminal — não aceita nenhum evento', () => {
      expect(
        canTransitionAppointmentSlotStatus(AppointmentSlotStatus.BOOKED, {
          type: 'HOLD',
        }),
      ).toBe(false);
      expect(
        canTransitionAppointmentSlotStatus(AppointmentSlotStatus.BOOKED, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(false);
      expect(
        canTransitionAppointmentSlotStatus(AppointmentSlotStatus.BOOKED, {
          type: 'RELEASE',
        }),
      ).toBe(false);
    });

    it('lança InvalidAppointmentSlotStatusTransitionError em vez de aplicar silenciosamente', () => {
      expect(() =>
        transitionAppointmentSlotStatus(AppointmentSlotStatus.BOOKED, {
          type: 'RELEASE',
        }),
      ).toThrow(InvalidAppointmentSlotStatusTransitionError);
      expect(() =>
        transitionAppointmentSlotStatus(AppointmentSlotStatus.AVAILABLE, {
          type: 'RELEASE',
        }),
      ).toThrow(InvalidAppointmentSlotStatusTransitionError);
    });
  });
});
