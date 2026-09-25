import { IsEnum, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionStatus } from '@marmoteiro/shared';
import { QuestionStatusEvent } from './question-status.machine';

const QUESTION_STATUS_EVENT_TYPES = [
  'PROCEED_TO_PAYMENT',
  'PAYMENT_APPROVED',
  'PAYMENT_DECLINED',
  'ENTER_QUEUE',
  'START_EXECUTION',
  'REQUEST_CANCELLATION',
  'MARK_DELIVERED',
  'COMPLETE',
  'CONFIRM_CANCELLATION',
  'REQUEST_REFUND',
  'CONFIRM_REFUND',
  'REJECT_CANCELLATION',
] as const satisfies readonly QuestionStatusEvent['type'][];

/** Evento da máquina de estado da Pergunta Avulsa — ver docs/adr/0006-maquina-de-estado-da-pergunta-avulsa.md. */
export class QuestionStatusEventDto {
  @IsIn(QUESTION_STATUS_EVENT_TYPES)
  type!: QuestionStatusEvent['type'];
}

/** Corpo de requisição comum às operações de status da Pergunta Avulsa (ADR 0011). */
export class QuestionStatusTransitionRequestDto {
  @IsEnum(QuestionStatus)
  currentStatus!: QuestionStatus;

  @ValidateNested()
  @Type(() => QuestionStatusEventDto)
  event!: QuestionStatusEventDto;
}
