import { Injectable } from '@nestjs/common';
import { QuestionStatus } from '@marmoteiro/shared';
import {
  QuestionStatusEvent,
  canTransitionQuestionStatus,
  transitionQuestionStatus,
} from './question-status.machine';

/**
 * Ponto único de acesso à máquina de estado da Pergunta Avulsa para o
 * restante da aplicação (ex.: módulos `payment` e `cancellation` reagindo
 * a eventos que afetam o atendimento). Ver
 * docs/adr/0006-maquina-de-estado-da-pergunta-avulsa.md.
 */
@Injectable()
export class QuestionStatusService {
  canTransition(
    currentStatus: QuestionStatus,
    event: QuestionStatusEvent,
  ): boolean {
    return canTransitionQuestionStatus(currentStatus, event);
  }

  transition(
    currentStatus: QuestionStatus,
    event: QuestionStatusEvent,
  ): QuestionStatus {
    return transitionQuestionStatus(currentStatus, event);
  }
}
