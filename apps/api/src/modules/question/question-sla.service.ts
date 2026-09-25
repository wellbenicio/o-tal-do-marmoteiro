import { Injectable } from '@nestjs/common';
import {
  BusinessHoursCalendar,
  calculateQuestionSlaDeadline,
  isQuestionSlaExceeded,
} from './question-sla';

/**
 * Ponto único de acesso ao cálculo do prazo de SLA da Pergunta Avulsa para
 * o restante da aplicação. Não injeta um calendário concreto — ver
 * docs/adr/0009-calculo-sla-pergunta-avulsa.md.
 */
@Injectable()
export class QuestionSlaService {
  calculateDeadline(
    paymentConfirmedAt: Date,
    calendar: BusinessHoursCalendar,
  ): Date {
    return calculateQuestionSlaDeadline(paymentConfirmedAt, calendar);
  }

  isExceeded(
    paymentConfirmedAt: Date,
    now: Date,
    calendar: BusinessHoursCalendar,
  ): boolean {
    return isQuestionSlaExceeded(paymentConfirmedAt, now, calendar);
  }
}
