# Gestão do oráculo — evolução estrutural da prévia

Data: 21/09/2026. Demanda: painel do prestador, agenda integrada à pessoal, alertas para prestador e consulente, métricas financeiras, ranking de consulentes e lembretes de retorno. Complementa o levantamento anterior; preserva todo o baseline e o ADR 0001.

## Lacunas antes desta implementação

- A prévia possui apenas a área do consulente. A API de administração é scaffold, sem autenticação/RBAC efetivos.
- Pagamentos/cancelamentos/agendamentos alteram estado de sessão local; não existem central de eventos, caixa de e-mails ou espelho de agenda.
- Não há visão financeira agregada, despesas, ranking ou histórico de contato.
- Não há credenciais OAuth Google, provedor de e-mail, domínio de envio verificado ou backend de jobs em operação.

## Entrega desta etapa

Construir `/gestao` com visão geral, agenda, perguntas, pedidos/cancelamentos, financeiro, consulentes/relacionamento, notificações/e-mails e integrações. Usar exemplos fictícios coerentes e controles funcionais de demonstração. Conectar as ações da área do cliente ao painel na mesma sessão do navegador, com eventos deduplicados. Não alegar autenticação de administrador, sincronização Google ou entrega de e-mail reais.

Estados de pedido/pagamento/execução continuam separados. Início e entrega de pergunta são ações administrativas explícitas; entrega exige confirmação de pergunta/foto/áudio. Decisão manual de cancelamento exige motivo e trilha; iniciar não extingue direito de arrependimento. Avisos financeiros não carregam perguntas, interpretações, dados íntimos ou anexos.

Agenda: consulta confirmada, hold e bloqueio pessoal têm estados/cores distintos. Novo bloqueio conflitante exige resolver os compromissos, sem cancelar silenciosamente consultas. Bloqueios da gestão também afetam a disponibilidade demonstrativa do checkout. Não converter o calendário ilustrativo de slots em calendário de SLA: sem calendário operacional aprovado, 48 horas úteis permanecem sem deadline exato.

## Google Agenda: desenho de integração

Usar OAuth no backend, com tokens criptografados e escopos mínimos. Preferência técnica: calendário secundário do oráculo, visível junto da agenda pessoal. Espelhar agendamento confirmado, reagendamento confirmado e cancelamento efetivado; uma mera solicitação ainda em análise não deve apagar o evento. Consultar apenas disponibilidade da agenda pessoal quando necessário, sem importar descrições/títulos íntimos.

Cada evento externo referencia o pedido e mantém um identificador estável; retries não criam eventos duplicados. Sincronização incremental, expiração/renovação de canais, recuperação de token inválido e reconciliação periódica integram o backend. Alterações em compromissos do Google não confirmam pagamento, concedem refund ou alteram contrato automaticamente. Divergências com consultas entram em revisão.

Escopos a homologar conforme o calendário utilizado: `calendar.app.created` para calendário criado pela aplicação e escopo free/busy aplicável à leitura de ocupação. Não pedir acesso irrestrito à agenda por conveniência. `calendar.events.owned` é uma alternativa apenas se o desenho precisar editar agenda preexistente do titular. Mostrar seleção de calendário, estado da conexão, falhas e desconexão. Credenciais nunca ficam no frontend.

Fontes oficiais consultadas:
- https://developers.google.com/workspace/calendar/api/auth
- https://developers.google.com/workspace/calendar/api/guides/sync
- https://developers.google.com/workspace/calendar/api/concepts/reminders
- https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query

## E-mails e notificações

Registrar evento de domínio e outbox na mesma transação da operação, sem depender de e-mail para concluir o comando. Workers com retry/backoff, idempotência por evento/destinatário/template, dead-letter e registro do resultado. Webhook do provedor diferencia aceito, entregue, rejeitado e bounce; não chamar uma tentativa de "entrega".

Matriz: criação/atualização de conta, pedido, pagamento pendente/aprovado/recusado, entrada em fila/prioridade, início/entrega, agendamento, reagendamento solicitado/confirmado, cancelamento solicitado/decidido, refund iniciado/concluído e solicitações cadastrais/privacidade. Prestador recebe alertas operacionais; consulente recebe comunicações da própria contratação. E-mail leva informação mínima e link para área autorizada, sem conteúdo íntimo. Inbox e visualização de template são locais nesta etapa, sem envio real.

Lembretes antes da consulta e resumo diário são configurações operacionais. O lembrete de retorno após aproximadamente um mês é uma tarefa interna configurável, não obrigação clínica, contratual ou contato automático com o consulente. Excluir quem já tem atendimento futuro ou optou por não receber contato; diferenciar comunicação transacional de relacionamento. Registrar contato, adiar ou dispensar; não enviar campanha nesta etapa.

## Definições de métricas

Regime de caixa no período selecionado (timezone Brasília): recebimentos por `paidAt`; devoluções por `refundedAt`; taxas por lançamento financeiro; despesas pela data do lançamento. Contabilizar pagamentos aprovados inclusive quando posteriormente reembolsados; subtrair apenas devoluções efetivadas na janela. Reembolso pendente fica separado como compromisso, não saída realizada.

Recebimentos − devoluções concluídas − taxas − despesas = resultado de caixa estimado antes de tributos e itens não lançados. Não chamar de lucro líquido ou saldo bancário. Valores a receber (não aprovados) não são receita. Ticket médio usa recebimentos/quantidade de pagamentos aprovados da janela. Ranking de frequência usa atendimentos realizados; última consulta não usa pagamento ou reserva. Receita por modalidade inclui prioridade no total da pergunta. Custos/taxas dos exemplos são fictícios, não tarifas do gateway escolhido.

Filtros de período, evolução de entradas/devoluções, mix de serviço/meio de pagamento, conversão do conjunto de pedidos criados na janela, ranking, tabela de lançamentos e exportação CSV permitem validar a estrutura. Não armazenar dados bancários/cartão. Em produção, conciliar movimentos do provedor, estornos parciais, chargebacks, recebíveis e despesas com ledger imutável; adicionar métricas operacionais e observabilidade de qualidade dos dados.

## Backend necessário e sequência

1. Identidade administrativa e RBAC; permissão financeira distinta de conteúdo de consulta; APIs autenticadas e auditadas.
2. Pedidos/agenda com transações e concorrência; ledger financeiro e reconciliação; comandos administrativos, revisão/refund e audit log.
3. Outbox e workers; provedor de e-mail com domínio validado, templates e callbacks; timezone e políticas de lembrete.
4. OAuth Google e sync de agenda; jobs de retry/reconciliação, revogação e testes com calendários de homologação.
5. Perfil/consentimento de relacionamento, lembretes internos, métricas e relatórios; retenção, legal hold e todas as áreas restantes do §23.

Contratos propostos: `GET /admin/overview`, `/admin/orders`, `/admin/finance?from&to`, `/admin/customers`; comandos `POST /admin/questions/:id/{start,deliver,complete}`, `/admin/cancellations/:id/decision`, `/admin/agenda/blocks`; eventos/outbox e preferências em `/admin/notifications`; conexão em `/integrations/google-calendar/{authorize,callback,disconnect}`. Webhooks autenticados ficam na API. Estados/migrações finais devem seguir os ADRs antes de persistência real.
