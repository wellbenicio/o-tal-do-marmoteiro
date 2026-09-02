import { createMachine, transition } from 'xstate';
import { HttpStatus } from '@nestjs/common';
import { AppointmentSlotStatus } from '@marmoteiro/shared';
import { DomainError } from '../../common/errors/domain-error';

/**
 * Máquina de estado do Slot de Agenda (XState — ver ADR 0001, seção
 * "Máquinas de estado"). Estados e transições definidos em
 * docs/adr/0005-maquina-de-estado-do-slot-de-agenda.md:
 *
 * AVAILABLE --HOLD-->              HELD
 * HELD      --PAYMENT_APPROVED-->  BOOKED
 * HELD      --RELEASE-->           AVAILABLE
 *
 * BOOKED é terminal (ver nota da ADR 0005 sobre liberação futura de slot).
 */
export type AppointmentSlotStatusEvent =
  /** Cliente seleciona o horário no checkout, antes do pagamento (seção 14.1). */
  | { type: 'HOLD' }
  /** Pagamento aprovado (mesmo evento que confirma AppointmentStatus — ADR 0003). */
  | { type: 'PAYMENT_APPROVED' }
  /** Hold expirado, checkout abandonado, ou pagamento não aprovado (seção 14.2). */
  | { type: 'RELEASE' };

export const appointmentSlotStatusMachine = createMachine({
  id: 'appointmentSlotStatus',
  initial: AppointmentSlotStatus.AVAILABLE,
  states: {
    [AppointmentSlotStatus.AVAILABLE]: {
      on: {
        HOLD: AppointmentSlotStatus.HELD,
      },
    },
    [AppointmentSlotStatus.HELD]: {
      on: {
        PAYMENT_APPROVED: AppointmentSlotStatus.BOOKED,
        RELEASE: AppointmentSlotStatus.AVAILABLE,
      },
    },
    [AppointmentSlotStatus.BOOKED]: {},
  },
});

/**
 * Erro lançado ao tentar aplicar uma transição não permitida pela ADR 0005.
 * Estende `DomainError` com HTTP 409 (Conflict) — ver ADR 0011.
 */
export class InvalidAppointmentSlotStatusTransitionError extends DomainError {
  constructor(
    public readonly currentStatus: AppointmentSlotStatus,
    public readonly event: AppointmentSlotStatusEvent['type'],
  ) {
    super(
      `Transição inválida do Slot de Agenda: evento "${event}" não é permitido a partir do estado "${currentStatus}" (ver docs/adr/0005-maquina-de-estado-do-slot-de-agenda.md).`,
      HttpStatus.CONFLICT,
    );
    this.name = 'InvalidAppointmentSlotStatusTransitionError';
  }
}

/** Indica se o evento representa uma transição válida a partir do estado atual. */
export function canTransitionAppointmentSlotStatus(
  currentStatus: AppointmentSlotStatus,
  event: AppointmentSlotStatusEvent,
): boolean {
  return appointmentSlotStatusMachine
    .resolveState({ value: currentStatus })
    .can(event);
}

/**
 * Aplica o evento ao estado atual do Slot de Agenda e retorna o novo
 * estado. Lança `InvalidAppointmentSlotStatusTransitionError` caso a
 * transição não seja permitida — nunca aplica silenciosamente uma
 * transição inválida.
 */
export function transitionAppointmentSlotStatus(
  currentStatus: AppointmentSlotStatus,
  event: AppointmentSlotStatusEvent,
): AppointmentSlotStatus {
  const snapshot = appointmentSlotStatusMachine.resolveState({
    value: currentStatus,
  });

  if (!snapshot.can(event)) {
    throw new InvalidAppointmentSlotStatusTransitionError(
      currentStatus,
      event.type,
    );
  }

  const [nextSnapshot] = transition(
    appointmentSlotStatusMachine,
    snapshot,
    event,
  );
  return nextSnapshot.value as AppointmentSlotStatus;
}
