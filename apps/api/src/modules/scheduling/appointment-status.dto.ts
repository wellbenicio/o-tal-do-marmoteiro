import { IsEnum, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentStatus } from '@marmoteiro/shared';
import { AppointmentStatusEvent } from './appointment-status.machine';

const APPOINTMENT_STATUS_EVENT_TYPES = [
  'PAYMENT_APPROVED',
  'COMPLETE',
  'NO_SHOW',
  'CANCEL',
] as const satisfies readonly AppointmentStatusEvent['type'][];

/** Evento da máquina de estado do Atendimento — ver docs/adr/0018-maquina-de-estado-do-atendimento.md. */
export class AppointmentStatusEventDto {
  @IsIn(APPOINTMENT_STATUS_EVENT_TYPES)
  type!: AppointmentStatusEvent['type'];
}

/** Corpo de requisição comum às operações de status do Atendimento (ADR 0011). */
export class AppointmentStatusTransitionRequestDto {
  @IsEnum(AppointmentStatus)
  currentStatus!: AppointmentStatus;

  @ValidateNested()
  @Type(() => AppointmentStatusEventDto)
  event!: AppointmentStatusEventDto;
}
