# Fluxos Operacionais

Este documento descreve, em linguagem operacional, os fluxos acordados para O Tal do Marmoteiro.

## 1. Aquisição

```text
Redes sociais / lives / busca / link direto
                  ↓
             Landing Page
                  ↓
           Escolha do serviço
        ┌─────────┴─────────┐
        ↓                   ↓
 Pergunta avulsa      Consulta online
```

## 2. Identificação

### Cliente novo

```text
Escolha do serviço
      ↓
Cadastro
      ↓
Criação de senha
      ↓
Autenticação automática
      ↓
Aceites aplicáveis
      ↓
Continua a contratação
```

### Cliente existente

```text
Escolha do serviço
      ↓
Login
      ↓
Aceites aplicáveis à contratação
      ↓
Continua a contratação
```

## 3. Pergunta avulsa

```text
Escolher Pergunta Avulsa
      ↓
Cadastro/Login
      ↓
Termos + Privacidade + Sigilo
      ↓
Informações da modalidade
      ↓
Prioridade?
 ┌────┴────┐
 NÃO      SIM
 │        + adicional
 └────┬────┘
      ↓
Resumo da compra
      ↓
Pagamento
      ↓
Pagamento confirmado
      ↓
Entrada em fila
      ↓
QUEUED
      ↓
Admin: "Iniciar atendimento"
      ↓
IN_PROGRESS
      ↓
WhatsApp:
- identificação/pergunta
- foto do jogo
- áudio da resposta
      ↓
Admin: "Marcar como entregue"
      ↓
DELIVERED
      ↓
COMPLETED
```

### SLA

O prazo máximo é de **48 horas úteis**, contado de `payment.confirmedAt`.

Horas úteis dependem de calendário operacional configurável. Dias, expediente, feriados e exceções não devem ser hardcodados.

## 4. Prioridade

```text
Fila prioritária pendente?
        ↓
       SIM ─→ próximo atendimento prioritário
        │
       NÃO ─→ próximo atendimento regular
```

Regras:

- não interrompe atendimento já iniciado;
- não altera o SLA máximo de 48 horas úteis;
- dentro da mesma fila, preservar ordem por confirmação de pagamento;
- o adicional integra o valor total da contratação.

## 5. Cancelamento da pergunta

### Em fila

```text
QUEUED
  ↓
CANCELLATION_REQUESTED
  ↓
regra legal/contratual
  ↓
CANCELLED
  ↓
REFUND_PENDING
  ↓
REFUNDED
```

Quando o direito legal de arrependimento for aplicável, o reembolso inclui o adicional de prioridade.

### Em execução

```text
IN_PROGRESS
  ↓
pedido de cancelamento
  ↓
verificar direito aplicável
  ↓
interromper execução quando cabível
  ↓
reembolso conforme política/legal
```

`IN_PROGRESS` por si só não elimina direito legal.

### Já entregue

```text
DELIVERED
  ↓
pedido de cancelamento/arrependimento
  ↓
MANUAL_REVIEW
  ↓
decisão justificada e auditada
```

## 6. Consulta online

```text
Escolher Consulta Online
      ↓
Cadastro/Login
      ↓
Aceites gerais
      ↓
Escolher horário
      ↓
AVAILABLE → HELD
      ↓
Regras de consulta:
- reagendamento
- cancelamento
- no-show
      ↓
Resumo
      ↓
Pagamento
      ↓
aprovado?
 ┌────┴────┐
 NÃO       SIM
 │          │
HELD       HELD → BOOKED
 ↓          ↓
AVAILABLE  confirmação + e-mail
```

## 7. Reagendamento pelo consulente

```text
BOOKED
  ↓
solicitação com >= 24h
  ↓
RESCHEDULE_REQUESTED
  ↓
novos horários disponibilizados
  ↓
janela de escolha: 48h
  ↓
novo horário confirmado?
 ┌────────┴────────┐
 SIM               NÃO
 ↓                  ↓
reagendamento      expiração da solicitação
consumido
```

Somente a confirmação efetiva do novo horário consome o único reagendamento contratual.

## 8. Reagendamento pelo prestador

```text
indisponibilidade do prestador
        ↓
cliente escolhe:
 ┌──────┴───────────┐
novo horário    reembolso integral
```

Não consome o reagendamento do cliente.

## 9. Cancelamento tardio

Se solicitado com menos de 24h do horário e não houver regra legal superior:

- retenção de 30%;
- restituição de 70%.

## 10. No-show

Tolerância: 15 minutos.

```text
horário agendado
      ↓
cliente indisponível
      ↓
aguardar até 15 min
      ↓
sem comparecimento/comunicação adequada
      ↓
NO_SHOW
      ↓
retenção 50% / restituição 50%
      ↓
contratação encerrada
```

No-show não gera reagendamento.

## 11. Cancelamento pelo site

O próprio ambiente autenticado deve permitir o exercício do cancelamento/arrependimento aplicável.

```text
Pedido
  ↓
[Cancelar contratação]
  ↓
Resumo da situação
  ↓
Confirmar solicitação
  ↓
protocolo + timestamp
  ↓
e-mail de confirmação
  ↓
decisão automática ou MANUAL_REVIEW
```

## 12. Correção cadastral

Campos protegidos não são editáveis diretamente.

```text
Minha Conta
  ↓
Solicitar correção
  ↓
campo + valor atual + novo valor
  ↓
Admin analisa
 ┌────┴────┐
APROVAR   RECUSAR
  ↓         ↓
alterar   justificar
  └────┬────┘
       ↓
AuditLog
```

## 13. Gravação

```text
Consulta
  ↓
consentimento específico?
 ┌────┴────┐
 NÃO       SIM
 │          ↓
sem gravação   gravação
              ↓
          retenção ordinária
          até 90 dias
              ↓
          existe legal hold?
           ┌───┴───┐
          SIM      NÃO
           ↓        ↓
        preservar  excluir
```
