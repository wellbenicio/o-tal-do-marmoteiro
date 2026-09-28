# Deploy e operação

Atualizado em 22/09/2026. **Preparação local; nenhum deploy remoto foi concluído.** Faltam autenticação do proprietário, projeto Firebase/Google Cloud, conta de faturamento escolhida e banco remoto. Este roteiro não cria recursos sozinho. [Custos e franquias](./custos.md) e [estado funcional](./README.md).

Para criar as contas e recursos desde o início, seguir o [guia detalhado do proprietário](./configuracao-das-contas.md), que inclui conta de build explícita, permissões e bucket de fonte. Este arquivo é a referência operacional resumida.

## Destino e pré-requisitos

Primeiro destino: dois serviços Cloud Run, web Next.js e API NestJS, no mesmo projeto/região; PostgreSQL Neon por TLS. Firebase Authentication será integrado na próxima etapa funcional. Publicar esta versão é publicar uma prévia, com administração autenticada e operações comerciais demonstrativas.

O responsável deve ter acesso ao projeto Google Cloud/Firebase e ao Neon, habilitar faturamento conscientemente e escolher região. `us-central1` nos exemplos é referência de preço, não decisão automática sobre localização de dados. Usar região próxima entre API e banco; registrar latência, transferência e requisitos de dados. Não alterar MX/e-mail do domínio ao publicar o site.

Ferramentas locais: Node 22, npm, Docker; para a publicação, Google Cloud CLI autenticada e permissões para Cloud Build, Artifact Registry, Cloud Run, IAM e Secret Manager. Firebase CLI só é necessária para a alternativa App Hosting ou etapas de Firebase. Não solicitar senha pessoal/token por chat: o proprietário autentica no fluxo oficial do provedor.

Antes de enviar fonte, revisar `git status` na branch `dev`, arquivos ignorados, build e testes. `.gcloudignore`/`.dockerignore` excluem ambientes, dependências locais, credenciais, caches e referências Figma. Não usar `git add .` ou publicar alterações de outra pessoa sem revisar o conjunto. Não executar `migrate reset`/`db push` em banco compartilhado.

## Variáveis e segredos

| Serviço | Nome | Valor/configuração |
| --- | --- | --- |
| API | `DATABASE_URL` | URL PostgreSQL pooled com TLS; segredo `marmoteiro-database-url` |
| Migração | `DIRECT_DATABASE_URL` | URL direta com TLS; segredo `marmoteiro-database-direct-url`; fallback para `DATABASE_URL` se ausente |
| Web e API | `ADMIN_API_SECRET` | Mesmo segredo aleatório de pelo menos 32 caracteres; `marmoteiro-admin-api-secret` |
| Web | `ADMIN_API_URL` | URL HTTPS da API, acessível apenas pelo código servidor |
| Web | `APP_ORIGIN` | Origem HTTPS exata da web; ajustar quando trocar o domínio |
| Web | `TRUST_PROXY_HEADERS` | `false` até validar a cadeia de proxies e isolamento da origem |
| API | `DATABASE_POOL_MAX` | `3`, inteiro entre 1 e 20 |
| API | `OUTBOX_RUNNER` | `scheduled`; `poll` é recusado quando existe `K_SERVICE` |
| API | `COMMUNICATIONS_ENABLED` | `false` na prévia; não habilitar com checkout fictício |
| API, futura ativação de jobs | `OUTBOX_TRIGGER_SECRET` | Segredo independente de pelo menos 32 caracteres; omitido, endpoint nega acesso |
| API | `HOST` / `PORT` | `0.0.0.0` / `8080`; Cloud Run fornece `PORT` |
| Web | `HOSTNAME` / `PORT` | `0.0.0.0` / `8080` |

Guardar valores no Secret Manager e conceder `secretAccessor` apenas nos segredos específicos necessários a cada conta de serviço. Web nunca recebe `DATABASE_URL`; job de migração nunca recebe tokens Google/Meta. Fixar versões de segredos por release. A configuração candidata do App Hosting referencia `marmoteiro-api-url`, `marmoteiro-app-origin` e `marmoteiro-admin-api-secret`.

Criar segredos no console ou com entrada protegida de arquivo temporário `0600`, fora do repositório, removido após uso. Nunca colocar valores em argumentos públicos, histórico, prints, `NEXT_PUBLIC_*`, workflow ou logs. Os arquivos `.env.example` são contrato de configuração, não credenciais de produção.

## Build e migração

Validar localmente antes de publicar:

```sh
npm ci
npm run prisma:generate --workspace @marmoteiro/api
npm run prisma:deploy --workspace @marmoteiro/api
npm run lint
RUN_DATABASE_TESTS=true npm run test --workspace @marmoteiro/api -- --runInBand
npm run test --workspace @marmoteiro/web
npm run typecheck --workspace @marmoteiro/shared
npm run build
docker build -f apps/api/Dockerfile --target runtime -t marmoteiro-api:review .
docker build -f apps/api/Dockerfile --target migrate -t marmoteiro-migrate:review .
docker build -f apps/web/Dockerfile -t marmoteiro-web:review .
```

Use banco de teste nos testes com `RUN_DATABASE_TESTS`; não testar contra produção. Build nativo e API em modo watch compartilham `dist`, então parar o watch antes desse build e reiniciar depois. Docker não compartilha esse diretório. Builds locais usam a arquitetura da máquina; Cloud Run exige imagem Linux compatível, gerada no Cloud Build ou com `--platform linux/amd64`.

O workflow `.github/workflows/ci.yml` executa testes em PostgreSQL descartável, lint e builds. Ele não publica, provisiona banco ou altera produção. Seu primeiro resultado remoto depende de publicar o código no GitHub.

Após contas/recursos/permissões configurados, definir variáveis **não secretas** para o release:

```sh
export MARMOTEIRO_PROJECT='id-real-do-projeto'
export MARMOTEIRO_REGION='regiao-escolhida'
export MARMOTEIRO_REPOSITORY='marmoteiro'
export MARMOTEIRO_RELEASE='identificador-imutavel-do-release'
export MARMOTEIRO_IMAGES="${MARMOTEIRO_REGION}-docker.pkg.dev/${MARMOTEIRO_PROJECT}/${MARMOTEIRO_REPOSITORY}"
```

Habilitar APIs necessárias no projeto e criar repositório Docker no Artifact Registry. Criar contas de serviço distintas `marmoteiro-api`, `marmoteiro-web`, `marmoteiro-migrate`; conceder acesso somente aos seus segredos, e ao executor de build permissões para gravar imagens/logs. Configurar limpeza de imagens antigas preservando o release ativo e o anterior. Não anexar papel Owner às contas dos containers.

O arquivo abaixo constrói **web, API e migração**, apesar do nome histórico `cloudbuild-api.yaml`:

```sh
gcloud builds submit --project="$MARMOTEIRO_PROJECT" \
  --config=infra/cloudbuild-api.yaml \
  --substitutions="_REGION=$MARMOTEIRO_REGION,_REPOSITORY=$MARMOTEIRO_REPOSITORY,_RELEASE=$MARMOTEIRO_RELEASE" .
```

Registrar digests retornados e a versão da fonte. Em banco existente, obter backup e verificar restauração antes de migração. Executar a imagem `migrate` como job único, com referência a versões reais dos segredos (`1` é apenas exemplo):

```sh
gcloud run jobs deploy marmoteiro-migrate --project="$MARMOTEIRO_PROJECT" \
  --region="$MARMOTEIRO_REGION" --image="$MARMOTEIRO_IMAGES/migrate:$MARMOTEIRO_RELEASE" \
  --service-account="marmoteiro-migrate@$MARMOTEIRO_PROJECT.iam.gserviceaccount.com" \
  --tasks=1 --parallelism=1 --max-retries=0 --task-timeout=300s \
  --cpu=1 --memory=1Gi \
  --set-secrets='DIRECT_DATABASE_URL=marmoteiro-database-direct-url:1'
gcloud run jobs execute marmoteiro-migrate --project="$MARMOTEIRO_PROJECT" \
  --region="$MARMOTEIRO_REGION" --wait
```

Interromper a publicação se a migração falhar. Migrações não rodam automaticamente a cada instância. O target de migração contém ferramentas de desenvolvimento e não deve receber tráfego web.

## Publicação dos serviços

```sh
gcloud run deploy marmoteiro-api --project="$MARMOTEIRO_PROJECT" \
  --region="$MARMOTEIRO_REGION" --image="$MARMOTEIRO_IMAGES/api:$MARMOTEIRO_RELEASE" \
  --service-account="marmoteiro-api@$MARMOTEIRO_PROJECT.iam.gserviceaccount.com" \
  --allow-unauthenticated --port=8080 --cpu=1 --memory=512Mi \
  --min-instances=0 --max-instances=2 --concurrency=4 --timeout=300 --cpu-throttling \
  --set-env-vars='NODE_ENV=production,HOST=0.0.0.0,DATABASE_POOL_MAX=3,COMMUNICATIONS_ENABLED=false,OUTBOX_RUNNER=scheduled' \
  --set-secrets='DATABASE_URL=marmoteiro-database-url:1,ADMIN_API_SECRET=marmoteiro-admin-api-secret:1'
```

A URL da API é pública no transporte porque o BFF atual usa o segredo interno, sem token IAM/OIDC. `--allow-unauthenticated` não remove os guards da aplicação: `/admin` exige segredo privado e as operações protegidas exigem também sessão administrativa; `/internal/jobs` exige outro segredo. Hoje a rota raiz é pública. Futuros webhooks exigirão validação específica. Trocar para transporte IAM privado exige implementar a autenticação BFF correspondente.

Ler a URL retornada da API para `MARMOTEIRO_API_URL`. Para o primeiro deploy web, definir `MARMOTEIRO_WEB_ORIGIN` com a origem final se já conhecida; caso contrário usar provisoriamente `https://invalid.example` (login falha fechado), obter a URL `run.app` e atualizar imediatamente `APP_ORIGIN` antes do teste de login:

```sh
gcloud run deploy marmoteiro-web --project="$MARMOTEIRO_PROJECT" \
  --region="$MARMOTEIRO_REGION" --image="$MARMOTEIRO_IMAGES/web:$MARMOTEIRO_RELEASE" \
  --service-account="marmoteiro-web@$MARMOTEIRO_PROJECT.iam.gserviceaccount.com" \
  --allow-unauthenticated --port=8080 --cpu=1 --memory=512Mi \
  --min-instances=0 --max-instances=2 --concurrency=40 --timeout=60 --cpu-throttling \
  --set-env-vars="NODE_ENV=production,HOSTNAME=0.0.0.0,ADMIN_API_URL=$MARMOTEIRO_API_URL,APP_ORIGIN=$MARMOTEIRO_WEB_ORIGIN,TRUST_PROXY_HEADERS=false" \
  --set-secrets='ADMIN_API_SECRET=marmoteiro-admin-api-secret:1'
```

Esses limites são ponto inicial de homologação; observar pico de memória no login scrypt e renderização antes de aumentar concorrência. Ainda não há medição de carga remota. A URL `run.app` serve à primeira avaliação HTTPS. Domínio próprio/CDN e suas cobranças devem ser escolhidos separadamente; não adicionar load balancer pago só para a prévia. Ao trocar origem, atualizar `APP_ORIGIN`, testar cookies e sessão; atualizar domínios autorizados no Firebase quando Auth estiver integrado.

Criar o administrador remoto com o CLI [documentado](../acesso-administrativo.md), conectado explicitamente ao banco remoto através de ambiente protegido. Usar prompt oculto para a senha; não usar seed padrão nem copiar senha para shell/YAML. A conta já criada no banco local não aparece automaticamente no remoto. Não substituir o banco local nem transferir dados demonstrativos para produção.

## Alternativa Firebase App Hosting

`apps/web/apphosting.yaml` é configuração candidata, não um deploy homologado. Antes de usá-la, verificar suporte ao Next 16.3.6 e ao monorepo npm contra a [documentação oficial](https://firebase.google.com/docs/app-hosting/frameworks-tooling). App Hosting requer Blaze. Criar backend associado ao repositório/branch escolhidos e raiz de aplicativo `apps/web`, preservando o contexto e lockfile da raiz do monorepo; conceder acesso aos três segredos referenciados. Confirmar primeiro build/rollout com sessão e assets. Não prometer suporte apenas porque o Dockerfile passou localmente. Não rebaixar Next.js para uma versão antiga sem avaliar segurança/compatibilidade.

## Comunicações e execução assíncrona

Manter envios desativados até conectar pedidos/pagamentos confiáveis, consentimentos persistidos, OAuth e templates homologados. O endpoint `POST /internal/jobs/communications` aguarda lote limitado antes de responder e exige `x-outbox-secret`. A resposta conta tentativas, não mensagens entregues. Nunca disponibilizar essa chave ao navegador.

A integração futura de Cloud Tasks criará tarefas nos horários de envio; um reconciliador recuperará falhas. Nenhum scheduler foi provisionado nesta etapa. Não configurar polling a cada minuto por conveniência: pode impedir a pausa do Neon e ultrapassar a franquia. Um cron de varredura não substitui os prazos funcionais/horários dos lembretes. Não rodar timers confiando em CPU fora da requisição no Cloud Run.

## Verificação do release

- Site, fontes/imagens, rotas cliente e login carregam na URL HTTPS.
- `/gestao` e páginas internas redirecionam sem sessão; sessão falsa/expirada não funciona; origem externa recebe 403; `/admin` e `/internal` sem chave recebem 401.
- Login do administrador remoto funciona; cookie é Secure/HttpOnly/SameSite Strict; respostas de autenticação não são cacheadas; logout revoga acesso.
- API usa banco remoto correto e migrações concluídas; não existem senhas/ambientes dentro das imagens ou bundles públicos.
- Pagamento e gestão continuam identificados como demonstração; não houve envio de e-mail/WhatsApp nem criação real de eventos.
- Registrar URLs, digests, revisões, instante, resultado e responsável no handoff, sem tokens ou conteúdo de consultas.

## Operação e rollback

Alertas: erro/latência HTTP, reinícios/memória, conexões e tamanho do banco, atraso/revisão de outbox quando ativada, rejeições de e-mail/WhatsApp, quotas e orçamento. Alertas financeiros não são trava automática de gasto. Evitar logs com conteúdo íntimo, credenciais ou payloads integrais.

Registrar revisão anterior antes de cada publicação. Reverter tráfego do Cloud Run para ela se ocorrer regressão de aplicação, preservando segredos compatíveis. Alterações de schema devem permitir retorno do código anterior; Prisma não gera rollback seguro automaticamente. Se houver alteração destrutiva, preparar migração corretiva/restauração específica e decisão do responsável, sem apagar dados por conveniência.

Antes de operação comercial, definir backup cifrado fora do banco, retenção/expiração e ensaio de restauração. Não confundir plano gratuito com backup. Nenhum backup remoto automatizado foi criado nesta etapa. Limpar imagens antigas com política de retenção e manter releases necessários ao rollback. Atualizar [handoff](./handoff.md) a cada ativação real.
