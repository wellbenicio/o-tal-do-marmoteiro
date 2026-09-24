# ADR 0003 — Infraestrutura de baixo custo e identidade Firebase

Data: 22/09/2026. Status: diretriz adotada para preparação; ativação dos provedores depende de projeto/contas do responsável. Complementa ADRs 0001/0002, substituindo a obrigatoriedade inicial de Redis/BullMQ. Não altera regras funcionais.

## Decisão

- Preservar Next.js, NestJS, Prisma/PostgreSQL e monólito modular. Preparar imagens portáveis para evitar dependência exclusiva de uma hospedagem.
- Destino inicial recomendado: Cloud Run com cobrança por requisição para os containers Next.js e NestJS, com PostgreSQL Neon. Cloud Run precisa de faturamento Google Cloud; franquias podem resultar em custo zero, mas não são garantia de fatura zero. Firebase continua sendo a identidade.
- App Hosting permanece como alternativa de web gerenciada: há configuração candidata, mas a tabela oficial consultada não confirma suporte ativo ao Next.js 16.3.6 deste projeto, nem cobertura equivalente para nosso monorepo npm simples. Homologar o adaptador antes de escolhê-lo; não fazer downgrade do framework só por hospedagem. [Suporte oficial](https://firebase.google.com/docs/app-hosting/frameworks-tooling).
- Adotar Firebase Authentication para identidade de consulentes na próxima etapa funcional. Credenciais, verificação de e-mail e recuperação ficam no Firebase; cadastro comercial protegido fica no PostgreSQL com associação única ao UID. Firebase Authentication não exige Firestore.
- Manter o acesso administrativo existente enquanto a identidade é integrada. A futura associação Firebase do administrador depende de provisionamento autorizado no servidor e conta ativa no banco; cadastro público nunca concede papel administrativo. Não há migração automática de hash scrypt local.
- Não adotar Firestore/Realtime Database como segundo banco transacional agora. Firestore possui transações, mas migrar exigiria redesenhar relações, garantias de agenda, relatórios, histórico jurídico, auditoria e outbox. Não há economia comprovada que justifique esse trabalho. SQL Connect (antes Data Connect) usa Cloud SQL e não elimina seu custo após o período de avaliação.
- Não exigir Redis enquanto a outbox PostgreSQL atende a demanda. O worker deve terminar dentro de uma requisição autenticada; timer local é opcional. No futuro, Cloud Tasks agenda despachos, e uma reconciliação periódica recupera tarefas pendentes. A integração de Cloud Tasks ainda não está implementada.
- E-mails transacionais: Resend é o candidato inicial. Caixa postal profissional continua no provedor de e-mail do domínio; são serviços distintos. WhatsApp utiliza API oficial e templates/consentimentos; taxa por mensagem não é custo de hospedagem.

## Consequências

Dois runtimes não significam microserviços de negócio: a API continua um único módulo de implantação com seus domínios internos. Instâncias mínimas zero reduzem ociosidade e introduzem partida a frio. Banco externo demanda TLS, pool pequeno, região compatível e medição de latência/transferência.

A quantidade de contas não determina custo sozinha: importam acessos, consultas, jobs, arquivos, mensagens e builds. Verificação a cada minuto ou timer de 15 segundos pode manter um PostgreSQL serverless ativo o mês inteiro. Backups, logs, imagens de build e segredos também entram no orçamento.

Escalar primeiro por medição: aumentar franquia/pool/instâncias, índices e processamento em lote. Redis ou serviços separados só entram quando houver gargalo comprovado, sem remover capacidades do baseline.

## Alternativas

- Vercel Pro: operação confortável de Next.js, mas custo fixo inicial; Hobby não permite uso comercial.
- Netlify Free: aceita projetos comerciais, tem limite de créditos e pode pausar ao esgotá-los. Pode hospedar a prévia; NestJS/banco continuam exigindo destino próprio.
- Cloudflare Workers: opção econômica, mas runtime/adaptador OpenNext e limites de CPU precisam de homologação; não é substituição direta do container NestJS.
- Firebase App Hosting: simplifica domínio/CDN/build de Next.js quando a combinação framework/monorepo está homologada. Exige Blaze; configuração candidata em `apps/web/apphosting.yaml`.
- VPS: custo mensal e manutenção de sistema, backups, TLS e banco mesmo sem tráfego. Não é a recomendação para esta fase.

Preços, fontes e hipóteses estão em [custos](../architecture/custos.md); estado da implementação e sequência em [mapa técnico](../architecture/README.md).
