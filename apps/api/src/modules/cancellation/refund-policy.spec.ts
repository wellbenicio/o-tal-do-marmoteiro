import { RefundDecisionType, ServiceOfferingType } from '@marmoteiro/shared';
import {
  InvalidRefundPolicyInputError,
  RefundPolicyInput,
  evaluateRefundPolicy,
} from './refund-policy';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const CONTRACTED_AT = new Date('2026-08-01T10:00:00.000Z');

function baseAppointmentInput(
  overrides: Partial<RefundPolicyInput> = {},
): RefundPolicyInput {
  return {
    modality: ServiceOfferingType.APPOINTMENT,
    contractedAt: CONTRACTED_AT,
    cancellationRequestedAt: new Date(CONTRACTED_AT.getTime() + 20 * DAY_MS),
    scheduledAt: new Date(CONTRACTED_AT.getTime() + 21 * DAY_MS),
    isServiceAlreadyRendered: false,
    totalPaidAmount: 100,
    ...overrides,
  };
}

function baseQuestionInput(
  overrides: Partial<RefundPolicyInput> = {},
): RefundPolicyInput {
  return {
    modality: ServiceOfferingType.QUESTION,
    contractedAt: CONTRACTED_AT,
    cancellationRequestedAt: new Date(CONTRACTED_AT.getTime() + 20 * DAY_MS),
    isServiceAlreadyRendered: false,
    totalPaidAmount: 100,
    ...overrides,
  };
}

describe('evaluateRefundPolicy', () => {
  describe('1. situação excepcional (seção 18)', () => {
    it('encaminha para MANUAL_REVIEW_REQUIRED mesmo quando o direito de arrependimento também se aplicaria', () => {
      const result = evaluateRefundPolicy(
        baseAppointmentInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 1 * DAY_MS,
          ),
          exceptionalCircumstanceReported: true,
        }),
      );

      expect(result).toEqual({
        decision: RefundDecisionType.MANUAL_REVIEW_REQUIRED,
        reasonCode: 'EXCEPTIONAL_CIRCUMSTANCE',
        refundAmount: 0,
        retainedAmount: 0,
      });
    });
  });

  describe('2. direito de arrependimento (seção 19.1, prazo de 7 dias)', () => {
    it('concede reembolso integral quando exercido dentro do prazo e o serviço ainda não foi prestado (seção 13.1/13.2)', () => {
      const result = evaluateRefundPolicy(
        baseQuestionInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 6 * DAY_MS,
          ),
          totalPaidAmount: 200,
        }),
      );

      expect(result).toEqual({
        decision: RefundDecisionType.FULL_REFUND,
        reasonCode: 'WITHDRAWAL_RIGHT',
        refundAmount: 200,
        retainedAmount: 0,
      });
    });

    it('inclui exatamente o sétimo dia dentro do prazo (limite inclusivo)', () => {
      const result = evaluateRefundPolicy(
        baseQuestionInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 7 * DAY_MS,
          ),
        }),
      );

      expect(result.decision).toBe(RefundDecisionType.FULL_REFUND);
      expect(result.reasonCode).toBe('WITHDRAWAL_RIGHT');
    });

    it('encaminha para MANUAL_REVIEW_REQUIRED quando o serviço já foi prestado (seção 13.3)', () => {
      const result = evaluateRefundPolicy(
        baseQuestionInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 3 * DAY_MS,
          ),
          isServiceAlreadyRendered: true,
        }),
      );

      expect(result).toEqual({
        decision: RefundDecisionType.MANUAL_REVIEW_REQUIRED,
        reasonCode: 'WITHDRAWAL_RIGHT',
        refundAmount: 0,
        retainedAmount: 0,
      });
    });

    it('encaminha para MANUAL_REVIEW_REQUIRED quando há no-show dentro do prazo de arrependimento', () => {
      const result = evaluateRefundPolicy(
        baseAppointmentInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 3 * DAY_MS,
          ),
          scheduledAt: new Date(CONTRACTED_AT.getTime() + 3 * DAY_MS),
          isNoShow: true,
        }),
      );

      expect(result.decision).toBe(RefundDecisionType.MANUAL_REVIEW_REQUIRED);
      expect(result.reasonCode).toBe('WITHDRAWAL_RIGHT');
    });

    it('não se aplica após o oitavo dia (fora do prazo legal)', () => {
      const result = evaluateRefundPolicy(
        baseQuestionInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 7 * DAY_MS + HOUR_MS,
          ),
        }),
      );

      expect(result.reasonCode).not.toBe('WITHDRAWAL_RIGHT');
    });
  });

  describe('3. reagendamento provocado pelo prestador (seção 15.7)', () => {
    it('concede reembolso integral quando o cliente opta pela restituição', () => {
      const result = evaluateRefundPolicy(
        baseAppointmentInput({ providerCausedRescheduleRefundChosen: true }),
      );

      expect(result).toEqual({
        decision: RefundDecisionType.FULL_REFUND,
        reasonCode: 'PROVIDER_RESCHEDULE',
        refundAmount: 100,
        retainedAmount: 0,
      });
    });

    it('prevalece sobre no-show quando ambos os sinalizadores são informados', () => {
      const result = evaluateRefundPolicy(
        baseAppointmentInput({
          providerCausedRescheduleRefundChosen: true,
          isNoShow: true,
        }),
      );

      expect(result.reasonCode).toBe('PROVIDER_RESCHEDULE');
    });
  });

  describe('4. no-show (seção 17.3)', () => {
    it('retém 50% e restitui 50%', () => {
      const result = evaluateRefundPolicy(
        baseAppointmentInput({ isNoShow: true, totalPaidAmount: 100 }),
      );

      expect(result).toEqual({
        decision: RefundDecisionType.PARTIAL_REFUND,
        reasonCode: 'NO_SHOW',
        refundAmount: 50,
        retainedAmount: 50,
      });
    });
  });

  describe('5. cancelamento tardio (seção 16)', () => {
    it('retém 30% e restitui 70% quando a antecedência é menor que 24 horas', () => {
      const result = evaluateRefundPolicy(
        baseAppointmentInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 20 * DAY_MS,
          ),
          scheduledAt: new Date(
            CONTRACTED_AT.getTime() + 20 * DAY_MS + 23 * HOUR_MS,
          ),
          totalPaidAmount: 100,
        }),
      );

      expect(result).toEqual({
        decision: RefundDecisionType.PARTIAL_REFUND,
        reasonCode: 'LATE_CANCELLATION',
        refundAmount: 70,
        retainedAmount: 30,
      });
    });

    it('não caracteriza cancelamento tardio quando a antecedência é de exatos 24 horas (limite exclusivo)', () => {
      const result = evaluateRefundPolicy(
        baseAppointmentInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 20 * DAY_MS,
          ),
          scheduledAt: new Date(
            CONTRACTED_AT.getTime() + 20 * DAY_MS + 24 * HOUR_MS,
          ),
        }),
      );

      expect(result.reasonCode).toBe('STANDARD_CANCELLATION');
    });

    it('nunca se aplica à Pergunta avulsa (sem scheduledAt)', () => {
      const result = evaluateRefundPolicy(
        baseQuestionInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 20 * DAY_MS,
          ),
        }),
      );

      expect(result.reasonCode).not.toBe('LATE_CANCELLATION');
    });
  });

  describe('6. serviço já prestado sem outra condição (seção 20.3)', () => {
    it('resulta em NO_REFUND quando não há direito legal, exceção ou no-show aplicável', () => {
      const result = evaluateRefundPolicy(
        baseQuestionInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 20 * DAY_MS,
          ),
          isServiceAlreadyRendered: true,
          totalPaidAmount: 150,
        }),
      );

      expect(result).toEqual({
        decision: RefundDecisionType.NO_REFUND,
        reasonCode: 'ALREADY_RENDERED',
        refundAmount: 0,
        retainedAmount: 150,
      });
    });
  });

  describe('7. padrão — cancelamento com antecedência, sem penalidade descrita', () => {
    it('concede reembolso integral por exclusão da regra de cancelamento tardio (seção 16.1)', () => {
      const result = evaluateRefundPolicy(
        baseAppointmentInput({
          cancellationRequestedAt: new Date(
            CONTRACTED_AT.getTime() + 20 * DAY_MS,
          ),
          scheduledAt: new Date(CONTRACTED_AT.getTime() + 27 * DAY_MS),
          totalPaidAmount: 80,
        }),
      );

      expect(result).toEqual({
        decision: RefundDecisionType.FULL_REFUND,
        reasonCode: 'STANDARD_CANCELLATION',
        refundAmount: 80,
        retainedAmount: 0,
      });
    });
  });

  describe('validação de entrada', () => {
    it('rejeita isNoShow para modalidade QUESTION', () => {
      expect(() =>
        evaluateRefundPolicy(baseQuestionInput({ isNoShow: true })),
      ).toThrow(InvalidRefundPolicyInputError);
    });

    it('rejeita providerCausedRescheduleRefundChosen para modalidade QUESTION', () => {
      expect(() =>
        evaluateRefundPolicy(
          baseQuestionInput({ providerCausedRescheduleRefundChosen: true }),
        ),
      ).toThrow(InvalidRefundPolicyInputError);
    });

    it('rejeita scheduledAt para modalidade QUESTION', () => {
      expect(() =>
        evaluateRefundPolicy(baseQuestionInput({ scheduledAt: new Date() })),
      ).toThrow(InvalidRefundPolicyInputError);
    });

    it('rejeita isServiceAlreadyRendered e isNoShow simultaneamente', () => {
      expect(() =>
        evaluateRefundPolicy(
          baseAppointmentInput({
            isServiceAlreadyRendered: true,
            isNoShow: true,
          }),
        ),
      ).toThrow(InvalidRefundPolicyInputError);
    });

    it('rejeita cancellationRequestedAt anterior a contractedAt', () => {
      expect(() =>
        evaluateRefundPolicy(
          baseAppointmentInput({
            cancellationRequestedAt: new Date(
              CONTRACTED_AT.getTime() - HOUR_MS,
            ),
          }),
        ),
      ).toThrow(InvalidRefundPolicyInputError);
    });

    it('rejeita totalPaidAmount negativo', () => {
      expect(() =>
        evaluateRefundPolicy(baseAppointmentInput({ totalPaidAmount: -1 })),
      ).toThrow(InvalidRefundPolicyInputError);
    });
  });
});
