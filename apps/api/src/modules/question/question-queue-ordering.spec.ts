import { QuestionStatus } from '@marmoteiro/shared';
import {
  QuestionQueueItem,
  orderQuestionQueue,
} from './question-queue-ordering';

const BASE_TIME = new Date('2026-08-01T10:00:00.000Z').getTime();

function item(
  id: string,
  status: QuestionStatus,
  hasPriority: boolean,
  queuedAtOffsetMinutes: number,
): QuestionQueueItem {
  return {
    id,
    status,
    hasPriority,
    queuedAt: new Date(BASE_TIME + queuedAtOffsetMinutes * 60 * 1000),
  };
}

describe('orderQuestionQueue', () => {
  it('coloca perguntas prioritárias antes de regulares, mesmo chegando depois (seção 12.3, item 1-2)', () => {
    const regular = item('regular', QuestionStatus.QUEUED, false, 0);
    const priority = item('priority', QuestionStatus.QUEUED, true, 10);

    const result = orderQuestionQueue([regular, priority]);

    expect(result.map((i) => i.id)).toEqual(['priority', 'regular']);
  });

  it('ordena por confirmação de pagamento (queuedAt) dentro da mesma classe (seção 12.3, item 3)', () => {
    const second = item('second', QuestionStatus.QUEUED, false, 20);
    const first = item('first', QuestionStatus.QUEUED, false, 5);

    const result = orderQuestionQueue([second, first]);

    expect(result.map((i) => i.id)).toEqual(['first', 'second']);
  });

  it('ordena corretamente uma fila mista de prioritários e regulares', () => {
    const items = [
      item('regular-1', QuestionStatus.QUEUED, false, 0),
      item('priority-1', QuestionStatus.QUEUED, true, 30),
      item('regular-2', QuestionStatus.QUEUED, false, 10),
      item('priority-2', QuestionStatus.QUEUED, true, 5),
    ];

    const result = orderQuestionQueue(items);

    expect(result.map((i) => i.id)).toEqual([
      'priority-2',
      'priority-1',
      'regular-1',
      'regular-2',
    ]);
  });

  it('exclui itens que não estão QUEUED (não estão aguardando execução — regra invariante nº 2/4)', () => {
    const inProgress = item('in-progress', QuestionStatus.IN_PROGRESS, true, 0);
    const queued = item('queued', QuestionStatus.QUEUED, false, 100);
    const delivered = item('delivered', QuestionStatus.DELIVERED, true, 0);

    const result = orderQuestionQueue([inProgress, queued, delivered]);

    expect(result.map((i) => i.id)).toEqual(['queued']);
  });

  it('retorna lista vazia quando não há itens em QUEUED', () => {
    const result = orderQuestionQueue([
      item('created', QuestionStatus.CREATED, false, 0),
    ]);

    expect(result).toEqual([]);
  });

  it('não muta a lista original', () => {
    const items = [
      item('b', QuestionStatus.QUEUED, false, 10),
      item('a', QuestionStatus.QUEUED, false, 0),
    ];
    const original = [...items];

    orderQuestionQueue(items);

    expect(items).toEqual(original);
  });
});
