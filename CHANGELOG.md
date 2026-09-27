# Changelog

Todas as alterações notáveis neste projeto serão documentadas neste arquivo.

O formato segue o padrão de [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/)
e adota o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [0.1.0] - 2026-09-27

### Adicionado
- **Arquitetura & Monorepo**:
  - Monorepo estruturado com Next.js (`apps/web`), NestJS (`apps/api`), Prisma ORM com PostgreSQL e biblioteca de tipos compartilhados (`packages/shared`).
  - Documentação arquitetural abrangente com ADRs (0001 a 0018) cobrindo regras de negócio, fluxos oraculares e regulatório.
- **Domínio & Regras de Negócio**:
  - Máquinas de estado com XState para Pedidos, Atendimentos, Reagendamentos, Pagamentos, Slots de Agenda e Perguntas Avulsas.
  - Mecanismos de cálculo de SLA (48h úteis), política de cancelamento/reembolso e ordenação da fila de perguntas.
  - Módulos de autenticação/RBAC, sessão administrativa e portas de integração externa (pagamentos e notificações).
- **Frontend & Landing Page**:
  - Landing page moderna, responsiva e com identidade visual premium para "O Tal do Marmoteiro".
  - Seções completas: Hero, Experiência, Modalidades e Preços vigentes, Como Funciona, Transparência & Regulação, FAQs oficiais e CTAs.
  - Suporte completo a navegação por teclado e conformidade com critérios de acessibilidade (WCAG).
- **Qualidade & CI/CD**:
  - Pipeline no GitHub Actions validando regras do Git Flow, Prisma migrations, testes unitários e de integração, e Quality Gate SonarCloud.
  - Políticas de versionamento Git Flow documentadas em `docs/architecture/git-flow.md`.
