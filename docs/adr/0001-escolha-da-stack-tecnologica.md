# ADR 0001: Escolha da stack tecnológica

**Status:** Aceita
**Data:** 21 de agosto de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`

## Contexto

A especificação funcional (v1.0) define um sistema full-stack — site público,
fluxo de contratação/pagamento, área autenticada do consulente e painel
administrativo — organizado como **monólito modular** (seção 34), com 14
domínios conceituais bem separados (seção 33) e três máquinas de estado
independentes para Pedido, Pagamento e Atendimento (seção 10).

Pontos da especificação que mais pressionam a escolha técnica:

- Consistência transacional forte para reserva de horário (`AVAILABLE → HELD → BOOKED`,
  seção 14.2) e confirmação de pagamento via webhook servidor-servidor (seção 21.3).
- Motor de reembolso centralizado (seção 20.2) e auditoria imutável de decisões (seção 29).
- Comunicações transacionais desacopladas da transação principal, com abordagem
  orientada a eventos/outbox (seção 24).
- Backoffice extenso (seção 23): 9 áreas administrativas (dashboard, clientes,
  pedidos, perguntas, consultas, pagamentos, termos, LGPD, auditoria).
- Mercado brasileiro: pagamento em R$/PIX, entrega via WhatsApp, LGPD, direito de
  arrependimento do CDC (seções 11.6, 19, 25, 36.1).

Três combinações de stack foram avaliadas: (A) Node.js/TypeScript
(Next.js + NestJS), (B) PHP (Laravel + Filament) e (C) Python (Django).

## Decisão

Seguir com a **Opção A**: stack Node.js/TypeScript de ponta a ponta.

- **Frontend:** Next.js + React + TypeScript — site público, fluxo de
  contratação/pagamento e área autenticada do consulente.
- **Backend:** NestJS + TypeScript — módulos nativos com injeção de dependência,
  mapeados aos domínios da seção 33/34; Guards para autorização/RBAC;
  Interceptors para auditoria.
- **Banco de dados:** PostgreSQL, acessado via Prisma ORM.
- **Máquinas de estado:** XState para os fluxos de Pedido, Pagamento e Atendimento.
- **Filas / outbox:** BullMQ + Redis, para comunicações transacionais e
  processamento assíncrono desacoplados da transação principal.
- **Monorepo:** npm workspaces (`apps/api`, `apps/web`, `packages/shared`).

## Consequências

- TypeScript ponta a ponta permite compartilhar tipos/contratos entre
  frontend e backend (`packages/shared`), reduzindo divergência entre API e UI.
- Os 14 domínios da especificação são implementados como módulos NestJS
  isolados, preservando os limites de domínio exigidos pela seção 34.
- Não há scaffold de admin pronto (diferente da opção B/Filament ou C/Django
  Admin) — as 9 áreas do painel administrativo (seção 23) serão construídas
  como telas Next.js consumindo a API do NestJS.
- Integrações específicas do mercado brasileiro (gateway de pagamento com
  PIX, WhatsApp Business API) permanecem como decisões de infraestrutura
  independentes da stack, a detalhar em ADRs específicos.
- Esta decisão não define, por si só, o modelo de dados completo, os
  contratos de API, nem as máquinas de estado de Pedido — esses pontos
  seguem como próximas etapas da estruturação técnica.

## Alternativas consideradas

- **Opção B — PHP (Laravel + Filament):** aceleraria a construção do
  backoffice (seção 23) via Filament, com outbox e filas nativos do
  framework. Não escolhida porque a equipe optou por manter TypeScript
  ponta a ponta.
- **Opção C — Python (Django + DRF):** Django Admin aceleraria telas
  simples de CRUD, mas exigiria duas bases de código (API + frontend
  separado) ou renderização server-side pura, divergindo do restante da
  stack. Não escolhida pelo mesmo motivo da opção B.
