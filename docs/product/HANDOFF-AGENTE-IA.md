# Handoff para Agente de IA — Levantamento Técnico

Use este arquivo como ponto de partida operacional.

## Missão

Produzir o levantamento técnico do sistema sem alterar o comportamento funcional aprovado.

## Leia primeiro

1. `/AGENTS.md`
2. `/docs/product/README.md`
3. `/o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`
4. demais arquivos de `/docs/product/`
5. `/docs/adr/0001-escolha-da-stack-tecnologica.md`
6. código atual.

## O que já existe no repositório

Há scaffold técnico de monorepo com:

- Next.js em `apps/web`;
- NestJS em `apps/api`;
- Prisma;
- pacote compartilhado;
- módulos iniciais de identity, customer, catalog, ordering, payment, scheduling, question, fulfillment, cancellation, legal, privacy, notification, administration e audit;
- migration inicial.

Não assuma que o scaffold já implementa integralmente as regras. Faça gap analysis.

## Entregáveis esperados do levantamento

1. arquitetura detalhada;
2. módulos e fronteiras;
3. modelo relacional e constraints;
4. máquinas de estado;
5. contratos de API;
6. autenticação/autorização;
7. RBAC;
8. integração de pagamento/webhooks;
9. agenda e concorrência de slots;
10. cálculo de horas úteis;
11. fila normal/prioritária;
12. refund policy engine;
13. workflows de cancelamento/reagendamento/no-show;
14. legal acceptance/versionamento;
15. LGPD e retenção;
16. notificações/outbox;
17. auditoria;
18. observabilidade;
19. testes;
20. infraestrutura e CI/CD;
21. backlog técnico implementável.

## Perguntas que NÃO devem ser reabertas sem motivo técnico real

- se prioridade existe: existe;
- se o SLA é 48h úteis: é;
- se o admin marca início: marca;
- se o admin marca entrega: marca;
- se o cliente pode cancelar em fila: pode;
- se há área do cliente: há;
- se há backoffice: há;
- se há um único reagendamento: há;
- percentuais de cancelamento tardio/no-show;
- consentimento separado para gravação;
- versionamento jurídico;
- necessidade de audit log.

## Onde pode haver decisão técnica

- estratégia de autenticação;
- desenho das tabelas;
- boundaries dos módulos;
- biblioteca de filas/jobs;
- provedor de e-mail;
- implementação do calendário útil;
- idempotência;
- storage;
- observabilidade;
- deployment;
- testes;
- implementação de RBAC;
- padrões de eventos/outbox.

Toda decisão técnica deve demonstrar compatibilidade com o baseline.
