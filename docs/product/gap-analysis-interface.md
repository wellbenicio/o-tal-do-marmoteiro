# Análise de lacunas — interface e baseline

Data: 21/09/2026. Referência: `dev` em `6606a80`, AGENTS, handoff, especificação v1.0 e complementos. Esta análise precede a adaptação da prévia visual ao monorepo. A entrega atual é uma etapa de validação da interface; não reduz o escopo do produto e não habilita contratações reais.

## Situação encontrada

A branch anterior contém a reprodução do Figma e uma prévia de conta/agendamento, sem backend de autenticação. A `dev` contém o baseline e um scaffold diferente: Next.js 16.3.2, NestJS, PostgreSQL/Prisma, npm workspaces, BullMQ/Redis e XState. Os módulos NestJS são declarações vazias; o único controller é o inicial. O schema é um rascunho, com decisões explicitamente pendentes. Uma tabela ou enum existente não comprova implementação funcional.

| Área                  | Lacuna encontrada                                 | Tratamento na etapa visual                                                                      | Dependência para operação real                                                                       |
| --------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Site público          | Prévia fora de `apps/web`, apenas consulta        | Preservar identidade do Figma; migrar componentes/assets; apresentar as duas modalidades        | Catálogo administrável e identificação publicável do prestador                                       |
| Identidade            | Acesso local simulado                             | Identificar demonstração, apresentar cadastro completo, recuperação e retorno ao checkout       | Hash de senha, sessão segura, verificação, rate limiting e revogação                                 |
| Cadastro              | Apenas nome/e-mail/telefone                       | Nome civil/social, nascimento, mãe, gênero/pronomes; contato editável; correção por solicitação | Validação no servidor, decisão administrativa e auditoria                                            |
| Contratação           | Agenda antecede identificação e aceites genéricos | Identificação → documentos distintos → configuração → resumo/pagamento                          | Transação de pedido e evidência de aceite confiável                                                  |
| Jurídico              | Textos completos ausentes; apenas inventário      | Resumos claramente identificados, cada qual com versão própria de prévia; gravação separada     | Novas versões integrais publicáveis, dados do prestador e revisão prevista no baseline §36           |
| Estados               | Status da reserva mistura pedido e atendimento    | Representar pedido, pagamento e execução separadamente                                          | Máquinas e comandos transacionais no backend                                                         |
| Agenda                | Slots fictícios no navegador                      | Agenda demonstrativa e hold expirável por configuração                                          | Exclusão/índice para slots concorrentes, locks, reconciliação de pagamento tardio                    |
| Reagendamento         | Sem limite ou antecedência                        | Um uso após confirmação; ≥24h; opções por 48h; distinguir iniciativa do prestador               | Persistência da solicitação e confirmação atômica de slot                                            |
| Cancelamento          | Devolução integral indiscriminada                 | Protocolo, motivo opcional, contexto, resultado centralizado e revisão manual quando cabível    | Motor no backend, classificação jurídica e decisão auditada                                          |
| No-show               | Não representado                                  | Informação de tolerância de 15min e regra 50/50 com precedência legal                           | Ação administrativa com contato/tolerância/exceções; nunca gatilho só pelo relógio                   |
| Pergunta e prioridade | Ausentes                                          | Jornada, WhatsApp, fila normal/prioritária e SLA de 48h úteis                                   | Catálogo/preços/calendário configurados, fila, início/entrega administrativos                        |
| Notion                | Conteúdo fictício sem integração                  | Área de anotações e estado de link ainda não disponibilizado                                    | Vínculo autorizado por atendimento; controle de acesso e retenção; nenhuma página pública por padrão |
| Privacidade           | Ausente                                           | Canal oficial, formulário e histórico de solicitações                                           | Workflow do titular, resposta, segurança e retenção                                                  |
| Histórico             | Só estado atual                                   | Timeline, solicitações e documentos apresentados na contratação                                 | Audit log protegido, outbox e histórico no banco                                                     |
| Backoffice            | Módulos vazios                                    | Preservado no escopo e no desenho técnico                                                       | Todas as áreas do §23, RBAC, comandos humanos e auditoria                                            |

## Fronteiras e arquitetura de integração

Next.js concentra as superfícies, consumindo contratos da API NestJS. A prévia usa um adaptador explicitamente local com exemplos fictícios, sem envio de e-mails, cobrança, autenticação real ou escrita no Notion. Esse adaptador não é autoridade financeira ou jurídica. O backend permanece monólito modular conforme ADR 0001.

- Identity: credenciais, sessão, recuperação; Customer: perfil, contato e correções.
- Catalog: modalidade, preços versionados, disponibilidade comercial e parâmetros.
- Ordering: pedido e snapshot dos itens; Payment: transações/webhooks/refunds.
- Scheduling: slots, holds, consultas e solicitações de reagendamento.
- Question: pergunta, prioridade, SLA e fila; Fulfillment: execução canônica reconciliada com as projeções por modalidade.
- Cancellation: pedido de cancelamento, enquadramento, cálculo e decisão/override.
- Legal: conteúdo/versionamento, evidências e consentimento de gravação separado.
- Privacy: solicitações, retenção e legal hold; Notification: outbox/templates.
- Administration: autorização e comandos operacionais; Audit: eventos protegidos.

## Modelo e constraints a concluir

O schema atual precisa de sessões/tokens de uso único, permissões, configuração/calendário operacional, vínculo de gravação/conteúdo privado, protocolo/status de cancelamento, evidências de entrega, idempotência de webhook, tentativas de notificação e snapshot de opções de reagendamento. `RecordingConsent` precisa vincular versão e ator. Versionamento deve ter unicidade por documento/versão. O schema atual permite múltiplos appointments por slot: a unicidade operacional não está garantida pela mera existência de `AppointmentSlot.status`.

Usar valores financeiros inteiros em centavos nos contratos e decimal exato no banco. Constraints de valor não negativo, integridade referencial por cliente/pedido, unicidade do identificador do provedor e exclusão de reservas ativas sobrepostas devem ser aplicadas no PostgreSQL, além da validação da API. Migrações pendentes não são executadas nesta etapa visual.

## Máquinas e contratos propostos

Pedido: aguardando pagamento → confirmado → cancelamento solicitado/cancelado. Pagamento: enum canônico compartilhado; `REFUND_PENDING` não significa devolvido. Execução: não iniciada/agendada ou em fila → iniciada por admin → entregue/concluída; no-show e cancelamento têm eventos distintos. Nomes técnicos ainda não fixados no baseline devem ser registrados em ADR antes da implementação persistente, sem fundir os eixos.

Contratos propostos, sempre sob autorização por proprietário ou permissão administrativa:

| Endpoint                                                              | Responsabilidade                                                       |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `POST /auth/register`, `/login`, `/logout`, `/recovery`, `/reset`     | Credenciais, sessão opaca e tokens de uso único                        |
| `GET/PATCH /me/contact`, `POST /me/corrections`                       | Contatos validados; campos estruturais por solicitação                 |
| `GET /catalog`, `/legal/documents`, `/availability`                   | Oferta, versão jurídica e agenda configuradas                          |
| `POST /orders`                                                        | Snapshot comercial, versões aceitas, configuração da modalidade e hold |
| `POST /orders/:id/payment`, `POST /webhooks/:provider`                | Checkout externo e confirmação idempotente confiável                   |
| `GET /me/orders`, `/me/orders/:id`                                    | Dados mínimos, três estados, ações permitidas, histórico, aceites      |
| `POST /orders/:id/cancellations`                                      | Protocolo imediato, timestamp, enquadramento e resultado/revisão       |
| `POST /appointments/:id/reschedules`, `POST /reschedules/:id/confirm` | Oferecer opções; consumir direito só na confirmação                    |
| `POST/GET /me/privacy-requests`                                       | Exercício e acompanhamento dos direitos                                |
| `POST /admin/questions/:id/start`, `/deliver`, `/complete`            | Ação humana; entrega exige pergunta + foto + áudio                     |
| `POST /admin/cancellations/:id/decision`                              | Justificativa, responsável, decisão anterior e nova                    |

Comandos recebem chave de idempotência; respostas de conflito devem permitir recuperar a operação original. Listagens administrativas não incluem conteúdo íntimo. Retorno do gateway jamais aprova pagamento sozinho.

## Autenticação, autorização e RBAC

Proposta técnica: hash Argon2id; sessão opaca revogável em cookie HttpOnly/Secure/SameSite; validação de origem/CSRF para mutações, expiração e rotação. Tokens de recuperação/verificação são armazenados como hash e usados uma vez. Rate limiting por conta e origem e respostas sem enumeração de contas. Não armazenar credenciais no navegador.

Permissões independentes para operação administrativa, conteúdo de consulta, financeiro, documentos, privacidade e auditoria. Mesmo o admin inicial passa por autorização. Acesso a conteúdo sensível registra evento mínimo; logs nunca recebem pergunta, senha, token, áudio ou dados de terceiros. MFA administrativo deve integrar o desenho de produção.

## Concorrência, calendário e reembolso

Hold e confirmação precisam bloquear o mesmo recurso em transação. Expiração e webhook concorrem por versão/lock; pagamento recebido sem slot disponível entra em reconciliação, sem vender novamente o horário. Reagendamento bloqueia slots de origem/destino em ordem determinística, registra pedido e histórico, e só então consome o único uso.

Horas úteis são calculadas por serviço com calendário versionado (timezone, janelas semanais, feriados e exceções), partindo de `payment.confirmedAt`. A prioridade ordena apenas pendentes por classe e confirmação; não interrompe execução. Ausência de calendário impede afirmar um deadline; não converter 48h úteis em 48h corridas.

O motor central recebe contexto jurídico já apurado, total com prioridade, execução, datas, no-show, origem do reagendamento e exceções. Devolução integral por direito aplicável prevalece sobre retenções. Pergunta entregue, contexto indeterminado e exceções seguem revisão; não inferir perda de direito pelo início. Regras específicas: tardio 30/70; no-show confirmado 50/50. Casos sem enquadramento explícito não ganham percentual inventado.

## Jurídico, LGPD, notificações e auditoria

Aceite imutável referencia documento/versão/conteúdo apresentado, cliente, pedido, manifestação e timestamp do servidor. Recusa de gravação não impede checkout; retenção de até 90 dias após atendimento, com job que respeita legal hold. Notion exige autorização por recurso e uma decisão explícita sobre finalidade/retencão do conteúdo; não publicar notas para contornar controle de acesso.

Mutação de domínio, audit log e outbox entram na mesma transação. Worker BullMQ entrega comunicações com retry, backoff, dead-letter e idempotência. A falha do e-mail não desfaz cancelamento. Auditoria registra ator e diferenças apropriadas, com privilégios de banco que impeçam exclusão administrativa comum. Solicitações de privacidade/correção não são promessa de apagamento irrestrito ou de prazo não documentado.

## Observabilidade, testes e infraestrutura

Correlacionar request/order/event IDs; métricas de expiração, conflitos, latência de webhook, atraso de SLA, filas, refund e outbox. Alertas com dados mínimos. Ambientes segregados; segredos só no servidor; backup/restauração testados; TLS. Frontend na Vercel, API/worker PostgreSQL e Redis em infraestrutura compatível; conexão pública exige configuração e credenciais existentes, não consta pronta no scaffold.

CI: instalação reproduzível, lint sem mutação, typecheck, testes de domínio/contratos, integração PostgreSQL e build. Casos de regressão: limiar 24h, escolha até 48h, consumo apenas após confirmação, prioridade no reembolso, direito legal sobre retenção, revisão após entrega, concorrência de slot/webhook, recusa de gravação, versão jurídica histórica, autorização cruzada, legal hold e outbox idempotente.

## Backlog por dependência, sem redução de escopo

1. Esta etapa: migrar e adequar a interface/preview às regras documentadas; validar desktop/mobile e fluxos demonstrativos.
2. Formalizar ADRs de estado, sessões/RBAC, constraints, execução canônica e contratos; finalizar schema e migrations.
3. Implementar Identity/Customer/Legal/Catalog e versões publicáveis dos três documentos.
4. Implementar pedido/agenda/reagendamento/cancelamento/refund, API, timeline e outbox com testes de concorrência.
5. Implementar pergunta/prioridade/calendário/SLA e comandos administrativos de início/entrega.
6. Concluir backoffice completo, solicitações LGPD/correção, retenção, legal hold e acesso restrito a anotações.
7. Integrar gateway real e comunicações, conforme sequenciamento solicitado pelo usuário; executar homologação, segurança e deploy.

Critério da etapa visual: navegação e ações simuladas coerentes com o baseline, sem confundir protótipo com serviço operacional. Critério de go-live: todos os requisitos do baseline validados, inclusive backend, backoffice, jurídico e infraestrutura. Não há contratação real autorizada por um checkbox de demonstração.
