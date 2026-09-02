/**
 * Estados da decisão de uma solicitação de correção cadastral
 * (`DataCorrectionRequest`).
 *
 * Fonte: o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md,
 * seção 6.4 ("Solicitar correção cadastral"). A especificação não nomeia
 * os estados explicitamente, mas exige registrar "status" e "justificativa
 * da decisão quando houver recusa ou ajuste" — transcrição literal dessa
 * frase implica três desfechos possíveis de decisão (aprovação integral,
 * ajuste do valor solicitado, ou recusa), além do estado inicial de
 * espera. Decisão técnica registrada em
 * docs/adr/0015-status-de-solicitacao-de-correcao-cadastral.md.
 */
export enum DataCorrectionRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ADJUSTED = 'ADJUSTED',
  REJECTED = 'REJECTED',
}
