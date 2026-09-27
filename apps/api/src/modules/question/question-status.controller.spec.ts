import { Test, TestingModule } from '@nestjs/testing';
import { QuestionStatus } from '@marmoteiro/shared';
import { QuestionStatusController } from './question-status.controller';
import { QuestionStatusService } from './question-status.service';
import { InvalidQuestionStatusTransitionError } from './question-status.machine';

describe('QuestionStatusController', () => {
  let controller: QuestionStatusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionStatusController],
      providers: [QuestionStatusService],
    }).compile();

    controller = module.get(QuestionStatusController);
  });

  it('reporta se a transição é possível sem lançar exceção', () => {
    expect(
      controller.canTransition({
        currentStatus: QuestionStatus.COMPLETED,
        event: { type: 'ENTER_QUEUE' },
      }),
    ).toEqual({ canTransition: false });
  });

  it('aplica a transição e retorna o novo status', () => {
    expect(
      controller.transition({
        currentStatus: QuestionStatus.PAID,
        event: { type: 'ENTER_QUEUE' },
      }),
    ).toEqual({ status: QuestionStatus.QUEUED });
  });

  it('propaga InvalidQuestionStatusTransitionError em transições inválidas', () => {
    expect(() =>
      controller.transition({
        currentStatus: QuestionStatus.COMPLETED,
        event: { type: 'ENTER_QUEUE' },
      }),
    ).toThrow(InvalidQuestionStatusTransitionError);
  });
});
