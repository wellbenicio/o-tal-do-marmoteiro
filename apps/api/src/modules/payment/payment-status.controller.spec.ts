import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatus } from '@marmoteiro/shared';
import { PaymentStatusController } from './payment-status.controller';
import { PaymentStatusService } from './payment-status.service';
import { InvalidPaymentStatusTransitionError } from './payment-status.machine';

describe('PaymentStatusController', () => {
  let controller: PaymentStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentStatusController],
      providers: [PaymentStatusService],
    }).compile();

    controller = module.get(PaymentStatusController);
  });

  it('reporta se a transição é possível sem lançar exceção', () => {
    expect(
      controller.canTransition({
        currentStatus: PaymentStatus.REFUNDED,
        event: { type: 'APPROVE' },
      }),
    ).toEqual({ canTransition: false });
  });

  it('aplica a transição e retorna o novo status', () => {
    expect(
      controller.transition({
        currentStatus: PaymentStatus.PENDING,
        event: { type: 'APPROVE' },
      }),
    ).toEqual({ status: PaymentStatus.APPROVED });
  });

  it('propaga InvalidPaymentStatusTransitionError em transições inválidas', () => {
    expect(() =>
      controller.transition({
        currentStatus: PaymentStatus.REJECTED,
        event: { type: 'APPROVE' },
      }),
    ).toThrow(InvalidPaymentStatusTransitionError);
  });
});
