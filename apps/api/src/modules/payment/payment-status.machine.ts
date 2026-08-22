import { createMachine, transition } from 'xstate';
import { PaymentStatus } from '@marmoteiro/shared';

/**
 * Máquina de estado do Pagamento (XState — ver ADR 0001, seção "Máquinas de
 * estado"). Estados e transições definidos em
 * docs/adr/0004-maquina-de-estado-do-pagamento.md:
 *
 * PENDING --APPROVE-->              APPROVED
 * PENDING --REJECT-->               REJECTED
 * PENDING --CANCEL-->               CANCELLED
 * APPROVED --REQUEST_REFUND-->      REFUND_PENDING
 * REFUND_PENDING --CONFIRM_PARTIAL_REFUND--> PARTIALLY_REFUNDED
 * REFUND_PENDING --CONFIRM_FULL_REFUND-->    REFUNDED
 *
 * REJECTED, CANCELLED, PARTIALLY_REFUNDED e REFUNDED são terminais.
 */
export type PaymentStatusEvent =
  /** Webhook do provedor confirma o pagamento (seção 21.3). */
  | { type: 'APPROVE' }
  /** Webhook do provedor informa recusa do pagamento. */
  | { type: 'REJECT' }
  /** Abandono/expiração do checkout antes de qualquer confirmação. */
  | { type: 'CANCEL' }
  /** Refund Policy Engine decide FULL_REFUND ou PARTIAL_REFUND (seção 20.3). */
  | { type: 'REQUEST_REFUND' }
  /** Provedor confirma o processamento do reembolso parcial. */
  | { type: 'CONFIRM_PARTIAL_REFUND' }
  /** Provedor confirma o processamento do reembolso integral. */
  | { type: 'CONFIRM_FULL_REFUND' };

export const paymentStatusMachine = createMachine({
  id: 'paymentStatus',
  initial: PaymentStatus.PENDING,
  states: {
    [PaymentStatus.PENDING]: {
      on: {
        APPROVE: PaymentStatus.APPROVED,
        REJECT: PaymentStatus.REJECTED,
        CANCEL: PaymentStatus.CANCELLED,
      },
    },
    [PaymentStatus.APPROVED]: {
      on: {
        REQUEST_REFUND: PaymentStatus.REFUND_PENDING,
      },
    },
    [PaymentStatus.REJECTED]: {},
    [PaymentStatus.CANCELLED]: {},
    [PaymentStatus.REFUND_PENDING]: {
      on: {
        CONFIRM_PARTIAL_REFUND: PaymentStatus.PARTIALLY_REFUNDED,
        CONFIRM_FULL_REFUND: PaymentStatus.REFUNDED,
      },
    },
    [PaymentStatus.PARTIALLY_REFUNDED]: {},
    [PaymentStatus.REFUNDED]: {},
  },
});

/** Erro lançado ao tentar aplicar uma transição não permitida pela ADR 0004. */
export class InvalidPaymentStatusTransitionError extends Error {
  constructor(
    public readonly currentStatus: PaymentStatus,
    public readonly event: PaymentStatusEvent['type'],
  ) {
    super(
      `Transição inválida do Pagamento: evento "${event}" não é permitido a partir do estado "${currentStatus}" (ver docs/adr/0004-maquina-de-estado-do-pagamento.md).`,
    );
    this.name = 'InvalidPaymentStatusTransitionError';
  }
}

/** Indica se o evento representa uma transição válida a partir do estado atual. */
export function canTransitionPaymentStatus(
  currentStatus: PaymentStatus,
  event: PaymentStatusEvent,
): boolean {
  return paymentStatusMachine.resolveState({ value: currentStatus }).can(event);
}

/**
 * Aplica o evento ao estado atual do Pagamento e retorna o novo estado.
 * Lança `InvalidPaymentStatusTransitionError` caso a transição não seja
 * permitida — nunca aplica silenciosamente uma transição inválida.
 */
export function transitionPaymentStatus(
  currentStatus: PaymentStatus,
  event: PaymentStatusEvent,
): PaymentStatus {
  const snapshot = paymentStatusMachine.resolveState({ value: currentStatus });

  if (!snapshot.can(event)) {
    throw new InvalidPaymentStatusTransitionError(currentStatus, event.type);
  }

  const [nextSnapshot] = transition(paymentStatusMachine, snapshot, event);
  return nextSnapshot.value as PaymentStatus;
}
