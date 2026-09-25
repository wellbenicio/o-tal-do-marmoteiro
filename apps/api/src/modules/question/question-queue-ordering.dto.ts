import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionStatus } from '@marmoteiro/shared';

/** Item da fila de Perguntas Avulsas — espelha `QuestionQueueItem` (ADR 0008). */
export class QuestionQueueItemDto {
  @IsString()
  id!: string;

  @IsEnum(QuestionStatus)
  status!: QuestionStatus;

  @IsBoolean()
  hasPriority!: boolean;

  @IsDate()
  @Type(() => Date)
  queuedAt!: Date;
}

/** Corpo de requisição para ordenar a fila de Perguntas Avulsas (ADR 0011 / ADR 0008). */
export class OrderQuestionQueueRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionQueueItemDto)
  items!: QuestionQueueItemDto[];
}
