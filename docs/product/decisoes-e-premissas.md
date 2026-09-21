# Decisões e Premissas Consolidadas

Registro das decisões funcionais tomadas antes do levantamento técnico.

## D-001 — Produto completo, não MVP

Todo o escopo funcional documentado faz parte do produto. A implementação pode ser faseada apenas por dependência técnica.

## D-002 — Backoffice é obrigatório

O painel administrativo não é ferramenta auxiliar futura. Ele é necessário para:

- iniciar pergunta;
- marcar entrega;
- gerenciar fila;
- agenda;
- reagendamento;
- no-show;
- cancelamento;
- refund;
- correção cadastral;
- documentos;
- auditoria.

## D-003 — Separação de Order / Payment / Fulfillment

Motivo: estados financeiros, comerciais e operacionais evoluem de forma independente.

## D-004 — Nome da mãe será coletado

Apesar da política v1.0 mencionar que, como regra, esse dado não seria solicitado, o produto definiu que ele é relevante ao atendimento. A próxima versão da política deve ser ajustada e justificar sua finalidade.

## D-005 — Nome social, identidade de gênero e pronomes

São dados funcionais, não decorativos. Devem apoiar tratamento e identificação adequados.

## D-006 — Dados estruturais sem edição direta

Nome civil, nome social, nascimento, nome da mãe e identidade de gênero serão protegidos contra edição direta. Correção continua possível por workflow auditado.

## D-007 — Prazo da pergunta é 48 horas úteis

A versão correta da decisão é **48 horas úteis**, não 48 horas corridas.

Marco inicial: confirmação do pagamento.

## D-008 — Prioridade é fura-fila, não SLA diferente

Prioridade significa precedência sobre a fila normal ainda não iniciada.

Não garante atendimento imediato e não altera o limite máximo de 48 horas úteis.

## D-009 — Prioridade integra o valor da pergunta

É adicional comercial da mesma contratação. Refund integral devolve o total.

## D-010 — Início da pergunta depende de ação humana

Somente a ação administrativa "Iniciar atendimento" transforma QUEUED em IN_PROGRESS.

Isso foi escolhido para existir marco operacional claro e auditável.

## D-011 — Entrega da pergunta

Somente considerar entregue após envio via WhatsApp de:

1. identificação/pergunta;
2. fotografia do jogo;
3. áudio contendo a resposta.

## D-012 — Cancelamento em fila é permitido

O cliente pode cancelar enquanto aguarda atendimento, observadas regras legais e financeiras aplicáveis.

## D-013 — Serviço iniciado não gera negação automática

IN_PROGRESS é fato operacional. Direito de arrependimento e refund serão avaliados pelas regras legais/contratuais, sem shortcut automático.

## D-014 — Serviço já entregue pode exigir revisão manual

Não automatizar negativa quando houver questão jurídica relevante.

## D-015 — Reagendamento

Um reagendamento do cliente, solicitado com >=24h, consumido apenas quando novo horário for confirmado. Cliente tem 48h para escolher dentre os horários oferecidos.

## D-016 — No-show

Tolerância de 15 minutos. Quando aplicável: 50% de retenção e 50% de restituição. Não gera novo horário.

## D-017 — Cancelamento tardio

Quando aplicável: menos de 24h gera 30% de retenção e 70% de restituição.

## D-018 — Gravação

Aceite dos termos não autoriza gravação. Consentimento separado. Retenção ordinária de até 90 dias, salvo legal hold.

## D-019 — E-mail oficial

Utilizar `falecom@marmoteiro.com`. Remover e-mail pessoal das novas versões.

## D-020 — Arquitetura funcional

Recomendação de monólito modular, sem microserviços por padrão. A etapa técnica pode detalhar, mas deve preservar os domínios funcionais.

## D-021 — Conteúdo de consulta é mais restrito que histórico administrativo

O cliente pode ter histórico de contratação sem que isso implique armazenar indefinidamente o conteúdo íntimo da leitura.

## D-022 — Regra automática + exceção humana

Refund policy deve ser automatizável, mas preservar MANUAL_REVIEW/MANUAL_OVERRIDE para casos excepcionais ou juridicamente ambíguos.

## D-023 — Calendário de horas úteis é configuração

Não fixar em código dias e horários ainda sujeitos à operação. O sistema deve possuir calendário operacional.
