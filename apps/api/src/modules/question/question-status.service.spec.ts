import { Test, TestingModule } from '@nestjs/testing';
import { QuestionStatus } from '@marmoteiro/shared';
import { QuestionStatusService } from './question-status.service';
import { InvalidQuestionStatusTransitionError } from './question-status.machine';

describe('QuestionStatusService', () => {
  let service: QuestionStatusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionStatusService],
    }).compile();

    service = module.get(QuestionStatusService);
  });

  it('coloca a pergunta em fila assim que o pagamento é confirmado', () => {
    expect(
      service.transition(QuestionStatus.PAID, { type: 'ENTER_QUEUE' }),
    ).toBe(QuestionStatus.QUEUED);
  });

  it('encaminha para revisão manual um pedido de cancelamento pós-entrega', () => {
    expect(
      service.transition(QuestionStatus.DELIVERED, {
        type: 'REQUEST_CANCELLATION',
      }),
    ).toBe(QuestionStatus.MANUAL_REVIEW);
  });

  it('reporta transições impossíveis sem lançar exceção via canTransition', () => {
    expect(
      service.canTransition(QuestionStatus.COMPLETED, {
        type: 'REQUEST_CANCELLATION',
      }),
    ).toBe(false);
  });

  it('propaga InvalidQuestionStatusTransitionError em transições inválidas', () => {
    expect(() =>
      service.transition(QuestionStatus.CREATED, { type: 'MARK_DELIVERED' }),
    ).toThrow(InvalidQuestionStatusTransitionError);
  });
});
