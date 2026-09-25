import { Body, Controller, Post } from '@nestjs/common';
import { AppointmentStatus } from '@marmoteiro/shared';
import { AppointmentStatusService } from './appointment-status.service';
import { AppointmentStatusTransitionRequestDto } from './appointment-status.dto';

/**
 * Exposição HTTP fina da máquina de estado do Atendimento — apenas
 * orquestra `AppointmentStatusService`, sem regra de negócio própria. Ver
 * ADR 0011 (docs/adr/0011-contrato-de-api-e-convencao-rest.md) e
 * docs/adr/0018-maquina-de-estado-do-atendimento.md.
 */
@Controller('appointments/status')
export class AppointmentStatusController {
  constructor(
    private readonly appointmentStatusService: AppointmentStatusService,
  ) {}

  @Post('can-transition')
  canTransition(@Body() body: AppointmentStatusTransitionRequestDto): {
    canTransition: boolean;
  } {
    return {
      canTransition: this.appointmentStatusService.canTransition(
        body.currentStatus,
        body.event,
      ),
    };
  }

  @Post('transition')
  transition(@Body() body: AppointmentStatusTransitionRequestDto): {
    status: AppointmentStatus;
  } {
    return {
      status: this.appointmentStatusService.transition(
        body.currentStatus,
        body.event,
      ),
    };
  }
}
