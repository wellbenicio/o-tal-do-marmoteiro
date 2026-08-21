# O Tal do Marmoteiro
## Especificação Funcional, Regras de Negócio e Requisitos Regulatórios

**Versão do documento:** 1.0  
**Data:** 21 de agosto de 2026  
**Status:** Fechado para levantamento técnico  
**Finalidade:** servir como fonte funcional e regulatória para a etapa de arquitetura, modelagem técnica, backlog e implementação por agentes de IA e desenvolvedores.

---

# 1. Objetivo

Este documento consolida o comportamento funcional do sistema **O Tal do Marmoteiro**, plataforma de contratação e gestão de atendimentos oraculares.

O sistema não será tratado como um MVP. Todo o escopo descrito neste documento integra o produto que deverá ser construído. A implementação poderá ser sequenciada tecnicamente, mas não deverá reduzir ou descaracterizar o escopo funcional definido.

A plataforma deverá atender quatro superfícies principais:

1. **Site público / Landing Page**
2. **Fluxo de contratação e pagamento**
3. **Área autenticada do consulente**
4. **Painel administrativo / Backoffice**

O núcleo transacional deverá integrar:

- cadastro e autenticação;
- catálogo de serviços;
- pedidos;
- pagamentos;
- fila de atendimento;
- agenda;
- execução de atendimentos;
- reagendamentos;
- cancelamentos;
- reembolsos;
- aceite de documentos;
- privacidade e proteção de dados;
- comunicações transacionais;
- auditoria administrativa.

---

# 2. Base normativa e documental

Este documento foi consolidado a partir das regras definidas pelo prestador e dos seguintes documentos:

- **ORACULO-TERMOS-v1.0**, vigente desde 14/08/2026;
- **ORACULO-PRIVACIDADE-v1.0**, vigente desde 14/08/2026;
- **ORACULO-SIGILO-v1.0**, vigente desde 14/08/2026.

Esses documentos deverão continuar versionados separadamente e vinculados às respectivas contratações.

Quando houver conflito entre regra contratual e norma legal obrigatória aplicável ao caso concreto, deverá prevalecer a legislação.

---

# 3. Prestador

O prestador/oraculista é o mesmo identificado nos documentos jurídicos atuais.

## 3.1 Canal eletrônico de negócio

O e-mail de negócio deverá ser utilizado como canal oficial:

**falecom@marmoteiro.com**

O e-mail pessoal atualmente presente em documentos anteriores deverá ser removido nas próximas versões.

O mesmo e-mail poderá ser utilizado inicialmente para:

- atendimento contratual;
- suporte;
- cancelamento;
- exercício de direitos relacionados à privacidade;
- solicitações LGPD;
- comunicações administrativas.

---

# 4. Atores do sistema

## 4.1 Visitante

Pessoa ainda não autenticada.

Pode:

- acessar a landing page;
- consultar modalidades disponíveis;
- consultar preços e condições;
- iniciar contratação;
- autenticar-se;
- criar uma conta.

## 4.2 Consulente

Usuário autenticado que pode contratar e acompanhar serviços.

Pode:

- manter sua conta;
- atualizar dados de contato permitidos;
- solicitar correção de dados cadastrais bloqueados;
- contratar serviços;
- pagar;
- consultar histórico;
- acompanhar status;
- reagendar quando permitido;
- solicitar cancelamento;
- acompanhar reembolso;
- exercer direitos de privacidade;
- consultar documentos aceitos.

## 4.3 Administrador / Oraculista

Usuário administrativo autorizado.

Pode:

- gerir clientes;
- gerir pedidos;
- gerir perguntas avulsas;
- gerir consultas;
- gerir agenda;
- sinalizar início e conclusão de atendimentos;
- marcar no-show;
- processar cancelamentos;
- processar ou aprovar reembolsos;
- avaliar exceções;
- processar solicitações cadastrais;
- consultar histórico de aceite;
- consultar logs;
- gerir documentos e versões;
- gerir parâmetros comerciais e operacionais.

---

# 5. Modalidades de serviço

O sistema deverá suportar inicialmente duas modalidades completas de contratação.

## 5.1 Pergunta avulsa

Características:

- atendimento remoto;
- resposta entregue pelo WhatsApp;
- prazo máximo de resposta de **48 horas úteis**, contado da confirmação do pagamento;
- possibilidade de contratação de **prioridade de fila**;
- execução iniciada manualmente pelo administrador;
- entrega composta por:
  1. reprodução/identificação da pergunta;
  2. fotografia do jogo realizado;
  3. áudio contendo a interpretação e a resposta.

## 5.2 Consulta online

Características:

- atendimento síncrono;
- escolha prévia de horário;
- reserva de agenda;
- política própria de reagendamento;
- política própria de cancelamento tardio;
- política de no-show;
- possibilidade de gravação somente mediante autorização específica e separada.

---

# 6. Cadastro do consulente

## 6.1 Dados obrigatórios

O cadastro deverá contemplar, no mínimo:

- nome civil;
- nome social;
- data de nascimento;
- nome da mãe;
- identidade de gênero;
- pronomes, quando informados;
- e-mail;
- telefone/WhatsApp;
- senha.

## 6.2 Uso funcional dos dados

O nome social, identidade de gênero e pronomes não deverão ser coletados apenas para arquivo. Quando disponíveis, deverão ser utilizados para:

- tratamento adequado do consulente;
- identificação no painel administrativo;
- comunicações;
- contextualização do atendimento quando pertinente.

## 6.3 Dados editáveis diretamente

O consulente poderá editar diretamente:

- e-mail;
- telefone/WhatsApp;
- senha.

Alterações de e-mail ou telefone deverão considerar mecanismos de validação e segurança definidos na etapa técnica.

## 6.4 Dados bloqueados para edição direta

O consulente não poderá alterar diretamente:

- nome civil;
- nome social;
- data de nascimento;
- nome da mãe;
- identidade de gênero.

Deverá existir a ação:

**Solicitar correção cadastral**

A solicitação deverá registrar:

- usuário;
- campo;
- valor atual;
- valor solicitado;
- motivo opcional;
- data/hora;
- status;
- administrador responsável;
- data/hora da decisão;
- justificativa da decisão quando houver recusa ou ajuste.

Toda alteração aprovada deverá ser auditável.

---

# 7. Autenticação

## 7.1 Primeiro acesso

No fluxo da primeira contratação, o visitante deverá:

1. informar os dados cadastrais;
2. criar credenciais;
3. aceitar os documentos aplicáveis;
4. permanecer autenticado para continuidade da contratação.

## 7.2 Cliente existente

O cliente já cadastrado deverá poder:

1. selecionar o serviço;
2. autenticar-se;
3. prosseguir no fluxo sem recriação de cadastro.

## 7.3 Recuperação e segurança

O sistema deverá prever:

- recuperação de senha;
- alteração de senha;
- proteção contra força bruta;
- controle seguro de sessão;
- revogação de sessão quando necessário.

Detalhes de implementação serão definidos na especificação técnica.

---

# 8. Documentos jurídicos e aceite eletrônico

## 8.1 Documentos

O sistema deverá permitir apresentação e aceite de documentos distintos, incluindo:

- Termos e Condições para Atendimento Oracular;
- Política de Privacidade e Proteção de Dados;
- Termo de Confidencialidade e Sigilo;
- políticas específicas da modalidade, quando necessário;
- autorização de gravação, quando aplicável.

## 8.2 Versionamento

Documentos jurídicos são versionados.

Nunca deverá existir apenas um booleano genérico equivalente a:

`acceptedTerms = true`

Cada aceite deverá registrar, no mínimo:

- usuário;
- pedido/contratação;
- documento;
- versão;
- data/hora;
- manifestação registrada;
- informações técnicas disponíveis para comprovação da manifestação de vontade.

Uma contratação antiga deve continuar vinculada às versões efetivamente apresentadas e aceitas naquela contratação.

## 8.3 Disponibilidade posterior

O cliente deverá conseguir consultar posteriormente quais documentos e versões aceitou.

---

# 9. Fluxo geral de contratação

## 9.1 Entrada

O cliente poderá chegar ao site através de:

- redes sociais;
- lives;
- conteúdos;
- mecanismos de busca;
- links externos;
- acesso direto.

## 9.2 Fluxo comum

1. Landing Page.
2. Escolha da modalidade.
3. Cadastro ou login.
4. Apresentação e aceite dos documentos aplicáveis.
5. Configuração específica da modalidade.
6. Resumo da contratação.
7. Pagamento.
8. Confirmação.
9. Página de agradecimento.
10. Comunicação automática por e-mail.
11. Disponibilização do pedido na área do cliente.
12. Execução do atendimento.
13. Pós-venda e histórico.

---

# 10. Pedido, pagamento e atendimento são domínios distintos

O sistema deverá separar conceitualmente:

## 10.1 Pedido

Representa o que foi contratado.

## 10.2 Pagamento

Representa a movimentação financeira.

## 10.3 Atendimento

Representa a execução do serviço.

Não deverá existir um único status tentando representar os três ciclos.

Exemplo válido:

```text
PEDIDO: CONFIRMADO
PAGAMENTO: PAGO
ATENDIMENTO: AGENDADO
```

Posteriormente:

```text
PEDIDO: CONFIRMADO
PAGAMENTO: PAGO
ATENDIMENTO: CONCLUÍDO
```

Ou:

```text
PEDIDO: CANCELADO
PAGAMENTO: REEMBOLSO_PENDENTE
ATENDIMENTO: NÃO_INICIADO
```

---

# 11. Pergunta avulsa

# 11.1 SLA

O prazo máximo de resposta é de:

**48 horas úteis a partir da confirmação do pagamento.**

A contagem não começa:

- na criação do carrinho;
- na criação do pedido;
- no início do checkout.

A referência é:

`payment.confirmedAt`

## 11.2 Definição de hora útil

O sistema deverá utilizar um **calendário operacional configurável**.

A implementação não deverá hardcodar a definição de hora útil no domínio.

O calendário deverá permitir configuração de:

- dias de atendimento;
- horário de início e fim de expediente;
- feriados ou indisponibilidades;
- exceções operacionais.

As condições efetivamente aplicáveis ao prazo deverão ser apresentadas ao cliente antes da contratação.

## 11.3 Estados funcionais

Fluxo principal:

```text
CREATED
  ↓
AWAITING_PAYMENT
  ↓
PAID
  ↓
QUEUED
  ↓
IN_PROGRESS
  ↓
DELIVERED
  ↓
COMPLETED
```

Estados auxiliares possíveis:

```text
CANCELLATION_REQUESTED
CANCELLED
REFUND_PENDING
REFUNDED
MANUAL_REVIEW
```

## 11.4 Entrada na fila

Somente pedidos com pagamento confirmado podem entrar na fila operacional.

## 11.5 Início da execução

A execução será considerada iniciada somente quando o administrador realizar explicitamente a ação:

**Iniciar atendimento**

Essa ação deverá:

- alterar o estado para `IN_PROGRESS`;
- registrar data/hora;
- registrar administrador responsável;
- gerar evento de auditoria.

A entrada automática na fila não significa início da prestação.

## 11.6 Entrega

A pergunta será considerada entregue somente após o envio via WhatsApp de:

1. pergunta/identificação da pergunta;
2. fotografia do jogo;
3. áudio com a resposta/interpretação.

Após isso, o administrador poderá utilizar a ação:

**Marcar como entregue**

O sistema deverá registrar:

- `deliveredAt`;
- administrador;
- canal de entrega;
- evento de auditoria.

## 11.7 Conclusão

Após a entrega, o atendimento poderá ser marcado como concluído conforme regra operacional.

---

# 12. Prioridade de fila

## 12.1 Natureza

A prioridade é um adicional opcional integrado à mesma contratação da pergunta.

Não constitui um serviço jurídico/financeiro independente para fins de reembolso.

## 12.2 Efeito operacional

A prioridade:

- coloca a pergunta em fila prioritária;
- permite atendimento antes de perguntas da fila regular que ainda não tenham execução iniciada;
- não interrompe atendimento já iniciado;
- não aumenta o SLA máximo;
- permanece sujeita ao prazo máximo de 48 horas úteis.

## 12.3 Ordenação

Regra determinística recomendada:

1. atendimentos prioritários aguardando execução;
2. atendimentos regulares aguardando execução;
3. dentro da mesma classe, ordem por confirmação de pagamento.

A arquitetura técnica poderá otimizar essa lógica sem alterar seu resultado funcional.

## 12.4 Preço

O checkout poderá discriminar:

```text
Pergunta: R$ X
Prioridade: R$ Y
Total: R$ Z
```

Para fins de cancelamento e reembolso, o valor considerado será o valor total da contratação.

Exemplo:

```text
Pergunta: R$ 50
Prioridade: R$ 20
Total pago: R$ 70

Reembolso integral aplicável: R$ 70
```

---

# 13. Cancelamento da pergunta avulsa

## 13.1 Cancelamento em fila

O cliente poderá solicitar cancelamento enquanto o atendimento estiver em `QUEUED`.

Quando houver direito de arrependimento legalmente aplicável:

- o pedido deverá ser cancelado;
- o atendimento não deverá iniciar;
- o reembolso será integral;
- eventual valor de prioridade integra o reembolso.

## 13.2 Atendimento já iniciado

O estado `IN_PROGRESS` não deverá, isoladamente, eliminar automaticamente direitos previstos em lei.

Quando houver exercício válido do direito de arrependimento durante a execução e antes da entrega:

- a execução deverá ser interrompida;
- deverá ser aplicado o tratamento legal cabível;
- a política operacional adotará, por segurança, reembolso integral quando o direito legal for aplicável.

## 13.3 Atendimento já entregue

Se a pergunta já estiver em `DELIVERED` e houver pedido de cancelamento ou arrependimento dentro de período juridicamente relevante:

- o sistema não deverá negar automaticamente;
- deverá encaminhar para `MANUAL_REVIEW`;
- o administrador deverá decidir com base na regra legal aplicável ao caso concreto;
- toda decisão deverá ser justificada e auditada.

---

# 14. Consulta online

## 14.1 Escolha de agenda

Antes do pagamento, o cliente deverá selecionar horário disponível.

## 14.2 Reserva temporária

Para evitar dupla venda do mesmo horário:

```text
AVAILABLE
  ↓
HELD
  ↓
BOOKED
```

O horário poderá permanecer temporariamente reservado durante o processo de pagamento.

Pagamento aprovado:

`HELD → BOOKED`

Pagamento expirado, abandonado ou não aprovado:

`HELD → AVAILABLE`

O tempo de retenção temporária será definido tecnicamente/configuravelmente.

---

# 15. Reagendamento da consulta

## 15.1 Direito contratual

Cada contratação de consulta online permite **um único reagendamento por iniciativa do consulente**, sem cobrança adicional.

## 15.2 Antecedência

O pedido deverá ocorrer com pelo menos:

**24 horas de antecedência do horário agendado.**

## 15.3 Solicitação

O sistema deverá registrar:

- horário original;
- data/hora da solicitação;
- solicitante;
- status da solicitação;
- opções disponibilizadas;
- data/hora de expiração;
- novo horário escolhido.

## 15.4 Prazo para escolha

Após a apresentação de novas opções, o cliente terá:

**48 horas**

para escolher um novo horário.

Sem manifestação no prazo, a solicitação poderá expirar e deverão ser aplicadas as regras contratuais pertinentes.

## 15.5 Consumo do reagendamento

O reagendamento somente será considerado utilizado após confirmação efetiva da nova data e horário.

Solicitar reagendamento sem concluir a escolha não consome automaticamente o direito.

## 15.6 Segundo pedido

Depois de consumido o único reagendamento, não existe direito contratual a nova alteração por iniciativa do consulente.

## 15.7 Reagendamento provocado pelo prestador

Quando a alteração ocorrer por responsabilidade ou indisponibilidade do prestador:

- não consome o reagendamento do cliente;
- o cliente poderá escolher novo horário disponível; ou
- poderá optar por restituição integral referente ao serviço não realizado.

---

# 16. Cancelamento tardio da consulta

## 16.1 Caracterização

Solicitação com menos de:

**24 horas de antecedência**

poderá ser caracterizada como cancelamento tardio, ressalvadas hipóteses legais de tratamento diferente.

## 16.2 Regra financeira

Quando aplicável:

- retenção: **30%**;
- restituição: **70%**.

A retenção não será aplicada ou deverá ser ajustada quando norma legal obrigatória determinar solução diversa.

---

# 17. No-show

## 17.1 Tolerância

O prestador aguardará por até:

**15 minutos**

após o horário agendado.

## 17.2 Caracterização

Pode ser no-show quando o cliente:

- não comparece;
- não acessa o canal;
- permanece indisponível por mais de 15 minutos;
- não responde às tentativas razoáveis de contato;
- deixa transcorrer o período sem comunicação adequada.

Não deverá ser caracterizado automaticamente como no-show quando houver:

- falha atribuível ao prestador;
- falha relevante da plataforma indicada pelo prestador;
- situação excepcional, imprevisível ou inevitável adequadamente comprovada/comunicada.

## 17.3 Consequência financeira

Quando caracterizado o no-show e inexistir regra legal obrigatória em sentido diverso:

- retenção: **50%**;
- restituição: **50%**.

## 17.4 Efeito sobre reagendamento

No-show:

- não gera direito a reagendamento;
- encerra aquela contratação;
- nova consulta exige nova contratação.

---

# 18. Situações excepcionais

Deverá existir análise administrativa manual para circunstâncias como:

- emergência médica;
- acidente;
- falecimento;
- indisponibilidade generalizada de serviço essencial;
- eventos imprevisíveis ou inevitáveis;
- outras situações relevantes de boa-fé.

Estados/ações possíveis:

```text
AUTOMATIC_DECISION
MANUAL_REVIEW_REQUIRED
MANUAL_OVERRIDE
```

Toda exceção deverá registrar:

- administrador;
- data/hora;
- decisão automática anterior, se houver;
- decisão final;
- justificativa.

Uma flexibilização pontual não altera permanentemente a política.

---

# 19. Direito de arrependimento

## 19.1 Regra geral

Quando juridicamente aplicável, deverá ser respeitado o direito de arrependimento do consumidor no prazo legal de sete dias.

## 19.2 Exercício pelo próprio sistema

O cliente deverá possuir ação de cancelamento/arrependimento na própria área autenticada.

Não deverá ser obrigado a depender exclusivamente de WhatsApp ou e-mail.

O sistema deverá:

1. receber a solicitação;
2. gerar protocolo;
3. registrar data/hora;
4. confirmar imediatamente o recebimento;
5. aplicar ou encaminhar para análise a regra de reembolso;
6. gerar comunicação por e-mail.

## 19.3 Precedência legal

Nenhuma política de:

- cancelamento tardio;
- no-show;
- início de atendimento;
- prioridade;
- reagendamento;

poderá afastar direito legal indisponível quando ele for aplicável.

---

# 20. Cancelamento e reembolso como domínios próprios

## 20.1 Solicitação de cancelamento

Cada solicitação deverá armazenar, no mínimo:

- pedido;
- cliente;
- data/hora;
- motivo opcional;
- modalidade;
- status do atendimento no momento da solicitação;
- data da contratação;
- data do atendimento, quando aplicável;
- enquadramento legal/contratual;
- decisão;
- valor calculado de reembolso;
- valor retido;
- justificativa;
- administrador responsável quando houver intervenção manual.

## 20.2 Refund Policy Engine

A regra de reembolso deverá ser centralizada.

Não deverá existir lógica de reembolso espalhada em controllers ou telas.

O mecanismo deverá considerar:

- modalidade;
- data da contratação;
- data do cancelamento;
- status da execução;
- data/hora do agendamento;
- no-show;
- reagendamento;
- direito de arrependimento;
- exceções;
- valor total pago;
- regras legais prioritárias.

## 20.3 Possíveis decisões

```text
FULL_REFUND
PARTIAL_REFUND
NO_REFUND
MANUAL_REVIEW_REQUIRED
```

A decisão `NO_REFUND` somente poderá ocorrer quando juridicamente e contratualmente válida.

---

# 21. Pagamentos

## 21.1 Processamento

O pagamento deverá ocorrer por provedor externo.

O sistema não deverá armazenar:

- número completo de cartão;
- CVV;
- credenciais bancárias.

## 21.2 Estados financeiros

Exemplos de estados:

```text
PENDING
APPROVED
REJECTED
CANCELLED
REFUND_PENDING
PARTIALLY_REFUNDED
REFUNDED
```

## 21.3 Confirmação

A confirmação de pagamento deverá ser orientada por informação confiável do provedor, preferencialmente webhook/evento servidor-servidor.

A tela de retorno do usuário não deverá ser a única fonte de verdade financeira.

---

# 22. Área do consulente

A área autenticada deverá conter, no mínimo:

## 22.1 Dashboard

- próxima consulta;
- perguntas pendentes;
- histórico;
- cancelamentos/reembolsos em andamento.

## 22.2 Meus atendimentos

Listagem de:

- perguntas;
- consultas;
- data;
- modalidade;
- status;
- preço;
- prioridade quando aplicável.

## 22.3 Detalhes do pedido

Deverá exibir:

- identificador;
- modalidade;
- valor;
- pagamento;
- status;
- SLA quando aplicável;
- agendamento quando aplicável;
- documentos aceitos;
- histórico relevante;
- ações atualmente permitidas.

## 22.4 Minha conta

- dados cadastrais;
- dados de contato;
- segurança;
- solicitação de correção cadastral.

## 22.5 Privacidade

- canal de direitos do titular;
- solicitações anteriores;
- possibilidade de requerer acesso/correção/outros direitos aplicáveis.

---

# 23. Painel administrativo

O backoffice é parte obrigatória do produto.

## 23.1 Dashboard administrativo

Indicadores como:

- consultas do dia;
- perguntas aguardando;
- perguntas prioritárias;
- atendimentos em execução;
- cancelamentos pendentes;
- reembolsos pendentes;
- solicitações cadastrais;
- análises manuais.

## 23.2 Clientes

- identificação;
- contato;
- histórico;
- solicitações cadastrais;
- documentos aceitos;
- registros administrativos permitidos.

## 23.3 Pedidos

- pesquisa e filtros;
- detalhes;
- pagamento;
- atendimento;
- cancelamento;
- histórico de eventos.

## 23.4 Perguntas

- fila regular;
- fila prioritária;
- SLA;
- iniciar atendimento;
- marcar entrega;
- concluir;
- cancelar;
- encaminhar para revisão.

## 23.5 Consultas

- agenda;
- reagendamento;
- cancelamento;
- no-show;
- conclusão;
- exceções.

## 23.6 Pagamentos

- status;
- transações;
- reembolsos;
- conciliação quando aplicável.

## 23.7 Termos/documentos

- criar nova versão;
- publicar;
- descontinuar versão;
- consultar aceitações.

## 23.8 LGPD/privacidade

- solicitações;
- status;
- tratamento;
- registro de resposta.

## 23.9 Auditoria

Consulta a eventos administrativos relevantes.

---

# 24. Comunicações transacionais

O sistema deverá suportar comunicações automáticas para, no mínimo:

- criação de conta;
- confirmação de pagamento;
- pagamento não aprovado;
- confirmação de pergunta;
- confirmação de prioridade;
- confirmação de consulta;
- lembrete de consulta;
- reagendamento solicitado;
- reagendamento confirmado;
- cancelamento solicitado;
- cancelamento processado;
- reembolso iniciado;
- reembolso concluído;
- alteração cadastral;
- solicitação de privacidade;
- demais eventos relevantes.

Comunicação transacional não deverá depender diretamente da transação principal de banco.

Na especificação técnica, deverá ser considerada abordagem orientada a eventos/outbox ou mecanismo equivalente.

---

# 25. Privacidade e proteção de dados

## 25.1 Categorias de dados

O sistema poderá tratar:

- dados de identificação;
- dados de contato;
- dados contratuais;
- dados financeiros administrativos;
- dados de agenda;
- registros de consentimento;
- dados voluntariamente apresentados na consulta;
- dados pessoais sensíveis voluntariamente revelados.

## 25.2 Conteúdo potencialmente sensível

Consultas podem revelar:

- convicção religiosa;
- participação religiosa;
- saúde;
- vida sexual;
- relacionamentos;
- situação financeira;
- informações de terceiros.

Esse conteúdo não deverá ser tratado como dado administrativo comum.

## 25.3 Minimização

O sistema não deverá coletar ou reter conteúdo excessivo sem finalidade definida.

A existência de capacidade técnica de armazenamento não cria autorização para armazenar tudo.

## 25.4 Conteúdo da consulta x histórico administrativo

Distinguir:

### Histórico administrativo

Exemplo:

```text
Consulta #1234
Método: Baralho Cigano
Data: 21/08/2026
Status: Concluída
Valor: R$ X
```

### Conteúdo privado

Exemplo:

```text
Pergunta realizada
Interpretação
Áudio
Imagem do jogo
Informações íntimas
```

O conteúdo privado deverá possuir tratamento, acesso e retenção mais restritos.

---

# 26. Gravação de consultas

## 26.1 Consentimento separado

Aceitar os Termos não significa autorizar gravação.

Quando houver gravação, deverá existir manifestação específica e separada.

## 26.2 Recusa

A recusa à gravação não impede ordinariamente a consulta.

## 26.3 Retenção

Como política operacional:

**até 90 dias após o atendimento**

salvo existência de motivo concreto para retenção jurídica/probatória.

## 26.4 Legal hold

Deverá existir mecanismo equivalente a:

```text
legalHold = true
```

quando necessário preservar a gravação por:

- reclamação;
- contestação;
- litígio;
- ameaça concreta de litígio;
- preservação de prova;
- exercício regular de direitos.

Enquanto houver legal hold, a exclusão automática deve permanecer suspensa.

---

# 27. Confidencialidade

São conteúdos potencialmente confidenciais:

- identidade;
- dados de contato;
- perguntas;
- histórico pessoal;
- informações afetivas;
- informações familiares;
- informações profissionais;
- dados financeiros relatados;
- dados espirituais e religiosos;
- saúde;
- vida sexual;
- terceiros;
- cartas, quedas e interpretações;
- mensagens;
- áudios;
- imagens;
- documentos;
- informações sobre procedimentos espirituais.

A aplicação deverá implementar controles de acesso compatíveis com essa natureza.

---

# 28. Controle de acesso administrativo

Mesmo que inicialmente exista apenas um administrador, o modelo não deverá assumir que todo administrador futuro possui acesso irrestrito a todo conteúdo.

A solução técnica deverá permitir evolução para RBAC/permissões.

Separação conceitual mínima:

```text
DADOS ADMINISTRATIVOS
→ acesso operacional

CONTEÚDO DE CONSULTA
→ acesso restrito

CONTEÚDO SENSÍVEL
→ acesso restrito + auditoria reforçada
```

---

# 29. Auditoria

Eventos relevantes deverão gerar registros imutáveis ou protegidos contra alteração administrativa ordinária.

Exemplos:

```text
21/08/2026 14:32
Pergunta #123
QUEUED → IN_PROGRESS
Admin: X
```

```text
21/08/2026 16:02
Consulta #456
BOOKED → NO_SHOW
Admin: X
```

```text
21/08/2026 16:10
RefundDecision
Automático: 50%
Override: 100%
Motivo: emergência comprovada
Admin: X
```

A auditoria deve cobrir:

- mudanças de status;
- alterações cadastrais;
- cancelamentos;
- reembolsos;
- overrides;
- acesso/alteração de documentos;
- operações sensíveis;
- consentimentos e aceitações.

---

# 30. Timeline de contratação

O histórico deve preservar eventos, não apenas o estado atual.

Exemplo:

```text
18/08 — Pedido criado
18/08 — Pagamento aprovado
18/08 — Consulta marcada para 25/08 14h
21/08 — Reagendamento solicitado
21/08 — Novo horário confirmado para 27/08 16h
27/08 — Consulta realizada
27/08 — Atendimento concluído
```

O administrador poderá visualizar histórico mais detalhado.

O cliente verá apenas eventos apropriados à sua área.

---

# 31. Catálogo e parâmetros comerciais

Serviços deverão ser administráveis sem alteração de código sempre que razoável.

Exemplo:

```text
PERGUNTA AVULSA
Preço
Prazo
Canal
Prioridade disponível
Preço da prioridade
Status de venda
```

```text
CONSULTA ONLINE
Preço
Duração
Canal
Agenda
Status de venda
```

Regras legais estruturais não deverão ser transformadas em parâmetros livremente editáveis sem controle de versão.

---

# 32. Regras invariantes

As seguintes regras deverão ser tratadas como invariantes do domínio.

1. Nenhum atendimento pago pode ser considerado confirmado antes da confirmação financeira confiável.
2. Nenhuma pergunta é considerada iniciada apenas por estar na fila.
3. Pergunta somente inicia por ação administrativa explícita.
4. Prioridade não interrompe serviço já iniciado.
5. Prioridade não altera o SLA máximo de 48 horas úteis.
6. Prioridade integra o valor total da contratação para reembolso.
7. Pergunta só é considerada entregue após pergunta + foto do jogo + áudio.
8. Consulta não pode vender definitivamente o mesmo slot para dois pedidos.
9. Reagendamento do cliente só é consumido após novo horário confirmado.
10. Reagendamento provocado pelo prestador não consome o direito do cliente.
11. No-show e cancelamento tardio são eventos distintos.
12. Direito legal obrigatório prevalece sobre retenções contratuais.
13. Aceite jurídico deve estar vinculado a uma versão específica.
14. Gravação exige consentimento separado.
15. Conteúdo privado/sensível não deve ser tratado como dado administrativo comum.
16. Toda decisão manual relevante deve ser auditada.
17. Reembolso deve ser calculado centralmente por regra de domínio.
18. Alterações de dados cadastrais protegidos exigem solicitação e trilha de auditoria.

---

# 33. Domínios conceituais esperados

A modelagem técnica poderá utilizar nomes diferentes, mas deverá representar conceitualmente:

```text
Identity
Customer
CustomerProfile
CustomerContact
DataCorrectionRequest

Catalog
ServiceOffering
ServicePrice

Ordering
Order
OrderItem

Payment
PaymentTransaction
Refund

QuestionService
QuestionRequest
Queue
Priority

Scheduling
Appointment
AppointmentSlot
RescheduleRequest

Fulfillment
ServiceExecution

Cancellation
CancellationRequest
RefundDecision

Legal
LegalDocument
LegalDocumentVersion
LegalAcceptance
RecordingConsent

Privacy
PrivacyRequest
LegalHold

Notification
NotificationTemplate

Administration
AdminUser

Audit
AuditLog
```

---

# 34. Arquitetura funcional recomendada

A organização recomendada é um **monólito modular**, mantendo domínios bem separados.

Exemplo conceitual:

```text
marmoteiro
├── identity
├── customer
├── catalog
├── ordering
├── payment
├── scheduling
├── question
├── fulfillment
├── cancellation
├── legal
├── privacy
├── notification
├── administration
└── audit
```

A decisão técnica final caberá à etapa de arquitetura, desde que preserve os limites de domínio descritos neste documento.

---

# 35. Segurança mínima esperada

A especificação técnica deverá obrigatoriamente abordar:

- hashing seguro de senha;
- sessão/autenticação segura;
- recuperação de senha;
- validação de e-mail;
- proteção contra brute force;
- rate limiting;
- CSRF quando aplicável;
- validação de entrada;
- autorização;
- RBAC;
- criptografia em trânsito;
- proteção de segredos;
- backup;
- segregação de ambientes;
- logs;
- auditoria;
- retenção;
- proteção de conteúdo sensível;
- princípio do menor privilégio;
- segurança do webhook de pagamento.

---

# 36. Ajustes obrigatórios nos documentos jurídicos antes da publicação

Os documentos jurídicos atuais deverão receber nova versão antes do go-live para refletir integralmente o sistema.

## 36.1 Política de Privacidade

Atualizar para declarar expressamente a coleta, quando aplicável, de:

- nome civil;
- nome social;
- data de nascimento;
- nome da mãe;
- identidade de gênero;
- pronomes;
- e-mail;
- telefone/WhatsApp.

Remover a regra atual que informa, como regra geral, que nome da mãe não será solicitado.

Preencher todos os placeholders.

Utilizar:

**falecom@marmoteiro.com**

como canal eletrônico de negócio e privacidade, enquanto não houver outro canal específico.

## 36.2 Termo de Sigilo

Preencher os campos de identificação do prestador.

Substituir e-mail pessoal pelo e-mail comercial.

## 36.3 Termos de Atendimento

Atualizar para refletir:

- contratação pelo novo site;
- cancelamento pelo próprio sistema;
- fluxo de pergunta avulsa;
- SLA de 48 horas úteis;
- fila prioritária paga;
- definição de início da execução;
- definição de entrega;
- tratamento do cancelamento da pergunta;
- integração do valor da prioridade ao valor total da contratação;
- canais eletrônicos atuais.

---

# 37. Itens parametrizáveis a definir na etapa técnica/operacional

Os seguintes pontos não são lacunas de regra de negócio. São parâmetros operacionais que deverão ser configuráveis:

- preço da pergunta;
- preço da prioridade;
- preço da consulta;
- duração da consulta;
- calendário de horas úteis;
- feriados;
- horário de operação;
- tempo de hold do slot durante checkout;
- meios de pagamento habilitados;
- plataforma de videoconferência;
- templates de e-mail;
- intervalo e quantidade de lembretes;
- capacidade operacional da fila.

Alterar esses valores não deverá exigir reconstrução do domínio.

---

# 38. Critério para a próxima etapa

Este documento é a fonte funcional/regulatória para o próximo levantamento.

A etapa técnica deverá transformar esta especificação em, no mínimo:

1. arquitetura de software;
2. módulos;
3. modelo de dados;
4. máquinas de estado;
5. contratos de API;
6. modelo de autorização;
7. estratégia de autenticação;
8. integração de pagamento;
9. estratégia de agenda;
10. estratégia de filas;
11. motor de cancelamento/reembolso;
12. estratégia de notificações;
13. retenção e privacidade;
14. observabilidade;
15. segurança;
16. testes;
17. infraestrutura;
18. CI/CD;
19. backlog implementável.

Agentes de IA responsáveis pela estruturação técnica **não deverão inventar, reinterpretar ou simplificar regras de negócio descritas aqui**. Quando encontrarem uma decisão técnica que possa modificar comportamento funcional, deverão tratá-la como questão de arquitetura e preservar este documento como fonte de verdade.

---

# 39. Status final

**Funcional:** definido.  
**Regras de negócio:** definidas.  
**Requisitos regulatórios:** definidos para fins de especificação técnica.  
**Próxima etapa:** levantamento e desenho técnico.

