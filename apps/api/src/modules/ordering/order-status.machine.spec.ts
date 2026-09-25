import { OrderStatus } from '@marmoteiro/shared';
import {
  InvalidOrderStatusTransitionError,
  canTransitionOrderStatus,
  transitionOrderStatus,
} from './order-status.machine';

describe('order-status.machine', () => {
  describe('transições válidas (docs/adr/0017-maquina-de-estado-do-pedido.md)', () => {
    it('CREATED --PAYMENT_APPROVED--> CONFIRMED', () => {
      expect(
        transitionOrderStatus(OrderStatus.CREATED, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(OrderStatus.CONFIRMED);
    });

    it('CREATED --PAYMENT_DECLINED--> CANCELLED', () => {
      expect(
        transitionOrderStatus(OrderStatus.CREATED, {
          type: 'PAYMENT_DECLINED',
        }),
      ).toBe(OrderStatus.CANCELLED);
    });

    it('CONFIRMED --CANCEL--> CANCELLED', () => {
      expect(
        transitionOrderStatus(OrderStatus.CONFIRMED, { type: 'CANCEL' }),
      ).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('transições inválidas', () => {
    it('CONFIRMED não aceita PAYMENT_APPROVED nem PAYMENT_DECLINED', () => {
      expect(
        canTransitionOrderStatus(OrderStatus.CONFIRMED, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(false);
      expect(
        canTransitionOrderStatus(OrderStatus.CONFIRMED, {
          type: 'PAYMENT_DECLINED',
        }),
      ).toBe(false);
    });

    it('CANCELLED é terminal — não aceita nenhum evento', () => {
      expect(
        canTransitionOrderStatus(OrderStatus.CANCELLED, { type: 'CANCEL' }),
      ).toBe(false);
      expect(
        canTransitionOrderStatus(OrderStatus.CANCELLED, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(false);
    });

    it('lança InvalidOrderStatusTransitionError em vez de aplicar silenciosamente', () => {
      expect(() =>
        transitionOrderStatus(OrderStatus.CANCELLED, { type: 'CANCEL' }),
      ).toThrow(InvalidOrderStatusTransitionError);
      expect(() =>
        transitionOrderStatus(OrderStatus.CREATED, { type: 'CANCEL' }),
      ).toThrow(InvalidOrderStatusTransitionError);
    });
  });
});
