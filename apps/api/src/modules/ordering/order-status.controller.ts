import { Body, Controller, Post } from '@nestjs/common';
import { OrderStatus } from '@marmoteiro/shared';
import { OrderStatusService } from './order-status.service';
import { OrderStatusTransitionRequestDto } from './order-status.dto';

/**
 * Exposição HTTP fina da máquina de estado do Pedido — apenas orquestra
 * `OrderStatusService`, sem regra de negócio própria. Ver ADR 0011
 * (docs/adr/0011-contrato-de-api-e-convencao-rest.md) e
 * docs/adr/0002-maquina-de-estado-do-pedido.md.
 */
@Controller('orders/status')
export class OrderStatusController {
  constructor(private readonly orderStatusService: OrderStatusService) {}

  @Post('can-transition')
  canTransition(@Body() body: OrderStatusTransitionRequestDto): {
    canTransition: boolean;
  } {
    return {
      canTransition: this.orderStatusService.canTransition(
        body.currentStatus,
        body.event,
      ),
    };
  }

  @Post('transition')
  transition(@Body() body: OrderStatusTransitionRequestDto): {
    status: OrderStatus;
  } {
    return {
      status: this.orderStatusService.transition(
        body.currentStatus,
        body.event,
      ),
    };
  }
}
