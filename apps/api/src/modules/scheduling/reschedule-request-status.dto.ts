import { IsEnum, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RescheduleRequestStatus } from '@marmoteiro/shared';
import { RescheduleRequestStatusEvent } from './reschedule-request-status.machine';

const RESCHEDULE_REQUEST_STATUS_EVENT_TYPES = [
  'CONFIRM',
  'EXPIRE',
] as const satisfies readonly RescheduleRequestStatusEvent['type'][];

/** Evento da máquina de estado da Solicitação de Reagendamento — ver docs/adr/0018-maquina-de-estado-do-atendimento.md. */
export class RescheduleRequestStatusEventDto {
  @IsIn(RESCHEDULE_REQUEST_STATUS_EVENT_TYPES)
  type!: RescheduleRequestStatusEvent['type'];
}

/** Corpo de requisição comum às operações de status da Solicitação de Reagendamento (ADR 0011). */
export class RescheduleRequestStatusTransitionRequestDto {
  @IsEnum(RescheduleRequestStatus)
  currentStatus!: RescheduleRequestStatus;

  @ValidateNested()
  @Type(() => RescheduleRequestStatusEventDto)
  event!: RescheduleRequestStatusEventDto;
}
