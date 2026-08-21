import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@marmoteiro/shared';
import { OrderStatusService } from './order-status.service';
import { InvalidOrderStatusTransitionError } from './order-status.machine';

describe('OrderStatusService', () => {
  let service: OrderStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderStatusService],
    }).compile();

    service = module.get(OrderStatusService);
  });

  it('confirma o pedido quando o pagamento é aprovado', () => {
    expect(
      service.transition(OrderStatus.CREATED, { type: 'PAYMENT_APPROVED' }),
    ).toBe(OrderStatus.CONFIRMED);
  });

  it('reporta transições impossíveis sem lançar exceção via canTransition', () => {
    expect(
      service.canTransition(OrderStatus.CANCELLED, { type: 'CANCEL' }),
    ).toBe(false);
  });

  it('propaga InvalidOrderStatusTransitionError em transições inválidas', () => {
    expect(() =>
      service.transition(OrderStatus.CANCELLED, { type: 'PAYMENT_APPROVED' }),
    ).toThrow(InvalidOrderStatusTransitionError);
  });
});
