import { Injectable } from '@nestjs/common';
import { RescheduleRequestStatus } from '@marmoteiro/shared';
import {
  RescheduleRequestStatusEvent,
  canTransitionRescheduleRequestStatus,
  transitionRescheduleRequestStatus,
} from './reschedule-request-status.machine';

/**
 * Ponto único de acesso à máquina de estado da Solicitação de Reagendamento
 * para o restante da aplicação. Ver
 * docs/adr/0003-maquina-de-estado-do-atendimento.md.
 */
@Injectable()
export class RescheduleRequestStatusService {
  canTransition(
    currentStatus: RescheduleRequestStatus,
    event: RescheduleRequestStatusEvent,
  ): boolean {
    return canTransitionRescheduleRequestStatus(currentStatus, event);
  }

  transition(
    currentStatus: RescheduleRequestStatus,
    event: RescheduleRequestStatusEvent,
  ): RescheduleRequestStatus {
    return transitionRescheduleRequestStatus(currentStatus, event);
  }
}
