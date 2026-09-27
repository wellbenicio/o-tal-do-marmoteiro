import { Body, Controller, Post } from '@nestjs/common';
import { RescheduleRequestStatus } from '@marmoteiro/shared';
import { RescheduleRequestStatusService } from './reschedule-request-status.service';
import { RescheduleRequestStatusTransitionRequestDto } from './reschedule-request-status.dto';

/**
 * Exposição HTTP fina da máquina de estado da Solicitação de
 * Reagendamento — apenas orquestra `RescheduleRequestStatusService`, sem
 * regra de negócio própria. Ver ADR 0011
 * (docs/adr/0011-contrato-de-api-e-convencao-rest.md) e
 * docs/adr/0018-maquina-de-estado-do-atendimento.md.
 */
@Controller('reschedule-requests/status')
export class RescheduleRequestStatusController {
  constructor(
    private readonly rescheduleRequestStatusService: RescheduleRequestStatusService,
  ) {}

  @Post('can-transition')
  canTransition(@Body() body: RescheduleRequestStatusTransitionRequestDto): {
    canTransition: boolean;
  } {
    return {
      canTransition: this.rescheduleRequestStatusService.canTransition(
        body.currentStatus,
        body.event,
      ),
    };
  }

  @Post('transition')
  transition(@Body() body: RescheduleRequestStatusTransitionRequestDto): {
    status: RescheduleRequestStatus;
  } {
    return {
      status: this.rescheduleRequestStatusService.transition(
        body.currentStatus,
        body.event,
      ),
    };
  }
}
