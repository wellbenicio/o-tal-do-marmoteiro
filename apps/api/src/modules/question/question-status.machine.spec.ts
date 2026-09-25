import { QuestionStatus } from '@marmoteiro/shared';
import {
  InvalidQuestionStatusTransitionError,
  canTransitionQuestionStatus,
  transitionQuestionStatus,
} from './question-status.machine';

describe('question-status.machine', () => {
  describe('fluxo principal (docs/adr/0006-maquina-de-estado-da-pergunta-avulsa.md)', () => {
    it('CREATED --PROCEED_TO_PAYMENT--> AWAITING_PAYMENT', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.CREATED, {
          type: 'PROCEED_TO_PAYMENT',
        }),
      ).toBe(QuestionStatus.AWAITING_PAYMENT);
    });

    it('AWAITING_PAYMENT --PAYMENT_APPROVED--> PAID', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.AWAITING_PAYMENT, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(QuestionStatus.PAID);
    });

    it('PAID --ENTER_QUEUE--> QUEUED', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.PAID, {
          type: 'ENTER_QUEUE',
        }),
      ).toBe(QuestionStatus.QUEUED);
    });

    it('QUEUED --START_EXECUTION--> IN_PROGRESS', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.QUEUED, {
          type: 'START_EXECUTION',
        }),
      ).toBe(QuestionStatus.IN_PROGRESS);
    });

    it('IN_PROGRESS --MARK_DELIVERED--> DELIVERED', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.IN_PROGRESS, {
          type: 'MARK_DELIVERED',
        }),
      ).toBe(QuestionStatus.DELIVERED);
    });

    it('DELIVERED --COMPLETE--> COMPLETED', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.DELIVERED, {
          type: 'COMPLETE',
        }),
      ).toBe(QuestionStatus.COMPLETED);
    });
  });

  describe('pagamento não aprovado (seção 11.3, espelha OrderStatus)', () => {
    it('AWAITING_PAYMENT --PAYMENT_DECLINED--> CANCELLED', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.AWAITING_PAYMENT, {
          type: 'PAYMENT_DECLINED',
        }),
      ).toBe(QuestionStatus.CANCELLED);
    });
  });

  describe('cancelamento em fila ou em execução (seção 13.1–13.2)', () => {
    it('QUEUED --REQUEST_CANCELLATION--> CANCELLATION_REQUESTED', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.QUEUED, {
          type: 'REQUEST_CANCELLATION',
        }),
      ).toBe(QuestionStatus.CANCELLATION_REQUESTED);
    });

    it('IN_PROGRESS --REQUEST_CANCELLATION--> CANCELLATION_REQUESTED', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.IN_PROGRESS, {
          type: 'REQUEST_CANCELLATION',
        }),
      ).toBe(QuestionStatus.CANCELLATION_REQUESTED);
    });

    it('CANCELLATION_REQUESTED --CONFIRM_CANCELLATION--> CANCELLED', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.CANCELLATION_REQUESTED, {
          type: 'CONFIRM_CANCELLATION',
        }),
      ).toBe(QuestionStatus.CANCELLED);
    });

    it('CANCELLED --REQUEST_REFUND--> REFUND_PENDING --CONFIRM_REFUND--> REFUNDED', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.CANCELLED, {
          type: 'REQUEST_REFUND',
        }),
      ).toBe(QuestionStatus.REFUND_PENDING);
      expect(
        transitionQuestionStatus(QuestionStatus.REFUND_PENDING, {
          type: 'CONFIRM_REFUND',
        }),
      ).toBe(QuestionStatus.REFUNDED);
    });
  });

  describe('pedido de cancelamento após entrega (seção 13.3)', () => {
    it('DELIVERED --REQUEST_CANCELLATION--> MANUAL_REVIEW (nunca CANCELLATION_REQUESTED)', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.DELIVERED, {
          type: 'REQUEST_CANCELLATION',
        }),
      ).toBe(QuestionStatus.MANUAL_REVIEW);
    });

    it('MANUAL_REVIEW --REQUEST_REFUND--> REFUND_PENDING (aprovado, sem passar por CANCELLED)', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.MANUAL_REVIEW, {
          type: 'REQUEST_REFUND',
        }),
      ).toBe(QuestionStatus.REFUND_PENDING);
    });

    it('MANUAL_REVIEW --REJECT_CANCELLATION--> DELIVERED (negado, permanece entregue)', () => {
      expect(
        transitionQuestionStatus(QuestionStatus.MANUAL_REVIEW, {
          type: 'REJECT_CANCELLATION',
        }),
      ).toBe(QuestionStatus.DELIVERED);
    });

    it('DELIVERED continua aceitando COMPLETE após negativa de MANUAL_REVIEW', () => {
      const afterRejection = transitionQuestionStatus(
        QuestionStatus.MANUAL_REVIEW,
        { type: 'REJECT_CANCELLATION' },
      );
      expect(
        transitionQuestionStatus(afterRejection, { type: 'COMPLETE' }),
      ).toBe(QuestionStatus.COMPLETED);
    });
  });

  describe('transições inválidas', () => {
    it('CREATED não aceita eventos além de PROCEED_TO_PAYMENT', () => {
      expect(
        canTransitionQuestionStatus(QuestionStatus.CREATED, {
          type: 'PAYMENT_APPROVED',
        }),
      ).toBe(false);
      expect(
        canTransitionQuestionStatus(QuestionStatus.CREATED, {
          type: 'REQUEST_CANCELLATION',
        }),
      ).toBe(false);
    });

    it('CANCELLED não aceita nenhum evento além de REQUEST_REFUND', () => {
      expect(
        canTransitionQuestionStatus(QuestionStatus.CANCELLED, {
          type: 'CONFIRM_CANCELLATION',
        }),
      ).toBe(false);
      expect(
        canTransitionQuestionStatus(QuestionStatus.CANCELLED, {
          type: 'CONFIRM_REFUND',
        }),
      ).toBe(false);
    });

    it.each([QuestionStatus.COMPLETED, QuestionStatus.REFUNDED])(
      '%s é terminal — não aceita nenhum evento',
      (terminalStatus) => {
        expect(
          canTransitionQuestionStatus(terminalStatus, {
            type: 'REQUEST_REFUND',
          }),
        ).toBe(false);
        expect(
          canTransitionQuestionStatus(terminalStatus, { type: 'COMPLETE' }),
        ).toBe(false);
      },
    );

    it('lança InvalidQuestionStatusTransitionError em vez de aplicar silenciosamente', () => {
      expect(() =>
        transitionQuestionStatus(QuestionStatus.COMPLETED, {
          type: 'REQUEST_CANCELLATION',
        }),
      ).toThrow(InvalidQuestionStatusTransitionError);
      expect(() =>
        transitionQuestionStatus(QuestionStatus.CREATED, {
          type: 'ENTER_QUEUE',
        }),
      ).toThrow(InvalidQuestionStatusTransitionError);
    });
  });
});
