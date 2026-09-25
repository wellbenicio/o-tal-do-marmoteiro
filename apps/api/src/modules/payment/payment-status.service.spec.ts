import { Test, TestingModule } from '@nestjs/testing';
import { PaymentStatus } from '@marmoteiro/shared';
import { PaymentStatusService } from './payment-status.service';
import { InvalidPaymentStatusTransitionError } from './payment-status.machine';

describe('PaymentStatusService', () => {
  let service: PaymentStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentStatusService],
    }).compile();

    service = module.get(PaymentStatusService);
  });

  it('aprova o pagamento quando o provedor confirma via webhook', () => {
    expect(service.transition(PaymentStatus.PENDING, { type: 'APPROVE' })).toBe(
      PaymentStatus.APPROVED,
    );
  });

  it('encaminha para reembolso pendente após decisão do Refund Policy Engine', () => {
    expect(
      service.transition(PaymentStatus.APPROVED, {
        type: 'REQUEST_REFUND',
      }),
    ).toBe(PaymentStatus.REFUND_PENDING);
  });

  it('reporta transições impossíveis sem lançar exceção via canTransition', () => {
    expect(
      service.canTransition(PaymentStatus.REFUNDED, { type: 'APPROVE' }),
    ).toBe(false);
  });

  it('propaga InvalidPaymentStatusTransitionError em transições inválidas', () => {
    expect(() =>
      service.transition(PaymentStatus.REJECTED, { type: 'APPROVE' }),
    ).toThrow(InvalidPaymentStatusTransitionError);
  });
});
