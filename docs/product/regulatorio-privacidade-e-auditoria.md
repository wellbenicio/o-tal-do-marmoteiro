# Regulatório, Privacidade e Auditoria

Este documento traduz os documentos jurídicos e as decisões do produto em requisitos de sistema. Não substitui os documentos jurídicos versionados.

## 1. Fontes

Baseline derivado de:

- ORACULO-TERMOS-v1.0;
- ORACULO-PRIVACIDADE-v1.0;
- ORACULO-SIGILO-v1.0;
- decisões funcionais consolidadas em 21/09/2026.

## 2. CDC e comércio eletrônico

Requisitos de implementação:

- informação clara sobre modalidade, preço, duração/prazo e canal antes do pagamento;
- resumo da contratação;
- registro do que foi aceito;
- meio eletrônico para cancelamento/arrependimento quando aplicável;
- confirmação do recebimento da solicitação;
- tratamento de restituição conforme regra legal/contratual;
- legislação obrigatória tem precedência sobre retenções do produto.

## 3. Reembolso de pergunta prioritária

O adicional de prioridade integra a contratação da pergunta.

Consequência:

- não criar "taxa de prioridade não reembolsável";
- quando houver reembolso integral, devolver o valor total;
- o checkout pode discriminar base + adicional apenas para transparência.

## 4. Serviço iniciado

O clique administrativo em "Iniciar atendimento" é marco operacional e probatório.

Ele NÃO deve ser transformado automaticamente em:

`withdrawalRight = false`

Casos juridicamente controversos devem ser encaminhados a revisão manual.

## 5. Dados pessoais

O produto coletará dados de cadastro relevantes ao atendimento e à relação contratual:

- nome civil;
- nome social;
- data de nascimento;
- nome da mãe;
- identidade de gênero;
- pronomes;
- e-mail;
- telefone/WhatsApp.

Os documentos de privacidade devem refletir expressamente esses campos e suas finalidades.

## 6. Correção de dados

Como alguns dados não serão editáveis diretamente, deve existir fluxo de correção cadastral.

A UI pode bloquear edição direta, mas o sistema não deve bloquear o exercício de correção.

## 7. Dados pessoais sensíveis e conteúdo íntimo

Atendimentos podem conter:

- convicção/participação religiosa;
- saúde;
- vida sexual;
- situação financeira;
- relacionamentos;
- informações de terceiros.

Isso exige:

- minimização;
- acesso restrito;
- segregação lógica;
- retenção por finalidade;
- proteção contra acesso indevido;
- auditoria de operações sensíveis quando tecnicamente adequado.

## 8. Terceiros

O produto deve orientar o consulente a evitar dados excessivos de terceiros.

Não solicitar por padrão:

- CPF/RG de terceiros;
- endereço;
- dados bancários;
- prontuários;
- documentos sem necessidade.

## 9. Versionamento jurídico

Entidades conceituais:

```text
LegalDocument
LegalDocumentVersion
LegalAcceptance
```

O aceite deve permitir demonstrar:

- qual documento;
- qual versão;
- quando;
- para qual contratação;
- qual manifestação ocorreu.

## 10. Gravação

Entidade conceitual separada:

```text
RecordingConsent
- orderId
- customerId
- granted
- decidedAt
- version
```

Recusa não deve impedir ordinariamente a consulta.

## 11. Retenção de gravação

Regra operacional:

- até 90 dias após atendimento;
- depois, excluir;
- exceção: legal hold por reclamação, contestação, processo, ameaça concreta de litígio ou preservação de prova.

## 12. Sigilo

A contratação não autoriza:

- publicar nome;
- foto;
- áudio;
- vídeo;
- print;
- pergunta;
- resultado;
- depoimento identificável;
- perfil social.

Autorização de publicação deve ser específica e separada.

## 13. Auditoria

Eventos que exigem trilha:

- aceite jurídico;
- consentimento de gravação;
- mudança de status de atendimento;
- início/entrega;
- no-show;
- reagendamento;
- cancelamento;
- refund;
- override;
- correção cadastral;
- legal hold;
- ações administrativas sensíveis.

## 14. Canal oficial

Usar apenas:

`falecom@marmoteiro.com`

Remover o e-mail pessoal das próximas versões publicáveis.

O mesmo endereço pode, inicialmente, servir como canal de privacidade/LGPD.

## 15. Revisão dos documentos jurídicos

Antes do go-live, gerar versões novas que incluam:

- novos campos cadastrais;
- nome da mãe;
- nome social;
- identidade de gênero/pronomes;
- contratação pelo site;
- cancelamento dentro do site;
- fluxo de pergunta avulsa;
- SLA de 48 horas úteis;
- prioridade;
- marco de início;
- definição de entrega;
- tratamento de cancelamento;
- e-mail comercial único.

As versões antigas não devem ser retroativamente alteradas no histórico de aceitações.
