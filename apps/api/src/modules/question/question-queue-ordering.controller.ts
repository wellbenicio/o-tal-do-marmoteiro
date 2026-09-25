import { Body, Controller, Post } from '@nestjs/common';
import type { QuestionQueueItem } from './question-queue-ordering';
import { QuestionQueueOrderingService } from './question-queue-ordering.service';
import { OrderQuestionQueueRequestDto } from './question-queue-ordering.dto';

/**
 * Exposição HTTP fina da ordenação da fila de Perguntas Avulsas — apenas
 * orquestra `QuestionQueueOrderingService`, sem regra de negócio própria.
 * Ver ADR 0011 (docs/adr/0011-contrato-de-api-e-convencao-rest.md) e
 * docs/adr/0008-ordenacao-da-fila-de-perguntas.md.
 */
@Controller('questions/queue')
export class QuestionQueueOrderingController {
  constructor(
    private readonly questionQueueOrderingService: QuestionQueueOrderingService,
  ) {}

  @Post('order')
  order(@Body() body: OrderQuestionQueueRequestDto): QuestionQueueItem[] {
    return this.questionQueueOrderingService.order(body.items);
  }
}
