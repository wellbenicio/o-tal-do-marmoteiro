PLANO COMPLETO PARA O CODEX — O TAL DO MARMOTEIRO
Landing page + backend/API + banco + fluxo mockado de pagamento

INSTRUÇÃO INICIAL

Você vai trabalhar no projeto “O Tal do Marmoteiro”.

A interface da landing page já está prototipada no Figma e o plugin/conector do Figma já está configurado. Use o Figma como fonte principal de verdade visual para o front-end. Este documento é a fonte principal para regras de negócio, arquitetura, banco, endpoints e escopo.

LINK DO FIGMA:
https://www.figma.com/design/ExvdVwjI85E8G0wWiMTtN3/SIte-NUNES-tattoo?node-id=1-867&t=0lFBJ8BqUxhFvKP7-1

obs importante: está prototipado como web, basta criarmos de forma responsiva para que o mobile (web) fique bacana para quem for consumir. 

obs sobre o arquivo do Figma: o auto layout não está configurado nesse arquivo, mas isso não deve impedir a implementação fiel da UI construída. Existe um card avulso dentro do arquivo que deve ser desconsiderado.

Antes de codar:

1. Leia este documento inteiro.
2. Analise a estrutura atual do repositório.
3. Verifique se já existem arquivos equivalentes.
4. Use o Figma para extrair layout, cores, espaçamentos, assets, tipografia, hierarquia e responsividade.
5. Não invente layout novo se o Figma já define a interface.
6. Implemente em blocos pequenos, seguros e sem overengineering.

============================================================
1. CONTEXTO DO PRODUTO
============================================================

“O Tal do Marmoteiro” é uma marca/personagem voltada para cartomancia, espiritualidade, Baralho Cigano, atendimento intuitivo e conteúdo com humor.

O produto inicial será uma landing page responsiva para web onde as pessoas poderão agendar e pagar uma consulta online de cartomancia.

Serviço inicial:

* Nome: Jogo de Cartomancia — 30 minutos
* Formato: online
* Duração: 30 minutos
* Pagamento: online
* Confirmação do agendamento: somente após pagamento aprovado

A marca mistura espiritualidade brasileira, Baralho Cigano, estética mística, linguagem acessível, carisma, humor, acolhimento e experiência popular, mas profissional.

============================================================
2. OBJETIVO DO MVP
============================================================

O MVP deve permitir que uma pessoa:

1. Acesse a landing page.
2. Entenda rapidamente o serviço.
3. Escolha um horário disponível.
4. Preencha nome, data de nascimento, e-mail e WhatsApp.
5. Seja redirecionada para pagamento.
6. Pague pelo serviço.
7. Tenha o agendamento confirmado somente após aprovação do pagamento.
8. Consulte o status do agendamento por uma página pública (esta não está prototipada, entao devemos seguir o mesmo padrao prototipado no figma)
9. Receba uma tela adequada de sucesso, pendência ou erro (tambem não está prototipada)

REGRA CRÍTICA:

Nunca confirmar um agendamento antes do pagamento aprovado.

Antes do pagamento aprovado, o sistema deve trabalhar apenas com uma reserva temporária no banco.

============================================================
3. FONTE VISUAL DO FRONT-END
============================

A landing page já está prototipada no Figma.

O Codex deve usar o Figma como referência principal para:

* layout;
* grid;
* espaçamentos;
* seções;
* hierarquia visual;
* paleta de cores;
* tipografia;
* botões;
* cards;
* elementos decorativos;
* imagens;
* ícones;
* assets;
* responsividade;
* comportamento mobile.

Caso haja divergência entre este documento e o Figma em relação à aparência, priorize o Figma para visual e este documento para regras de negócio. Pois podem haver pequenos erros, como campos incompletos ou descritos de forma incorreta...

Pequenos ajustes técnicos são permitidos para acessibilidade, responsividade real, performance, semântica HTML, componentes reutilizáveis, integração com API e melhor manutenção. E também para adequação a normas legais brasileiras, como LGPD. 

============================================================
4. IDENTIDADE VISUAL
============================================================

Preservar fielmente o que está no figma, caso precise criar algo novo, leve em consideração o que já existe para seguir o mesmo padrao. 

============================================================
5. STACK TÉCNICA
============================================================

Usar:

* Next.js com App Router
* TypeScript
* Tailwind CSS
* Prisma ORM
* MySQL
* Zod
* API routes no próprio Next.js
* Estrutura modular em src/server

Integrações futuras:

* Mercado Pago Checkout Pro
* Google Calendar API

Não implementar neste primeiro momento:

* autenticação;
* login;
* área do cliente;
* histórico de consultas;
* upload de arquivos;
* painel administrativo completo;
* cupons;
* pacotes;
* assinatura;
* CRM;
* automação de WhatsApp.

============================================================
6. HOSPEDAGEM E BANCO
============================================================

A hospedagem provavelmente será Hostinger ou HostGator.

Durante desenvolvimento local:

* usar Docker Compose com MySQL.

Em produção:

* o banco será criado pelo painel da hospedagem;
* a aplicação usará DATABASE_URL do ambiente;
* nenhuma credencial deve ficar hardcoded.

O Codex pode gerar schema Prisma, migrations, seed, docker-compose.yml, .env.example e scripts npm.

O Codex não precisa criar banco de produção fora do projeto.

============================================================
7. FLUXO DE NEGÓCIO
============================================================

Fluxo oficial:

1. Cliente acessa a landing page.
2. Cliente escolhe o serviço.
3. Cliente seleciona data e horário disponível.
4. Cliente preenche dados
5. Sistema cria uma reserva temporária no banco.
6. Sistema cria um pagamento pendente.
7. Sistema redireciona cliente para pagamento.
8. Gateway envia webhook.
9. Backend valida pagamento.
10. Se aprovado:

* Payment vira APPROVED;
* Booking vira CONFIRMED;
* evento é criado no Google Calendar;
* cliente vê página de sucesso/confirmação.

11. Se recusado, cancelado, expirado ou reembolsado:

* Booking não é confirmado;
* horário volta a ficar disponível quando o lock expirar;
* cliente vê status adequado.

Regras:

* Nunca criar evento definitivo no Google Calendar antes do pagamento aprovado.
* Nunca marcar Booking como CONFIRMED no checkout.
* Checkout cria apenas reserva temporária e pagamento pendente.

============================================================
8. RESERVA TEMPORÁRIA DE HORÁRIO
================================

Quando o cliente seleciona horário e inicia pagamento:

* criar Booking com status PENDING_PAYMENT;
* definir slotLockExpiresAt com validade configurável;
* valor sugerido: 15 minutos;
* criar Payment com status PENDING.

Enquanto slotLockExpiresAt estiver no futuro:

* o horário não deve aparecer como disponível.

Se o pagamento não for aprovado:

* o booking pode permanecer como PENDING_PAYMENT expirado;
* o horário deve voltar a aparecer como disponível após expiração do lock.

Se houver booking CONFIRMED no mesmo intervalo:

* o horário nunca deve aparecer como disponível.

============================================================
9. BANCO DE DADOS
=================

Usar Prisma com MySQL.

Models:

Customer:

* id: string cuid
* name: string
* email: string unique
* phone: string
* createdAt
* updatedAt

Service:

* id: string cuid
* name: string
* description: string
* durationMinutes: int
* priceCents: int
* currency: string default "BRL"
* active: boolean default true
* createdAt
* updatedAt

Booking:

* id: string cuid
* publicToken: string unique
* customerId
* serviceId
* scheduledStart: DateTime
* scheduledEnd: DateTime
* status: BookingStatus
* slotLockExpiresAt: DateTime
* googleCalendarEventId: string optional
* createdAt
* updatedAt

Payment:

* id: string cuid
* bookingId
* gateway: PaymentGateway
* gatewayPaymentId: string optional
* gatewayPreferenceId: string optional
* status: PaymentStatus
* amountCents: int
* currency: string default "BRL"
* approvedAt: DateTime optional
* rawPayload: Json optional
* createdAt
* updatedAt

BookingNote:

* id: string cuid
* bookingId
* privateNotes: string optional
* customerVisibleNotes: string optional
* createdAt
* updatedAt

Enums:

BookingStatus:

* PENDING_PAYMENT
* CONFIRMED
* PAYMENT_REJECTED
* EXPIRED
* CANCELED
* REFUNDED
* NO_SHOW

PaymentStatus:

* PENDING
* APPROVED
* IN_PROCESS
* REJECTED
* CANCELLED
* REFUNDED
* CHARGED_BACK
* UNKNOWN

PaymentGateway:

* MERCADO_PAGO

Relacionamentos:

* Customer tem muitos Bookings
* Service tem muitos Bookings
* Booking pertence a Customer
* Booking pertence a Service
* Booking tem muitos Payments
* Booking tem muitas BookingNotes
* Payment pertence a Booking
* BookingNote pertence a Booking

Índices:

* Customer.email unique
* Booking.publicToken unique
* Booking.scheduledStart
* Booking.scheduledEnd
* Booking.status
* Payment.gatewayPaymentId
* Payment.gatewayPreferenceId
* Payment.status

============================================================
10. VARIÁVEIS DE AMBIENTE
=========================

Criar .env.example:

DATABASE_URL="mysql://marmoteiro:marmoteiro_password@localhost:3306/marmoteiro_db"

APP_URL="http://localhost:3000"
APP_TIMEZONE="America/Sao_Paulo"

BOOKING_SLOT_MINUTES="30"
BOOKING_LOCK_MINUTES="15"

BUSINESS_OPEN_HOUR="9"
BUSINESS_CLOSE_HOUR="18"

MERCADO_PAGO_ACCESS_TOKEN=""
MERCADO_PAGO_WEBHOOK_SECRET=""

GOOGLE_CALENDAR_ID=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REFRESH_TOKEN=""

Criar src/lib/env.ts validando tudo com Zod.

Não hardcodar secrets.

============================================================
11. ESTRUTURA DE DIRETÓRIOS ESPERADA
====================================

src/
app/
page.tsx
layout.tsx
globals.css

```
pagamento/
  sucesso/page.tsx
  pendente/page.tsx
  erro/page.tsx
  mock/page.tsx

agendamento/
  [publicToken]/page.tsx

api/
  health/route.ts
  services/route.ts
  availability/route.ts
  bookings/
    checkout/route.ts
    [publicToken]/route.ts
  webhooks/
    mercado-pago/route.ts
```

components/
landing/
HeroSection.tsx
ServiceSection.tsx
HowItWorksSection.tsx
BookingSection.tsx
BenefitsSection.tsx
ImportantNotesSection.tsx
FaqSection.tsx
Footer.tsx

```
booking/
  BookingForm.tsx
  DateSelector.tsx
  TimeSlotSelector.tsx
  BookingStatusCard.tsx

ui/
  Button.tsx
  Card.tsx
  Input.tsx
  Section.tsx
  Badge.tsx
```

lib/
env.ts
prisma.ts
errors.ts
http.ts
format.ts

server/
bookings/
booking.repository.ts
booking.service.ts
booking.schemas.ts
booking.types.ts
customers/
customer.repository.ts
customer.service.ts
services/
service.repository.ts
service.service.ts
payments/
mercado-pago.client.ts
payment.repository.ts
payment.service.ts
payment.types.ts
calendar/
google-calendar.client.ts
availability.service.ts
calendar.types.ts

prisma/
schema.prisma
seed.ts

Arquivos adicionais:

* .env.example
* docker-compose.yml
* README.md

============================================================
12. ENDPOINTS
=============

GET /api/health

Resposta:

{
"status": "ok"
}

GET /api/services

Retorna serviços ativos.

GET /api/availability?serviceId=&date=

Parâmetros:

* serviceId obrigatório
* date obrigatório em YYYY-MM-DD

Comportamento:

* buscar serviço ativo;
* gerar slots a partir de BUSINESS_OPEN_HOUR e BUSINESS_CLOSE_HOUR;
* usar durationMinutes do serviço;
* remover slots ocupados por Booking CONFIRMED;
* remover slots bloqueados por Booking PENDING_PAYMENT com slotLockExpiresAt futuro;
* retornar horários disponíveis em ISO datetime.

POST /api/bookings/checkout

Body:

{
"serviceId": "string",
"scheduledStart": "ISO datetime",
"customer": {
"name": "string",
"email": "string",
"phone": "string"
}
}

Comportamento:

* validar body com Zod;
* buscar serviço ativo;
* calcular scheduledEnd;
* validar horário futuro;
* validar conflitos;
* criar ou reutilizar Customer por e-mail;
* criar Booking PENDING_PAYMENT;
* criar Payment PENDING;
* chamar client mockado de Mercado Pago;
* retornar publicToken e checkoutUrl.

Resposta:

{
"booking": {
"publicToken": "string",
"status": "PENDING_PAYMENT",
"scheduledStart": "ISO datetime",
"scheduledEnd": "ISO datetime"
},
"checkoutUrl": "string"
}

GET /api/bookings/:publicToken

Retorna:

* publicToken
* status
* scheduledStart
* scheduledEnd
* service.name
* service.durationMinutes
* service.priceCents
* service.currency

Não retornar:

* id interno;
* dados sensíveis do cliente;
* payloads de pagamento;
* notas privadas.

POST /api/webhooks/mercado-pago

Neste primeiro momento:

* receber payload genérico;
* validar minimamente;
* não confirmar pagamento real ainda;
* preparar estrutura para idempotência;
* retornar 200;
* evitar logar secrets;
* preparar payment.service.ts para integração real futura.

============================================================
13. FRONT-END DA LANDING
========================

A landing deve ser implementada a partir do Figma.

Seções esperadas, se estiverem no Figma:

1. Hero principal
2. Serviço
3. Como funciona
4. Agendamento
5. Benefícios/diferenciais
6. Avisos importantes
7. FAQ
8. Rodapé

A landing deve consumir:

* GET /api/services para exibir serviço ativo;
* GET /api/availability para carregar horários;
* POST /api/bookings/checkout para iniciar reserva e pagamento.

Formulário:

* nome;
* e-mail;
* WhatsApp;
* seleção de data;
* seleção de horário;
* botão para iniciar pagamento.

Depois do POST /api/bookings/checkout:

* redirecionar usuário para checkoutUrl.

No mock inicial:

* checkoutUrl pode apontar para /pagamento/mock?booking=publicToken.

============================================================
14. PÁGINAS DO FLUXO
====================

Criar:

/pagamento/mock

* uso local enquanto Mercado Pago real não está integrado;
* exibir mensagem de pagamento mockado;
* mostrar token do booking;
* link para consultar agendamento.

/pagamento/sucesso

* mensagem de pagamento aprovado;
* orientação de confirmação;
* link para status do agendamento.

/pagamento/pendente

* mensagem de pagamento pendente;
* informar que confirmação depende da aprovação;
* link para consultar status.

/pagamento/erro

* mensagem de pagamento não concluído;
* orientação para tentar novamente;
* link para voltar à landing.

/agendamento/[publicToken]

* consumir GET /api/bookings/:publicToken;
* exibir serviço, data, horário, status e orientação adequada.

============================================================
15. LGPD E PRIVACIDADE
======================

No MVP:

* coletar apenas nome, e-mail e WhatsApp;
* não armazenar anotações profundas de consulta;
* não expor dados internos;
* não retornar dados privados em endpoints públicos;
* não retornar payloads de pagamento;
* não expor ids internos se publicToken for suficiente.

Usar avisos:

* “A consulta tem finalidade espiritual, intuitiva e reflexiva.”
* “Não substitui orientação médica, psicológica, jurídica ou financeira.”
* “O agendamento só é confirmado após a aprovação do pagamento.”

============================================================
16. SEED
========

Criar seed com:

name:
Jogo de Cartomancia — 30 minutos

description:
Consulta online com Baralho Cigano para direcionamento, clareza e reflexão espiritual/intuitiva.

durationMinutes:
30

priceCents:
7000

currency:
BRL

active:
true

============================================================
17. DOCKER
==========

Criar docker-compose.yml com MySQL 8:

* database: marmoteiro_db
* user: marmoteiro
* password: marmoteiro_password
* root password: root_password
* porta local: 3306

============================================================
18. PACKAGE.JSON
================

Adicionar ou ajustar scripts:

* dev
* build
* start
* lint
* prisma:generate
* prisma:migrate
* prisma:seed
* db:studio

Configurar prisma seed no package.json.

============================================================
19. README
==========

Criar README.md com:

1. Como instalar dependências.
2. Como copiar .env.example para .env.
3. Como subir MySQL local com Docker Compose.
4. Como rodar Prisma generate.
5. Como rodar migration.
6. Como rodar seed.
7. Como subir o projeto.
8. Quais endpoints testar primeiro.
9. Como usar o Figma como referência visual.
10. Próximos passos.

Comandos devem indicar o local.

Executar na raiz do repositório:

npm install

Executar na raiz do repositório:

cp .env.example .env

Executar na raiz do repositório:

docker compose up -d

Executar na raiz do repositório:

npx prisma generate

Executar na raiz do repositório:

npx prisma migrate dev --name init

Executar na raiz do repositório:

npx prisma db seed

Executar na raiz do repositório:

npm run dev

============================================================
20. ORDEM DE IMPLEMENTAÇÃO
==========================

Bloco 1 — Preparação:

* analisar repositório;
* identificar versão do Next.js;
* validar package.json;
* verificar Tailwind;
* verificar se Prisma já existe;
* não duplicar estrutura existente.

Bloco 2 — Banco e backend:

* instalar/configurar Prisma;
* criar schema;
* criar docker-compose;
* criar env validation;
* criar repositories e services;
* criar endpoints;
* criar seed;
* validar fluxo mockado.

Bloco 3 — Figma para front-end:

* usar plugin/conector do Figma;
* ler frame principal;
* capturar referências desktop/mobile;
* extrair tokens visuais;
* mapear seções em componentes;
* implementar landing fiel ao protótipo;
* preservar responsividade.

Bloco 4 — Integração landing + API:

* conectar listagem de serviço;
* conectar disponibilidade;
* conectar formulário de agendamento;
* redirecionar para checkout mockado.

Bloco 5 — Páginas de status:

* criar mock payment page;
* criar sucesso;
* criar pendente;
* criar erro;
* criar consulta pública de agendamento.

Bloco 6 — Qualidade:

* rodar lint;
* rodar build;
* validar responsividade;
* comparar com Figma;
* corrigir divergências visuais;
* listar arquivos alterados;
* listar comandos executados.

============================================================
21. CRITÉRIOS DE ACEITE
=======================

Backend/API:

* Prisma schema válido.
* Docker Compose válido.
* Seed funcional.
* GET /api/health responde ok.
* GET /api/services retorna serviço inicial.
* GET /api/availability retorna horários disponíveis.
* POST /api/bookings/checkout cria Customer, Booking e Payment.
* GET /api/bookings/:publicToken retorna status público.
* POST /api/webhooks/mercado-pago responde 200.
* Nenhuma secret hardcoded.

Banco:

* migrations funcionando;
* tabelas criadas corretamente;
* relacionamentos corretos;
* índices principais criados;
* seed idempotente ou seguro para reexecução.

Front-end:

* landing segue o Figma;
* layout responsivo;
* mobile bem resolvido;
* botões e cards fiéis ao design;
* assets do Figma usados corretamente;
* formulário funcional;
* integração com API funcionando;
* páginas de status criadas.

Segurança:

* endpoint público não expõe dados sensíveis;
* não expõe payloads de pagamento;
* não expõe notas privadas;
* envs validadas;
* sem secrets hardcoded.

Qualidade:

* projeto compila;
* lint passa ou problemas são listados;
* build passa ou problemas são explicados;
* README atualizado;
* estrutura modular;
* sem overengineering.

============================================================
22. O QUE NÃO FAZER AGORA
=========================

Não implementar ainda:

* Mercado Pago real;
* Google Calendar real;
* autenticação;
* login;
* área do cliente;
* painel administrativo completo;
* upload de arquivos;
* histórico de consulta;
* envio automático de WhatsApp;
* envio automático de e-mail;
* cupons;
* pacotes;
* assinaturas;
* múltiplos profissionais.

Não confirmar pagamento fake como se fosse real.

Não criar evento no Google Calendar no checkout.

Não transformar mock em comportamento definitivo.

============================================================
23. RESULTADO ESPERADO
======================

Ao final desta entrega, o projeto deve ter:

1. Landing page responsiva seguindo o Figma.
2. Backend/API funcional.
3. Banco MySQL modelado com Prisma.
4. Seed com serviço inicial.
5. Fluxo de reserva temporária.
6. Checkout mockado.
7. Webhook mockado preparado.
8. Página pública de status do agendamento.
9. Páginas de pagamento mock/sucesso/pendente/erro.
10. README com instruções.
11. Estrutura pronta para integrar Mercado Pago real.
12. Estrutura pronta para integrar Google Calendar real.

============================================================
24. INSTRUÇÃO FINAL PARA O CODEX
================================

Ao final, informe:

* arquivos criados;
* arquivos alterados;
* comandos executados;
* comandos que ainda preciso executar localmente;
* pendências;
* próximos passos recomendados.

Próximo bloco após esta entrega:

* Integração real com Mercado Pago Checkout Pro.
* Depois, integração real com Google Calendar.
