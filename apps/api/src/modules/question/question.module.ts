import { Module } from '@nestjs/common';
import { QuestionStatusService } from './question-status.service';
import { QuestionQueueOrderingService } from './question-queue-ordering.service';
import { QuestionSlaService } from './question-sla.service';
import { QuestionStatusController } from './question-status.controller';
import { QuestionQueueOrderingController } from './question-queue-ordering.controller';

/**
 * Domínio: Question (pergunta avulsa, fila e prioridade).
 * Fonte: especificação funcional, seções 11 (Pergunta avulsa),
 * 12 (Prioridade de fila) e 13 (Cancelamento da pergunta avulsa). Máquina
 * de estado da Pergunta Avulsa (`QuestionStatus`) definida em
 * docs/adr/0006-maquina-de-estado-da-pergunta-avulsa.md; ordenação da fila
 * definida em docs/adr/0008-ordenacao-da-fila-de-perguntas.md; cálculo do
 * prazo de SLA definido em docs/adr/0009-calculo-sla-pergunta-avulsa.md.
 * Controllers HTTP finos conforme ADR 0011 — `QuestionSlaService` não tem
 * controller: depende de um `BusinessHoursCalendar` concreto (calendário
 * operacional ainda não definido pelo dono do produto — ver "Pontos em
 * aberto" da ADR 0009), que não pode ser expresso em uma requisição HTTP
 * sem inventar dado operacional.
 */
@Module({
  controllers: [QuestionStatusController, QuestionQueueOrderingController],
  providers: [
    QuestionStatusService,
    QuestionQueueOrderingService,
    QuestionSlaService,
  ],
  exports: [
    QuestionStatusService,
    QuestionQueueOrderingService,
    QuestionSlaService,
  ],
})
export class QuestionModule {}
