import { AppointmentStatus } from '@marmoteiro/shared';
import {
  InvalidAppointmentStatusTransitionError,
  canTransitionAppointmentStatus,
  transitionAppointmentStatus,
} from './appointment-status.machine';

describe('appointment-status.machine', () => {
  describe('transições válidas (docs/adr/0018-maquina-de-estado-do-atendimento.md)', () => {
    it('NOT_STARTED --PAYMENT_APPROVED--> SCHEDULED', () => {
      expect(
        transitionAppointmentStatus(AppointmentStatus.NOT_STARTED, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(AppointmentStatus.SCHEDULED);
    });

    it('SCHEDULED --COMPLETE--> COMPLETED', () => {
      expect(
        transitionAppointmentStatus(AppointmentStatus.SCHEDULED, {
          type: 'COMPLETE',
        }),
      ).toBe(AppointmentStatus.COMPLETED);
    });

    it('SCHEDULED --NO_SHOW--> NO_SHOW', () => {
      expect(
        transitionAppointmentStatus(AppointmentStatus.SCHEDULED, {
          type: 'NO_SHOW',
        }),
      ).toBe(AppointmentStatus.NO_SHOW);
    });

    it('SCHEDULED --CANCEL--> CANCELLED', () => {
      expect(
        transitionAppointmentStatus(AppointmentStatus.SCHEDULED, {
          type: 'CANCEL',
        }),
      ).toBe(AppointmentStatus.CANCELLED);
    });
  });

  describe('transições inválidas', () => {
    it('NOT_STARTED não aceita CANCEL — o valor simplesmente nunca avança (nota da ADR 0018)', () => {
      expect(
        canTransitionAppointmentStatus(AppointmentStatus.NOT_STARTED, {
          type: 'CANCEL',
        }),
      ).toBe(false);
    });

    it('NOT_STARTED não aceita COMPLETE nem NO_SHOW', () => {
      expect(
        canTransitionAppointmentStatus(AppointmentStatus.NOT_STARTED, {
          type: 'COMPLETE',
        }),
      ).toBe(false);
      expect(
        canTransitionAppointmentStatus(AppointmentStatus.NOT_STARTED, {
          type: 'NO_SHOW',
        }),
      ).toBe(false);
    });

    it.each([
      AppointmentStatus.COMPLETED,
      AppointmentStatus.NO_SHOW,
      AppointmentStatus.CANCELLED,
    ])('%s é terminal — não aceita nenhum evento', (terminalStatus) => {
      expect(
        canTransitionAppointmentStatus(terminalStatus, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(false);
      expect(
        canTransitionAppointmentStatus(terminalStatus, { type: 'COMPLETE' }),
      ).toBe(false);
      expect(
        canTransitionAppointmentStatus(terminalStatus, { type: 'NO_SHOW' }),
      ).toBe(false);
      expect(
        canTransitionAppointmentStatus(terminalStatus, { type: 'CANCEL' }),
      ).toBe(false);
    });

    it('lança InvalidAppointmentStatusTransitionError em vez de aplicar silenciosamente', () => {
      expect(() =>
        transitionAppointmentStatus(AppointmentStatus.NOT_STARTED, {
          type: 'CANCEL',
        }),
      ).toThrow(InvalidAppointmentStatusTransitionError);
      expect(() =>
        transitionAppointmentStatus(AppointmentStatus.COMPLETED, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toThrow(InvalidAppointmentStatusTransitionError);
    });
  });
});
