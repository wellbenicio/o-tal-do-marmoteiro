import { Injectable } from '@nestjs/common';
import {
  QuestionQueueItem,
  orderQuestionQueue,
} from './question-queue-ordering';

/**
 * Ponto único de acesso à ordenação da fila de Perguntas Avulsas para o
 * restante da aplicação (ex.: painel administrativo consumindo "próximo
 * da fila"). Ver docs/adr/0008-ordenacao-da-fila-de-perguntas.md.
 */
@Injectable()
export class QuestionQueueOrderingService {
  order(items: readonly QuestionQueueItem[]): QuestionQueueItem[] {
    return orderQuestionQueue(items);
  }
}
