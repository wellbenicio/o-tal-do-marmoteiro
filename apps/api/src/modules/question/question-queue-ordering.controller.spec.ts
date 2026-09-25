import { Test, TestingModule } from '@nestjs/testing';
import { QuestionStatus } from '@marmoteiro/shared';
import { QuestionQueueOrderingController } from './question-queue-ordering.controller';
import { QuestionQueueOrderingService } from './question-queue-ordering.service';

describe('QuestionQueueOrderingController', () => {
  let controller: QuestionQueueOrderingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionQueueOrderingController],
      providers: [QuestionQueueOrderingService],
    }).compile();

    controller = module.get(QuestionQueueOrderingController);
  });

  it('ordena a fila priorizando itens com prioridade', () => {
    const result = controller.order({
      items: [
        {
          id: 'regular',
          status: QuestionStatus.QUEUED,
          hasPriority: false,
          queuedAt: new Date('2026-08-01T10:00:00.000Z'),
        },
        {
          id: 'priority',
          status: QuestionStatus.QUEUED,
          hasPriority: true,
          queuedAt: new Date('2026-08-01T10:05:00.000Z'),
        },
      ],
    });

    expect(result.map((i) => i.id)).toEqual(['priority', 'regular']);
  });
});
