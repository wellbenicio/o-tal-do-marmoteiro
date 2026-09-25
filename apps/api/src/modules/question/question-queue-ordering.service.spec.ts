import { Test, TestingModule } from '@nestjs/testing';
import { QuestionStatus } from '@marmoteiro/shared';
import { QuestionQueueOrderingService } from './question-queue-ordering.service';

describe('QuestionQueueOrderingService', () => {
  let service: QuestionQueueOrderingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuestionQueueOrderingService],
    }).compile();

    service = module.get(QuestionQueueOrderingService);
  });

  it('delega para orderQuestionQueue e retorna a ordem calculada', () => {
    const result = service.order([
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
    ]);

    expect(result.map((i) => i.id)).toEqual(['priority', 'regular']);
  });
});
