import { Test, TestingModule } from '@nestjs/testing';
import { RefundDecisionType, ServiceOfferingType } from '@marmoteiro/shared';
import { RefundPolicyController } from './refund-policy.controller';
import { RefundPolicyService } from './refund-policy.service';
import { InvalidRefundPolicyInputError } from './refund-policy';

describe('RefundPolicyController', () => {
  let controller: RefundPolicyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefundPolicyController],
      providers: [RefundPolicyService],
    }).compile();

    controller = module.get(RefundPolicyController);
  });

  it('avalia o Refund Policy Engine e retorna a decisão calculada', () => {
    const contractedAt = new Date('2026-08-01T10:00:00.000Z');

    const result = controller.evaluate({
      modality: ServiceOfferingType.QUESTION,
      contractedAt,
      cancellationRequestedAt: contractedAt,
      isServiceAlreadyRendered: false,
      totalPaidAmount: 100,
    });

    expect(result.decision).toBe(RefundDecisionType.FULL_REFUND);
    expect(result.reasonCode).toBe('WITHDRAWAL_RIGHT');
  });

  it('propaga InvalidRefundPolicyInputError para entradas inconsistentes', () => {
    const contractedAt = new Date('2026-08-01T10:00:00.000Z');

    expect(() =>
      controller.evaluate({
        modality: ServiceOfferingType.QUESTION,
        contractedAt,
        cancellationRequestedAt: contractedAt,
        isServiceAlreadyRendered: false,
        totalPaidAmount: 100,
        isNoShow: true,
      }),
    ).toThrow(InvalidRefundPolicyInputError);
  });
});
