import { IsEnum, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '@marmoteiro/shared';
import { PaymentStatusEvent } from './payment-status.machine';

const PAYMENT_STATUS_EVENT_TYPES = [
  'APPROVE',
  'REJECT',
  'CANCEL',
  'REQUEST_REFUND',
  'CONFIRM_PARTIAL_REFUND',
  'CONFIRM_FULL_REFUND',
] as const satisfies readonly PaymentStatusEvent['type'][];

/** Evento da máquina de estado do Pagamento — ver docs/adr/0004-maquina-de-estado-do-pagamento.md. */
export class PaymentStatusEventDto {
  @IsIn(PAYMENT_STATUS_EVENT_TYPES)
  type!: PaymentStatusEvent['type'];
}

/** Corpo de requisição comum às operações de status do Pagamento (ADR 0011). */
export class PaymentStatusTransitionRequestDto {
  @IsEnum(PaymentStatus)
  currentStatus!: PaymentStatus;

  @ValidateNested()
  @Type(() => PaymentStatusEventDto)
  event!: PaymentStatusEventDto;
}
