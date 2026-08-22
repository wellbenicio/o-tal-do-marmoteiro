import { Test, TestingModule } from '@nestjs/testing';
import { RefundDecisionType, ServiceOfferingType } from '@marmoteiro/shared';
import { RefundPolicyService } from './refund-policy.service';
import { InvalidRefundPolicyInputError } from './refund-policy';

describe('RefundPolicyService', () => {
  let service: RefundPolicyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefundPolicyService],
    }).compile();

    service = module.get(RefundPolicyService);
  });

  it('delega para o Refund Policy Engine e retorna a decisão calculada', () => {
    const contractedAt = new Date('2026-08-01T10:00:00.000Z');

    const result = service.evaluate({
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
      service.evaluate({
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
