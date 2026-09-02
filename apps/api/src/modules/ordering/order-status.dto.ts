import { IsEnum, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '@marmoteiro/shared';
import { OrderStatusEvent } from './order-status.machine';

const ORDER_STATUS_EVENT_TYPES = [
  'PAYMENT_APPROVED',
  'PAYMENT_DECLINED',
  'CANCEL',
] as const satisfies readonly OrderStatusEvent['type'][];

/** Evento da máquina de estado do Pedido — ver docs/adr/0002-maquina-de-estado-do-pedido.md. */
export class OrderStatusEventDto {
  @IsIn(ORDER_STATUS_EVENT_TYPES)
  type!: OrderStatusEvent['type'];
}

/** Corpo de requisição comum às operações de status do Pedido (ADR 0011). */
export class OrderStatusTransitionRequestDto {
  @IsEnum(OrderStatus)
  currentStatus!: OrderStatus;

  @ValidateNested()
  @Type(() => OrderStatusEventDto)
  event!: OrderStatusEventDto;
}
