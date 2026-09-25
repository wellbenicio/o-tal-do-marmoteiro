import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatus } from '@marmoteiro/shared';
import { OrderStatusController } from './order-status.controller';
import { OrderStatusService } from './order-status.service';
import { InvalidOrderStatusTransitionError } from './order-status.machine';

describe('OrderStatusController', () => {
  let controller: OrderStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderStatusController],
      providers: [OrderStatusService],
    }).compile();

    controller = module.get(OrderStatusController);
  });

  it('reporta se a transição é possível sem lançar exceção', () => {
    expect(
      controller.canTransition({
        currentStatus: OrderStatus.CANCELLED,
        event: { type: 'CANCEL' },
      }),
    ).toEqual({ canTransition: false });
  });

  it('aplica a transição e retorna o novo status', () => {
    expect(
      controller.transition({
        currentStatus: OrderStatus.CREATED,
        event: { type: 'PAYMENT_APPROVED' },
      }),
    ).toEqual({ status: OrderStatus.CONFIRMED });
  });

  it('propaga InvalidOrderStatusTransitionError em transições inválidas', () => {
    expect(() =>
      controller.transition({
        currentStatus: OrderStatus.CANCELLED,
        event: { type: 'PAYMENT_APPROVED' },
      }),
    ).toThrow(InvalidOrderStatusTransitionError);
  });
});
