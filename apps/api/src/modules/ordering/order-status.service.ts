import { Injectable } from '@nestjs/common';
import { OrderStatus } from '@marmoteiro/shared';
import {
  OrderStatusEvent,
  canTransitionOrderStatus,
  transitionOrderStatus,
} from './order-status.machine';

/**
 * Ponto único de acesso à máquina de estado do Pedido para o restante da
 * aplicação (ex.: módulos `payment` e `cancellation` reagindo a eventos que
 * afetam o Pedido). Ver docs/adr/0017-maquina-de-estado-do-pedido.md.
 */
@Injectable()
export class OrderStatusService {
  canTransition(currentStatus: OrderStatus, event: OrderStatusEvent): boolean {
    return canTransitionOrderStatus(currentStatus, event);
  }

  transition(currentStatus: OrderStatus, event: OrderStatusEvent): OrderStatus {
    return transitionOrderStatus(currentStatus, event);
  }
}
