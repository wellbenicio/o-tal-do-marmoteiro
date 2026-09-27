import { Injectable } from '@nestjs/common';
import { AppointmentSlotStatus } from '@marmoteiro/shared';
import {
  AppointmentSlotStatusEvent,
  canTransitionAppointmentSlotStatus,
  transitionAppointmentSlotStatus,
} from './appointment-slot-status.machine';

/**
 * Ponto único de acesso à máquina de estado do Slot de Agenda para o
 * restante da aplicação (ex.: módulos `payment` e `cancellation` reagindo
 * a eventos que afetam a disponibilidade do horário). Ver
 * docs/adr/0005-maquina-de-estado-do-slot-de-agenda.md.
 */
@Injectable()
export class AppointmentSlotStatusService {
  canTransition(
    currentStatus: AppointmentSlotStatus,
    event: AppointmentSlotStatusEvent,
  ): boolean {
    return canTransitionAppointmentSlotStatus(currentStatus, event);
  }

  transition(
    currentStatus: AppointmentSlotStatus,
    event: AppointmentSlotStatusEvent,
  ): AppointmentSlotStatus {
    return transitionAppointmentSlotStatus(currentStatus, event);
  }
}
