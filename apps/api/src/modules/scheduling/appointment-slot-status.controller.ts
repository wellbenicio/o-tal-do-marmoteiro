import { Body, Controller, Post } from '@nestjs/common';
import { AppointmentSlotStatus } from '@marmoteiro/shared';
import { AppointmentSlotStatusService } from './appointment-slot-status.service';
import { AppointmentSlotStatusTransitionRequestDto } from './appointment-slot-status.dto';

/**
 * Exposição HTTP fina da máquina de estado do Slot de Agenda — apenas
 * orquestra `AppointmentSlotStatusService`, sem regra de negócio própria.
 * Ver ADR 0011 (docs/adr/0011-contrato-de-api-e-convencao-rest.md) e
 * docs/adr/0005-maquina-de-estado-do-slot-de-agenda.md.
 */
@Controller('appointment-slots/status')
export class AppointmentSlotStatusController {
  constructor(
    private readonly appointmentSlotStatusService: AppointmentSlotStatusService,
  ) {}

  @Post('can-transition')
  canTransition(@Body() body: AppointmentSlotStatusTransitionRequestDto): {
    canTransition: boolean;
  } {
    return {
      canTransition: this.appointmentSlotStatusService.canTransition(
        body.currentStatus,
        body.event,
      ),
    };
  }

  @Post('transition')
  transition(@Body() body: AppointmentSlotStatusTransitionRequestDto): {
    status: AppointmentSlotStatus;
  } {
    return {
      status: this.appointmentSlotStatusService.transition(
        body.currentStatus,
        body.event,
      ),
    };
  }
}
