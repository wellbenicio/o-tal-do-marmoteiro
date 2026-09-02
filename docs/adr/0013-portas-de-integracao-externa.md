# ADR 0013: Portas de integração externa (pagamento e notificação)

**Status:** Aceita
**Data:** 2 de setembro de 2026
**Fonte funcional:** `o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`, seção 21 (Pagamentos), seção 24 (Comunicações transacionais), seção 11.6 (entrega via WhatsApp) e seção 38 (itens 8 "integração de pagamento" e 12 "estratégia de notificações").

## Contexto

A seção 38 lista "integração de pagamento" (item 8) e "estratégia de
notificações" (item 12) no checklist da etapa técnica. Ao contrário do
contrato de API (ADR 0011) e do mecanismo de autenticação (ADR 0012), a
integração *concreta* com um provedor real depende de uma escolha de
negócio ainda não feita pelo dono do produto — qual gateway de pagamento
(PIX/cartão) será contratado, qual provedor de WhatsApp Business API/e-mail
transacional será usado. Inventar essa escolha violaria a seção 38 ("não
inventar... decisão de infraestrutura").

O que **pode** avançar agora, sem depender dessa escolha, é a *forma* da
integração: uma porta (interface) que o domínio usa, desacoplada do
fornecedor real — mesmo padrão já estabelecido por `BusinessHoursCalendar`
(ADR 0009) e reforçado por `SessionStore`/`PasswordHasher` (ADR 0012). Esta
ADR aplica esse padrão às duas integrações externas citadas pela
especificação: gateway de pagamento e envio de notificação.

A seção 21.1 já restringe o formato da integração de pagamento ("o
pagamento deverá ocorrer por provedor externo"; não armazenar número
completo de cartão, CVV ou credenciais bancárias) e a seção 21.3 exige que
a confirmação definitiva venha de webhook/evento servidor-servidor, nunca
da resposta imediata ou da tela de retorno do usuário — a porta desta ADR
reflete exatamente essa forma. A seção 24 exige que a comunicação
transacional não dependa diretamente da transação principal de banco,
sugerindo uma abordagem orientada a eventos/outbox — já parcialmente
modelada pelo `OutboxMessage` existente no schema Prisma; esta ADR cobre
apenas o envio em si (a porta), não a produção/consumo da fila de outbox.

## Decisão

### `PaymentGatewayPort` (módulo `payment`)

```
abstract class PaymentGatewayPort {
  abstract charge(request: PaymentChargeRequest): Promise<PaymentChargeResult>;
  abstract refund(request: PaymentRefundRequest): Promise<PaymentRefundResult>;
}
```

`PaymentChargeRequest { orderId, amount, currency }` e
`PaymentChargeResult { provider, providerReference, status }` usam os
mesmos nomes de campo já existentes em `PaymentTransaction` (schema
Prisma) — nenhum conceito novo é inventado, apenas a porta que os produz.
`status` reaproveita o enum `PaymentStatus` já existente (ADR 0004); o
resultado imediato de `charge` é tipicamente `PENDING`, nunca a palavra
final (seção 21.3). `refund` espelha a mesma forma para a solicitação de
estorno (seção 20, ADR 0007).

Só `FakePaymentGatewayAdapter` é fornecida: nunca produz uma cobrança
real, apenas simula uma resposta `PENDING`/`REFUND_PENDING` com uma
referência opaca gerada localmente (`randomUUID()`), registrando cada
chamada recebida (`charges`/`refunds`) para uso em testes.

### `NotificationPort` (módulo `notification`)

```
abstract class NotificationPort {
  abstract send(message: NotificationMessage): Promise<void>;
}
```

`NotificationMessage { recipient, eventCode, content }` — `eventCode` usa
o mesmo formato de string livre de `OutboxMessage.eventCode` (schema
Prisma), sem enumerar aqui os ~16 eventos da seção 24 (isso pertence à
camada de outbox/casos de uso, fora do escopo desta ADR). `recipient` é
deliberadamente um `string` genérico (número de WhatsApp ou e-mail,
conforme o canal), já que esta ADR não decide qual canal/provedor real
será usado.

Só `InMemoryNotificationAdapter` é fornecida: nunca envia nada de fato,
apenas registra cada mensagem em `sentMessages` para uso em testes.

### Ambas as portas seguem o padrão já estabelecido

Abstract class (não `interface`), para servir como token de injeção de
dependência do NestJS — mesma razão já registrada na ADR 0012 para
`SessionStore`/`PasswordHasher`: interfaces puras do TypeScript não têm
representação em tempo de execução. Métodos assíncronos (`Promise`-based)
porque qualquer implementação real (chamada HTTP a um gateway/API externa)
é genuinamente dependente de I/O de rede.

## Consequências

- `PaymentModule` passa a registrar `PaymentGatewayPort` (via
  `FakePaymentGatewayAdapter`) como provider/export; `PaymentStatusService`
  e seu controller (ADR 0011) permanecem inalterados — a porta ainda não é
  consumida por nenhum caso de uso completo.
- `NotificationModule` deixa de ser um stub vazio; passa a exportar
  `NotificationPort` (via `InMemoryNotificationAdapter`). Já estava
  importado em `AppModule` (nenhuma mudança necessária lá).
- Nenhuma migração de schema Prisma é necessária — os campos usados pelas
  portas (`provider`, `providerReference`, `amount`, `currency`,
  `eventCode`) já existem em `PaymentTransaction`/`OutboxMessage`.
- Nenhuma nova dependência de npm.

### Pontos em aberto

1. **Escolha do provedor de pagamento (PIX/cartão)** — decisão de negócio
   pendente do dono do produto. Quando confirmada, uma ADR específica
   define o adapter real (`*PaymentGatewayAdapter`) e cita esta ADR como
   pré-requisito de forma/contrato.
2. **Escolha do provedor de WhatsApp Business API/e-mail transacional** —
   mesma pendência, mesma abordagem (ADR futura + adapter real).
3. **Webhook de confirmação de pagamento** (seção 21.3, seção 35 "segurança
   do webhook de pagamento") — recebimento, validação de assinatura e
   mapeamento para transição de `PaymentStatus` cruzam múltiplos domínios
   via um caso de uso completo ainda não modelado; não é resolvido por
   esta porta, que cobre apenas o lado de iniciar cobrança/estorno.
4. **Outbox de notificação** (produção/consumo de `OutboxMessage`,
   templating do conteúdo de cada um dos ~16 eventos da seção 24) — fora do
   escopo desta ADR, que cobre apenas a porta de envio (`NotificationPort`)
   a ser chamada pelo worker que consumir a fila.
5. **Nenhum consumidor real ainda.** Nenhum controller/serviço de domínio
   chama `PaymentGatewayPort`/`NotificationPort` hoje — a primeira chamada
   real virá de um caso de uso completo (ex. "confirmar pedido e iniciar
   cobrança"), ainda não modelado.

## Alternativas consideradas

- **Adiar toda e qualquer modelagem até o dono do produto escolher os
  fornecedores** — rejeitada: a seção 38 pede para não inventar a
  *escolha*, mas a *forma* da integração (a porta) é decisão técnica pura,
  igual ao raciocínio já usado para `BusinessHoursCalendar` (ADR 0009) e
  `SessionStore`/`PasswordHasher` (ADR 0012); adiar tudo bloquearia
  desnecessariamente o avanço do domínio.
- **Modelar campos específicos de PIX (chave, QR code) ou de cartão
  (bandeira, parcelas) na porta** — rejeitada: inventaria estrutura de um
  provedor ainda não escolhido; a porta permanece no menor conjunto de
  campos genérico e já respaldado pelo schema existente
  (`PaymentTransaction`).
- **Enumerar os eventos da seção 24 como um enum `NotificationEventCode`**
  — rejeitada por ora: a especificação já lista "demais eventos
  relevantes" como item aberto; fixar um enum fechado hoje exigiria
  revisão a cada novo evento. `eventCode: string` livre espelha a mesma
  decisão já tomada para `OutboxMessage.eventCode` no schema.
- **Uma única porta genérica `ExternalIntegrationPort<TRequest, TResult>`
  compartilhada entre pagamento e notificação** — rejeitada: os dois
  domínios têm formas de I/O genuinamente diferentes (cobrança/estorno com
  resultado estruturado vs. envio *fire-and-forget* sem retorno relevante
  além de sucesso/falha); forçar uma abstração comum acoplaria os dois
  domínios sem necessidade real.
