import { Injectable } from '@nestjs/common';
import { AppointmentStatus } from '@marmoteiro/shared';
import {
  AppointmentStatusEvent,
  canTransitionAppointmentStatus,
  transitionAppointmentStatus,
} from './appointment-status.machine';

/**
 * Ponto único de acesso à máquina de estado do Atendimento da Consulta
 * Online para o restante da aplicação. Ver
 * docs/adr/0018-maquina-de-estado-do-atendimento.md.
 */
@Injectable()
export class AppointmentStatusService {
  canTransition(
    currentStatus: AppointmentStatus,
    event: AppointmentStatusEvent,
  ): boolean {
    return canTransitionAppointmentStatus(currentStatus, event);
  }

  transition(
    currentStatus: AppointmentStatus,
    event: AppointmentStatusEvent,
  ): AppointmentStatus {
    return transitionAppointmentStatus(currentStatus, event);
  }
}
