import { Body, Controller, Post } from '@nestjs/common';
import { QuestionStatus } from '@marmoteiro/shared';
import { QuestionStatusService } from './question-status.service';
import { QuestionStatusTransitionRequestDto } from './question-status.dto';

/**
 * Exposição HTTP fina da máquina de estado da Pergunta Avulsa — apenas
 * orquestra `QuestionStatusService`, sem regra de negócio própria. Ver ADR
 * 0011 (docs/adr/0011-contrato-de-api-e-convencao-rest.md) e
 * docs/adr/0006-maquina-de-estado-da-pergunta-avulsa.md.
 */
@Controller('questions/status')
export class QuestionStatusController {
  constructor(private readonly questionStatusService: QuestionStatusService) {}

  @Post('can-transition')
  canTransition(@Body() body: QuestionStatusTransitionRequestDto): {
    canTransition: boolean;
  } {
    return {
      canTransition: this.questionStatusService.canTransition(
        body.currentStatus,
        body.event,
      ),
    };
  }

  @Post('transition')
  transition(@Body() body: QuestionStatusTransitionRequestDto): {
    status: QuestionStatus;
  } {
    return {
      status: this.questionStatusService.transition(
        body.currentStatus,
        body.event,
      ),
    };
  }
}
