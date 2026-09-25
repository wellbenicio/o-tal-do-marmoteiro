import { createMachine, transition } from 'xstate';
import { HttpStatus } from '@nestjs/common';
import { OrderStatus } from '@marmoteiro/shared';
import { DomainError } from '../../common/errors/domain-error';

/**
 * Máquina de estado do Pedido (XState — ver ADR 0001, seção "Máquinas de
 * estado"). Estados e transições definidos em
 * docs/adr/0017-maquina-de-estado-do-pedido.md:
 *
 * CREATED --PAYMENT_APPROVED--> CONFIRMED
 * CREATED --PAYMENT_DECLINED--> CANCELLED
 * CONFIRMED --CANCEL--> CANCELLED
 *
 * CANCELLED é terminal (nenhuma transição sai dele).
 */
export type OrderStatusEvent =
  /** Pagamento aprovado (webhook do provedor) — ADR 0017, seção Decisão. */
  | { type: 'PAYMENT_APPROVED' }
  /** Pagamento rejeitado, cancelado ou abandonado antes da aprovação. */
  | { type: 'PAYMENT_DECLINED' }
  /** Cancelamento aprovado via CancellationRequest (pós-confirmação). */
  | { type: 'CANCEL' };

export const orderStatusMachine = createMachine({
  id: 'orderStatus',
  initial: OrderStatus.CREATED,
  states: {
    [OrderStatus.CREATED]: {
      on: {
        PAYMENT_APPROVED: OrderStatus.CONFIRMED,
        PAYMENT_DECLINED: OrderStatus.CANCELLED,
      },
    },
    [OrderStatus.CONFIRMED]: {
      on: {
        CANCEL: OrderStatus.CANCELLED,
      },
    },
    [OrderStatus.CANCELLATION_REQUESTED]: {
      on: { CANCEL: OrderStatus.CANCELLED },
    },
    [OrderStatus.CANCELLED]: {},
  },
});

/**
 * Erro lançado ao tentar aplicar uma transição não permitida pela ADR 0017.
 * Estende `DomainError` com HTTP 409 (Conflict) — ver ADR 0011: o estado
 * atual do Pedido conflita com o evento solicitado.
 */
export class InvalidOrderStatusTransitionError extends DomainError {
  constructor(
    public readonly currentStatus: OrderStatus,
    public readonly event: OrderStatusEvent['type'],
  ) {
    super(
      `Transição inválida do Pedido: evento "${event}" não é permitido a partir do estado "${currentStatus}" (ver docs/adr/0017-maquina-de-estado-do-pedido.md).`,
      HttpStatus.CONFLICT,
    );
    this.name = 'InvalidOrderStatusTransitionError';
  }
}

/** Indica se o evento representa uma transição válida a partir do estado atual. */
export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  event: OrderStatusEvent,
): boolean {
  return orderStatusMachine.resolveState({ value: currentStatus }).can(event);
}

/**
 * Aplica o evento ao estado atual do Pedido e retorna o novo estado.
 * Lança `InvalidOrderStatusTransitionError` caso a transição não seja
 * permitida — nunca aplica silenciosamente uma transição inválida.
 */
export function transitionOrderStatus(
  currentStatus: OrderStatus,
  event: OrderStatusEvent,
): OrderStatus {
  const snapshot = orderStatusMachine.resolveState({ value: currentStatus });

  if (!snapshot.can(event)) {
    throw new InvalidOrderStatusTransitionError(currentStatus, event.type);
  }

  const [nextSnapshot] = transition(orderStatusMachine, snapshot, event);
  return nextSnapshot.value as OrderStatus;
}
