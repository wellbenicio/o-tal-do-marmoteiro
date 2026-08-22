import { createMachine, transition } from 'xstate';
import { QuestionStatus } from '@marmoteiro/shared';

/**
 * Máquina de estado da Pergunta Avulsa (XState — ver ADR 0001, seção
 * "Máquinas de estado"). Estados e transições definidos em
 * docs/adr/0006-maquina-de-estado-da-pergunta-avulsa.md:
 *
 * CREATED               --PROCEED_TO_PAYMENT-->    AWAITING_PAYMENT
 * AWAITING_PAYMENT       --PAYMENT_APPROVED-->      PAID
 * AWAITING_PAYMENT       --PAYMENT_DECLINED-->      CANCELLED
 * PAID                   --ENTER_QUEUE-->           QUEUED
 * QUEUED                 --START_EXECUTION-->       IN_PROGRESS
 * QUEUED                 --REQUEST_CANCELLATION-->  CANCELLATION_REQUESTED
 * IN_PROGRESS            --MARK_DELIVERED-->        DELIVERED
 * IN_PROGRESS            --REQUEST_CANCELLATION-->  CANCELLATION_REQUESTED
 * DELIVERED              --COMPLETE-->               COMPLETED
 * DELIVERED              --REQUEST_CANCELLATION-->  MANUAL_REVIEW
 * CANCELLATION_REQUESTED --CONFIRM_CANCELLATION-->  CANCELLED
 * CANCELLED              --REQUEST_REFUND-->        REFUND_PENDING
 * REFUND_PENDING         --CONFIRM_REFUND-->         REFUNDED
 * MANUAL_REVIEW          --REQUEST_REFUND-->        REFUND_PENDING
 * MANUAL_REVIEW          --REJECT_CANCELLATION-->   DELIVERED
 *
 * COMPLETED e REFUNDED são terminais. CANCELLED permanece estável quando
 * nenhum reembolso é devido (ver nota da ADR 0006).
 */
export type QuestionStatusEvent =
  /** Cliente avança para o pagamento no checkout. */
  | { type: 'PROCEED_TO_PAYMENT' }
  /** Webhook do provedor confirma o pagamento (seção 11.1). */
  | { type: 'PAYMENT_APPROVED' }
  /** Pagamento rejeitado, cancelado ou abandonado antes da aprovação. */
  | { type: 'PAYMENT_DECLINED' }
  /** Entrada automática na fila operacional (seção 11.4). */
  | { type: 'ENTER_QUEUE' }
  /** Ação administrativa "Iniciar atendimento" (seção 11.5). */
  | { type: 'START_EXECUTION' }
  /** Cliente solicita cancelamento (QUEUED/IN_PROGRESS: seção 13.1–13.2) ou
   *  pedido de cancelamento/arrependimento após entrega (DELIVERED: seção
   *  13.3) — o alvo depende do estado de origem. */
  | { type: 'REQUEST_CANCELLATION' }
  /** Ação administrativa "Marcar como entregue" (seção 11.6). */
  | { type: 'MARK_DELIVERED' }
  /** Ação administrativa "concluir" (seção 11.7; seção 23.4). */
  | { type: 'COMPLETE' }
  /** Ação administrativa "cancelar" confirma o cancelamento (seção 23.4). */
  | { type: 'CONFIRM_CANCELLATION' }
  /** Reembolso integral solicitado ao provedor (seção 13.1–13.2), ou
   *  aprovado após revisão manual (seção 13.3). */
  | { type: 'REQUEST_REFUND' }
  /** Provedor confirma o processamento do reembolso. */
  | { type: 'CONFIRM_REFUND' }
  /** Administrador nega o pedido de cancelamento/reembolso após revisão
   *  manual — o atendimento permanece entregue (seção 13.3). */
  | { type: 'REJECT_CANCELLATION' };

export const questionStatusMachine = createMachine({
  id: 'questionStatus',
  initial: QuestionStatus.CREATED,
  states: {
    [QuestionStatus.CREATED]: {
      on: {
        PROCEED_TO_PAYMENT: QuestionStatus.AWAITING_PAYMENT,
      },
    },
    [QuestionStatus.AWAITING_PAYMENT]: {
      on: {
        PAYMENT_APPROVED: QuestionStatus.PAID,
        PAYMENT_DECLINED: QuestionStatus.CANCELLED,
      },
    },
    [QuestionStatus.PAID]: {
      on: {
        ENTER_QUEUE: QuestionStatus.QUEUED,
      },
    },
    [QuestionStatus.QUEUED]: {
      on: {
        START_EXECUTION: QuestionStatus.IN_PROGRESS,
        REQUEST_CANCELLATION: QuestionStatus.CANCELLATION_REQUESTED,
      },
    },
    [QuestionStatus.IN_PROGRESS]: {
      on: {
        MARK_DELIVERED: QuestionStatus.DELIVERED,
        REQUEST_CANCELLATION: QuestionStatus.CANCELLATION_REQUESTED,
      },
    },
    [QuestionStatus.DELIVERED]: {
      on: {
        COMPLETE: QuestionStatus.COMPLETED,
        REQUEST_CANCELLATION: QuestionStatus.MANUAL_REVIEW,
      },
    },
    [QuestionStatus.COMPLETED]: {},
    [QuestionStatus.CANCELLATION_REQUESTED]: {
      on: {
        CONFIRM_CANCELLATION: QuestionStatus.CANCELLED,
      },
    },
    [QuestionStatus.CANCELLED]: {
      on: {
        REQUEST_REFUND: QuestionStatus.REFUND_PENDING,
      },
    },
    [QuestionStatus.REFUND_PENDING]: {
      on: {
        CONFIRM_REFUND: QuestionStatus.REFUNDED,
      },
    },
    [QuestionStatus.REFUNDED]: {},
    [QuestionStatus.MANUAL_REVIEW]: {
      on: {
        REQUEST_REFUND: QuestionStatus.REFUND_PENDING,
        REJECT_CANCELLATION: QuestionStatus.DELIVERED,
      },
    },
  },
});

/** Erro lançado ao tentar aplicar uma transição não permitida pela ADR 0006. */
export class InvalidQuestionStatusTransitionError extends Error {
  constructor(
    public readonly currentStatus: QuestionStatus,
    public readonly event: QuestionStatusEvent['type'],
  ) {
    super(
      `Transição inválida da Pergunta Avulsa: evento "${event}" não é permitido a partir do estado "${currentStatus}" (ver docs/adr/0006-maquina-de-estado-da-pergunta-avulsa.md).`,
    );
    this.name = 'InvalidQuestionStatusTransitionError';
  }
}

/** Indica se o evento representa uma transição válida a partir do estado atual. */
export function canTransitionQuestionStatus(
  currentStatus: QuestionStatus,
  event: QuestionStatusEvent,
): boolean {
  return questionStatusMachine
    .resolveState({ value: currentStatus })
    .can(event);
}

/**
 * Aplica o evento ao estado atual da Pergunta Avulsa e retorna o novo
 * estado. Lança `InvalidQuestionStatusTransitionError` caso a transição
 * não seja permitida — nunca aplica silenciosamente uma transição
 * inválida.
 */
export function transitionQuestionStatus(
  currentStatus: QuestionStatus,
  event: QuestionStatusEvent,
): QuestionStatus {
  const snapshot = questionStatusMachine.resolveState({
    value: currentStatus,
  });

  if (!snapshot.can(event)) {
    throw new InvalidQuestionStatusTransitionError(currentStatus, event.type);
  }

  const [nextSnapshot] = transition(questionStatusMachine, snapshot, event);
  return nextSnapshot.value as QuestionStatus;
}
