import { QuestionStatus } from '@marmoteiro/shared';

/**
 * Ordenação da fila de Perguntas Avulsas — ver ADR 0008
 * (docs/adr/0008-ordenacao-da-fila-de-perguntas.md). Função pura, não uma
 * máquina de estado: aplica a regra determinística da seção 12.3 para
 * decidir a ordem de atendimento recomendada.
 */

/**
 * Campos espelham `QuestionRequest` (schema Prisma) para permitir mapeamento
 * direto pelo chamador.
 */
export interface QuestionQueueItem {
  id: string;
  status: QuestionStatus;
  hasPriority: boolean;
  queuedAt: Date;
}

/**
 * Retorna, a partir da lista informada, somente os itens em `QUEUED`
 * (aguardando execução — regras invariantes nº 2 e 4, seção 32),
 * ordenados conforme a seção 12.3: prioritários antes de regulares e,
 * dentro da mesma classe, por ordem de entrada na fila (`queuedAt`
 * ascendente, equivalente à ordem de confirmação de pagamento — seção
 * 11.4). Não muta a lista recebida.
 */
export function orderQuestionQueue(
  items: readonly QuestionQueueItem[],
): QuestionQueueItem[] {
  return items
    .filter((item) => item.status === QuestionStatus.QUEUED)
    .sort((a, b) => {
      if (a.hasPriority !== b.hasPriority) {
        return a.hasPriority ? -1 : 1;
      }
      return a.queuedAt.getTime() - b.queuedAt.getTime();
    });
}
