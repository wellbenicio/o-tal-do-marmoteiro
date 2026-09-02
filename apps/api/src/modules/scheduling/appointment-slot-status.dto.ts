import { IsEnum, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentSlotStatus } from '@marmoteiro/shared';
import { AppointmentSlotStatusEvent } from './appointment-slot-status.machine';

const APPOINTMENT_SLOT_STATUS_EVENT_TYPES = [
  'HOLD',
  'PAYMENT_APPROVED',
  'RELEASE',
] as const satisfies readonly AppointmentSlotStatusEvent['type'][];

/** Evento da máquina de estado do Slot de Agenda — ver docs/adr/0005-maquina-de-estado-do-slot-de-agenda.md. */
export class AppointmentSlotStatusEventDto {
  @IsIn(APPOINTMENT_SLOT_STATUS_EVENT_TYPES)
  type!: AppointmentSlotStatusEvent['type'];
}

/** Corpo de requisição comum às operações de status do Slot de Agenda (ADR 0011). */
export class AppointmentSlotStatusTransitionRequestDto {
  @IsEnum(AppointmentSlotStatus)
  currentStatus!: AppointmentSlotStatus;

  @ValidateNested()
  @Type(() => AppointmentSlotStatusEventDto)
  event!: AppointmentSlotStatusEventDto;
}
