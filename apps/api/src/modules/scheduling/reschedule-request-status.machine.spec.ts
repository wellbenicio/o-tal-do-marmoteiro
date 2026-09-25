import { RescheduleRequestStatus } from '@marmoteiro/shared';
import {
  InvalidRescheduleRequestStatusTransitionError,
  canTransitionRescheduleRequestStatus,
  transitionRescheduleRequestStatus,
} from './reschedule-request-status.machine';

describe('reschedule-request-status.machine', () => {
  describe('transições válidas (docs/adr/0018-maquina-de-estado-do-atendimento.md)', () => {
    it('PENDING --CONFIRM--> CONFIRMED', () => {
      expect(
        transitionRescheduleRequestStatus(RescheduleRequestStatus.PENDING, {
          type: 'CONFIRM',
        }),
      ).toBe(RescheduleRequestStatus.CONFIRMED);
    });

    it('PENDING --EXPIRE--> EXPIRED', () => {
      expect(
        transitionRescheduleRequestStatus(RescheduleRequestStatus.PENDING, {
          type: 'EXPIRE',
        }),
      ).toBe(RescheduleRequestStatus.EXPIRED);
    });
  });

  describe('transições inválidas', () => {
    it.each([
      RescheduleRequestStatus.CONFIRMED,
      RescheduleRequestStatus.EXPIRED,
    ])('%s é terminal — não aceita nenhum evento', (terminalStatus) => {
      expect(
        canTransitionRescheduleRequestStatus(terminalStatus, {
          type: 'CONFIRM',
        }),
      ).toBe(false);
      expect(
        canTransitionRescheduleRequestStatus(terminalStatus, {
          type: 'EXPIRE',
        }),
      ).toBe(false);
    });

    it('lança InvalidRescheduleRequestStatusTransitionError em vez de aplicar silenciosamente', () => {
      expect(() =>
        transitionRescheduleRequestStatus(RescheduleRequestStatus.EXPIRED, {
          type: 'CONFIRM',
        }),
      ).toThrow(InvalidRescheduleRequestStatusTransitionError);
    });
  });
});
