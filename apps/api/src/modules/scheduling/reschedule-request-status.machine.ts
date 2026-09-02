import { createMachine, transition } from 'xstate';
import { HttpStatus } from '@nestjs/common';
import { RescheduleRequestStatus } from '@marmoteiro/shared';
import { DomainError } from '../../common/errors/domain-error';

/**
 * Máquina de estado da Solicitação de Reagendamento (XState — ver ADR 0001,
 * seção "Máquinas de estado"). Estados e transições definidos em
 * docs/adr/0003-maquina-de-estado-do-atendimento.md, seção "Decisão
 * vinculada: RescheduleRequestStatus":
 *
 * PENDING --CONFIRM--> CONFIRMED
 * PENDING --EXPIRE-->  EXPIRED
 *
 * CONFIRMED e EXPIRED são terminais.
 */
export type RescheduleRequestStatusEvent =
  /** Cliente escolheu e confirmou o novo horário (seção 15.5). */
  | { type: 'CONFIRM' }
  /** Prazo de 48h decorrido sem escolha do cliente (seção 15.4). */
  | { type: 'EXPIRE' };

export const rescheduleRequestStatusMachine = createMachine({
  id: 'rescheduleRequestStatus',
  initial: RescheduleRequestStatus.PENDING,
  states: {
    [RescheduleRequestStatus.PENDING]: {
      on: {
        CONFIRM: RescheduleRequestStatus.CONFIRMED,
        EXPIRE: RescheduleRequestStatus.EXPIRED,
      },
    },
    [RescheduleRequestStatus.CONFIRMED]: {},
    [RescheduleRequestStatus.EXPIRED]: {},
  },
});

/**
 * Erro lançado ao tentar aplicar uma transição não permitida pela ADR 0003.
 * Estende `DomainError` com HTTP 409 (Conflict) — ver ADR 0011.
 */
export class InvalidRescheduleRequestStatusTransitionError extends DomainError {
  constructor(
    public readonly currentStatus: RescheduleRequestStatus,
    public readonly event: RescheduleRequestStatusEvent['type'],
  ) {
    super(
      `Transição inválida da Solicitação de Reagendamento: evento "${event}" não é permitido a partir do estado "${currentStatus}" (ver docs/adr/0003-maquina-de-estado-do-atendimento.md).`,
      HttpStatus.CONFLICT,
    );
    this.name = 'InvalidRescheduleRequestStatusTransitionError';
  }
}

/** Indica se o evento representa uma transição válida a partir do estado atual. */
export function canTransitionRescheduleRequestStatus(
  currentStatus: RescheduleRequestStatus,
  event: RescheduleRequestStatusEvent,
): boolean {
  return rescheduleRequestStatusMachine
    .resolveState({ value: currentStatus })
    .can(event);
}

/**
 * Aplica o evento ao estado atual da Solicitação de Reagendamento e retorna
 * o novo estado. Lança `InvalidRescheduleRequestStatusTransitionError` caso
 * a transição não seja permitida — nunca aplica silenciosamente uma
 * transição inválida.
 */
export function transitionRescheduleRequestStatus(
  currentStatus: RescheduleRequestStatus,
  event: RescheduleRequestStatusEvent,
): RescheduleRequestStatus {
  const snapshot = rescheduleRequestStatusMachine.resolveState({
    value: currentStatus,
  });

  if (!snapshot.can(event)) {
    throw new InvalidRescheduleRequestStatusTransitionError(
      currentStatus,
      event.type,
    );
  }

  const [nextSnapshot] = transition(
    rescheduleRequestStatusMachine,
    snapshot,
    event,
  );
  return nextSnapshot.value as RescheduleRequestStatus;
}
