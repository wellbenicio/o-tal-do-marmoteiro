# Acesso administrativo e canais de consulta

## Estado desta entrega — 22/09/2026

O login da gestão é real: conta e hash de senha no PostgreSQL, sessão revogável no servidor, cookie HttpOnly e verificação em páginas e APIs. A área do cliente, pedidos, financeiro e ações comerciais continuam demonstrativos, com dados fictícios no navegador. A autenticação administrativa não transforma essas simulações em operação comercial.

`/gestao` encaminha visitantes para `/gestao/login`. Não existe cadastro público administrativo, senha padrão ou aprovação por link de e-mail. Uma conta de consulente não dá acesso à gestão. A criação depende de acesso ao servidor/banco e fica sob controle do responsável.

## Contas externas e e-mail — atualização em 28/09/2026

O domínio está registrado na Cloudflare, o e-mail do domínio ainda será configurado e Google Workspace não será contratado. Usar conta Google pessoal para preparar Calendar/Meet; verificar recursos adicionais do AI Pro estudantil na conta organizadora. Firebase Spark, passagem para Blaze no deploy Cloud Run e resgate dos benefícios Developer estão detalhados no [guia de contas](./architecture/configuracao-das-contas.md). Conta Firebase/Google pessoal não concede acesso administrativo ao sistema.

## Configuração local

1. Inicie Postgres com `docker compose up -d postgres`. Redis é opcional e não é utilizado pela execução atual.
2. Configure `apps/api/.env` a partir de `.env.example`. Use o banco local e gere um `ADMIN_API_SECRET` aleatório de pelo menos 32 caracteres. Não sobrescreva arquivos de ambiente já configurados.
3. Configure `apps/web/.env.local` a partir de `apps/web/.env.example`: mesma chave, `ADMIN_API_URL=http://127.0.0.1:3001` e `APP_ORIGIN=http://localhost:3008`.
4. Execute os comandos da raiz:

```sh
npm run prisma:generate --workspace @marmoteiro/api
npm run prisma:deploy --workspace @marmoteiro/api
npm run dev:api
# Em outro terminal:
npm run dev:web -- --port 3008
```

Neste workspace, banco, migrações e arquivos locais de ambiente já foram configurados. Credenciais locais são ignoradas pelo Git. Falha da API ou do banco nega acesso à gestão.

## Criar o seu acesso

Na raiz do projeto, em um terminal interativo, substitua o endereço abaixo pelo seu:

```sh
npm run admin:create -- --email "seu-email@dominio.com" --name "Well"
```

Digite uma senha de 15 a 128 caracteres e confirme. A entrada é oculta; a senha não deve ser passada como argumento, variável de ambiente ou mensagem de chat. O banco guarda o hash scrypt com sal aleatório. A CLI cria o papel `OWNER` e registra auditoria. Não há conta administrativa provisionada automaticamente.

Depois, entre em `http://localhost:3008/gestao`. A sessão dura até oito horas. Sair revoga o token; desativar a conta ou redefinir a senha invalida as sessões existentes:

```sh
npm run admin:password -- --email "seu-email@dominio.com"
npm run admin:disable -- --email "seu-email@dominio.com"
```

Redefinir senha não reativa conta desativada. A limitação de tentativas persiste no banco. O proxy deve ser configurado antes de ativar `TRUST_PROXY_HEADERS`; por padrão, o limite por origem é compartilhado para impedir falsificação de IP.

## Perguntas e videochamadas

- `/agendar?modalidade=pergunta` coleta pergunta e contexto opcional antes do pagamento. `/gestao/perguntas` exibe esses campos e o WhatsApp do consulente. A entrega mantém identificação da pergunta, foto e áudio; o início é manual e exige pergunta registrada.
- `/gestao/agenda` identifica consultas por Google Meet. `/gestao/pedidos` permite filtrar as duas modalidades.
- O checkout de consulta apresenta convite Calendar/Meet por e-mail e um consentimento opcional, inicialmente desmarcado, para lembretes WhatsApp. Registra versão, data e número; a escolha é independente da gravação.
- A prévia não envia mensagens nem inventa links de reunião. Pergunta/contexto não aparecem nas prévias de e-mail. A persistência cifrada e a auditoria de leitura do conteúdo íntimo ainda precisam ser implementadas antes de receber consultas reais.

## Integrações implementadas no backend, ainda desativadas

O adaptador Google cria/atualiza um evento privado com ID estável, gera Meet exclusivo e usa `sendUpdates=all` para o próprio Google enviar o convite ao consulente. Reagendamento atualiza o evento; cancelamento efetivo remove o evento e impede lembretes futuros. Solicitação de cancelamento em análise mantém o evento e suspende lembretes de confirmação.

O adaptador WhatsApp usa a API oficial com template aprovado em `pt_BR`: quatro parâmetros de corpo, nesta ordem: primeiro nome, data, horário de Brasília e link Meet. Só envia com manifestação específica vigente e número correspondente. A outbox revalida pagamento, horário, consentimento e cancelamento antes de cada envio. Respostas de aceite do provedor são `ACCEPTED`, sem presumir entrega. Timeout de envio vai para `MANUAL_REVIEW` para evitar duplicidade.

Variáveis de servidor em `apps/api/.env.example`:

| Integração | Configuração |
| --- | --- |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` |
| WhatsApp | `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_REMINDER_TEMPLATE`, `WHATSAPP_GRAPH_VERSION` |
| Processamento | `COMMUNICATIONS_ENABLED=false`; manter assim durante a prévia |
| Antecedência dos lembretes | `CONSULTATION_REMINDER_MINUTES=1440,60`, configurável; não altera o SLA de perguntas |

O Google exige autorização OAuth offline da conta/calendário e permissão de criação de eventos/Meet. O painel mostra se as credenciais estão preenchidas; isso não comprova conexão homologada. O WhatsApp exige número e template aprovados e uma versão Graph suportada configurada explicitamente.

Ainda faltam: conectar `enqueueCalendar(tx, appointmentId)` às transações confiáveis de confirmação de pagamento, agendamento, reagendamento e cancelamento; persistir/permitir revogar consentimentos pelo cliente; conexão OAuth pelo painel e armazenamento seguro dos tokens; leitura de disponibilidade pessoal; webhooks Meta para recibos de entrega; operação de revisão de falhas; provedor de e-mail para notificações comerciais além dos convites Google. Nenhum botão de pagamento de demonstração aciona o worker real.

O processador usa leases e chaves únicas na outbox PostgreSQL. O padrão `OUTBOX_RUNNER=scheduled` executa um lote completo por `POST /internal/jobs/communications`, protegido por `x-outbox-secret` e um `OUTBOX_TRIGGER_SECRET` próprio de pelo menos 32 caracteres. O agendador remoto ainda não está conectado. `poll` é opção explícita apenas para processo persistente e é recusada em Cloud Run. Publicar apenas o frontend não hospeda API/banco. No ambiente publicado, configure HTTPS, API acessível pelo BFF, segredo privado compartilhado, origem exata e migrações. Não exponha segredos com prefixo `NEXT_PUBLIC`. Consulte [deploy e operação](./architecture/deploy.md).

## Verificação

```sh
npm run lint --workspace @marmoteiro/web
npm run test --workspace @marmoteiro/web
npm run build --workspace @marmoteiro/web
npm run lint --workspace @marmoteiro/api
RUN_DATABASE_TESTS=true npm run test --workspace @marmoteiro/api -- --runInBand
npm run build --workspace @marmoteiro/api
```

Os testes de banco criam e removem contas temporárias próprias; use banco local/de teste. Adaptadores externos são substituídos por mocks nos testes, sem envio de e-mail ou WhatsApp. Build da API e servidor em modo watch compartilham `dist`: pare o watch durante o build e reinicie depois.

Validação desta entrega: 28 testes da API (incluindo PostgreSQL) e 28 do frontend; lint, TypeScript e builds. No Chrome, foram verificados acesso direto bloqueado, sessão falsa, origem externa rejeitada, login válido, logout/revogação e conta desativada, pergunta do checkout chegando à gestão, prévias de comunicação sem conteúdo íntimo, escolha independente de WhatsApp/gravação e ausência de transbordamento nas oito telas administrativas em 375, 768 e 1440 px. As contas temporárias de teste foram removidas.

Referências: [ADR 0002](./adr/0002-acesso-administrativo-e-canais.md), [análise de lacunas](./product/gap-analysis-acesso-e-canais.md), [criação de eventos Google](https://developers.google.com/workspace/calendar/api/guides/create-events), [política WhatsApp](https://whatsappbusiness.com/policy/).
