import { PaymentStatus } from '@marmoteiro/shared';
import {
  InvalidPaymentStatusTransitionError,
  canTransitionPaymentStatus,
  transitionPaymentStatus,
} from './payment-status.machine';

describe('payment-status.machine', () => {
  describe('transições válidas (docs/adr/0004-maquina-de-estado-do-pagamento.md)', () => {
    it('PENDING --APPROVE--> APPROVED', () => {
      expect(
        transitionPaymentStatus(PaymentStatus.PENDING, { type: 'APPROVE' }),
      ).toBe(PaymentStatus.APPROVED);
    });

    it('PENDING --REJECT--> REJECTED', () => {
      expect(
        transitionPaymentStatus(PaymentStatus.PENDING, { type: 'REJECT' }),
      ).toBe(PaymentStatus.REJECTED);
    });

    it('PENDING --CANCEL--> CANCELLED', () => {
      expect(
        transitionPaymentStatus(PaymentStatus.PENDING, { type: 'CANCEL' }),
      ).toBe(PaymentStatus.CANCELLED);
    });

    it('APPROVED --REQUEST_REFUND--> REFUND_PENDING', () => {
      expect(
        transitionPaymentStatus(PaymentStatus.APPROVED, {
          type: 'REQUEST_REFUND',
        }),
      ).toBe(PaymentStatus.REFUND_PENDING);
    });

    it('REFUND_PENDING --CONFIRM_PARTIAL_REFUND--> PARTIALLY_REFUNDED', () => {
      expect(
        transitionPaymentStatus(PaymentStatus.REFUND_PENDING, {
          type: 'CONFIRM_PARTIAL_REFUND',
        }),
      ).toBe(PaymentStatus.PARTIALLY_REFUNDED);
    });

    it('REFUND_PENDING --CONFIRM_FULL_REFUND--> REFUNDED', () => {
      expect(
        transitionPaymentStatus(PaymentStatus.REFUND_PENDING, {
          type: 'CONFIRM_FULL_REFUND',
        }),
      ).toBe(PaymentStatus.REFUNDED);
    });
  });

  describe('transições inválidas', () => {
    it('APPROVED não aceita APPROVE, REJECT nem CANCEL', () => {
      expect(
        canTransitionPaymentStatus(PaymentStatus.APPROVED, {
          type: 'APPROVE',
        }),
      ).toBe(false);
      expect(
        canTransitionPaymentStatus(PaymentStatus.APPROVED, { type: 'REJECT' }),
      ).toBe(false);
      expect(
        canTransitionPaymentStatus(PaymentStatus.APPROVED, { type: 'CANCEL' }),
      ).toBe(false);
    });

    it('PENDING não aceita REQUEST_REFUND — reembolso exige aprovação prévia', () => {
      expect(
        canTransitionPaymentStatus(PaymentStatus.PENDING, {
          type: 'REQUEST_REFUND',
        }),
      ).toBe(false);
    });

    it.each([
      PaymentStatus.REJECTED,
      PaymentStatus.CANCELLED,
      PaymentStatus.PARTIALLY_REFUNDED,
      PaymentStatus.REFUNDED,
    ])('%s é terminal — não aceita nenhum evento', (terminalStatus) => {
      expect(
        canTransitionPaymentStatus(terminalStatus, { type: 'APPROVE' }),
      ).toBe(false);
      expect(
        canTransitionPaymentStatus(terminalStatus, {
          type: 'REQUEST_REFUND',
        }),
      ).toBe(false);
      expect(
        canTransitionPaymentStatus(terminalStatus, {
          type: 'CONFIRM_FULL_REFUND',
        }),
      ).toBe(false);
    });

    it('lança InvalidPaymentStatusTransitionError em vez de aplicar silenciosamente', () => {
      expect(() =>
        transitionPaymentStatus(PaymentStatus.CANCELLED, { type: 'APPROVE' }),
      ).toThrow(InvalidPaymentStatusTransitionError);
      expect(() =>
        transitionPaymentStatus(PaymentStatus.PENDING, {
          type: 'CONFIRM_FULL_REFUND',
        }),
      ).toThrow(InvalidPaymentStatusTransitionError);
    });
  });
});
