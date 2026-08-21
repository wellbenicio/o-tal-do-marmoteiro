import { createMachine, transition } from 'xstate';
import { AppointmentStatus } from '@marmoteiro/shared';

/**
 * Máquina de estado do Atendimento da Consulta Online (XState — ver ADR
 * 0001, seção "Máquinas de estado"). Estados e transições definidos em
 * docs/adr/0003-maquina-de-estado-do-atendimento.md:
 *
 * NOT_STARTED --PAYMENT_APPROVED--> SCHEDULED
 * SCHEDULED   --COMPLETE-->         COMPLETED
 * SCHEDULED   --NO_SHOW-->          NO_SHOW
 * SCHEDULED   --CANCEL-->           CANCELLED
 *
 * Importante (nota da ADR 0003): quando o Pedido é cancelado ANTES de a
 * consulta chegar a ser agendada, o Atendimento simplesmente permanece em
 * `NOT_STARTED` — não há transição `NOT_STARTED → CANCELLED` modelada aqui,
 * pois "o valor simplesmente nunca avança".
 */
export type AppointmentStatusEvent =
  /** Pagamento aprovado e horário confirmado (slot BOOKED) — seção 14. */
  | { type: 'PAYMENT_APPROVED' }
  /** Ação administrativa "conclusão" (seção 23.5). */
  | { type: 'COMPLETE' }
  /** Tolerância de 15 minutos excedida (seção 17.1–17.2). */
  | { type: 'NO_SHOW' }
  /** Cancelamento tardio, arrependimento pós-agendamento, reagendamento
   *  provocado pelo prestador com restituição, ou exceção administrativa. */
  | { type: 'CANCEL' };

export const appointmentStatusMachine = createMachine({
  id: 'appointmentStatus',
  initial: AppointmentStatus.NOT_STARTED,
  states: {
    [AppointmentStatus.NOT_STARTED]: {
      on: {
        PAYMENT_APPROVED: AppointmentStatus.SCHEDULED,
      },
    },
    [AppointmentStatus.SCHEDULED]: {
      on: {
        COMPLETE: AppointmentStatus.COMPLETED,
        NO_SHOW: AppointmentStatus.NO_SHOW,
        CANCEL: AppointmentStatus.CANCELLED,
      },
    },
    [AppointmentStatus.COMPLETED]: {},
    [AppointmentStatus.NO_SHOW]: {},
    [AppointmentStatus.CANCELLED]: {},
  },
});

/** Erro lançado ao tentar aplicar uma transição não permitida pela ADR 0003. */
export class InvalidAppointmentStatusTransitionError extends Error {
  constructor(
    public readonly currentStatus: AppointmentStatus,
    public readonly event: AppointmentStatusEvent['type'],
  ) {
    super(
      `Transição inválida do Atendimento: evento "${event}" não é permitido a partir do estado "${currentStatus}" (ver docs/adr/0003-maquina-de-estado-do-atendimento.md).`,
    );
    this.name = 'InvalidAppointmentStatusTransitionError';
  }
}

/** Indica se o evento representa uma transição válida a partir do estado atual. */
export function canTransitionAppointmentStatus(
  currentStatus: AppointmentStatus,
  event: AppointmentStatusEvent,
): boolean {
  return appointmentStatusMachine
    .resolveState({ value: currentStatus })
    .can(event);
}

/**
 * Aplica o evento ao estado atual do Atendimento e retorna o novo estado.
 * Lança `InvalidAppointmentStatusTransitionError` caso a transição não seja
 * permitida — nunca aplica silenciosamente uma transição inválida.
 */
export function transitionAppointmentStatus(
  currentStatus: AppointmentStatus,
  event: AppointmentStatusEvent,
): AppointmentStatus {
  const snapshot = appointmentStatusMachine.resolveState({
    value: currentStatus,
  });

  if (!snapshot.can(event)) {
    throw new InvalidAppointmentStatusTransitionError(
      currentStatus,
      event.type,
    );
  }

  const [nextSnapshot] = transition(appointmentStatusMachine, snapshot, event);
  return nextSnapshot.value as AppointmentStatus;
}
