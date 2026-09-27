import { Body, Controller, Post } from '@nestjs/common';
import { PaymentStatus } from '@marmoteiro/shared';
import { PaymentStatusService } from './payment-status.service';
import { PaymentStatusTransitionRequestDto } from './payment-status.dto';

/**
 * Exposição HTTP fina da máquina de estado do Pagamento — apenas orquestra
 * `PaymentStatusService`, sem regra de negócio própria. Ver ADR 0011
 * (docs/adr/0011-contrato-de-api-e-convencao-rest.md) e
 * docs/adr/0004-maquina-de-estado-do-pagamento.md.
 */
@Controller('payments/status')
export class PaymentStatusController {
  constructor(private readonly paymentStatusService: PaymentStatusService) {}

  @Post('can-transition')
  canTransition(@Body() body: PaymentStatusTransitionRequestDto): {
    canTransition: boolean;
  } {
    return {
      canTransition: this.paymentStatusService.canTransition(
        body.currentStatus,
        body.event,
      ),
    };
  }

  @Post('transition')
  transition(@Body() body: PaymentStatusTransitionRequestDto): {
    status: PaymentStatus;
  } {
    return {
      status: this.paymentStatusService.transition(
        body.currentStatus,
        body.event,
      ),
    };
  }
}
