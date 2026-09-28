# Configuração das contas e primeira publicação

Guia do responsável pelo O Tal do Marmoteiro. Atualizado em 28/09/2026 contra o código do repositório e documentação oficial. **Este documento é um roteiro operacional: nenhuma cobrança, recurso remoto ou integração é criada apenas por existir documentação.** Os nomes dos menus podem variar com o idioma e a atualização do painel.

### Estado já confirmado pelo responsável

- domínio principal: `marmoteiro.com`, registrado no **Cloudflare Registrar**;
- DNS autoritativo: **Cloudflare DNS**; como o domínio foi registrado na Cloudflare, os nameservers permanecem na própria Cloudflare;
- Google Workspace: **não será contratado** nesta fase;
- Firebase: projeto atualmente no plano **Spark**;
- conta Google do responsável: participação no programa estudantil com **Google AI Pro** e Google Developer Program; quando o benefício Premium estiver corretamente vinculado ao Perfil de Desenvolvedor, a documentação oficial vigente informa **US$ 10/mês em créditos Google Cloud**, cotas maiores do Gemini Code Assist e até 30 workspaces do Firebase Studio;
- esses benefícios não eliminam a necessidade de Cloud Billing para Cloud Run/App Hosting e não devem ser tratados como garantia de fatura zero.

O detalhamento de DNS, domínio e e-mail fica centralizado em [domínio Cloudflare e e-mail](./dominio-cloudflare-email.md).

## 1. O que será configurado

| Ferramenta | Responsabilidade | Quando configurar |
| --- | --- | --- |
| Firebase | Identidade dos futuros usuários reais | Projeto e aplicativo agora; integração no código depois |
| Google Cloud Run | Executar site e API | Agora |
| Artifact Registry / Cloud Build | Guardar e construir as imagens da aplicação | Agora |
| Secret Manager | Guardar URLs com senha e chaves privadas | Agora |
| Neon | PostgreSQL remoto | Agora |
| Resend | E-mails automáticos do sistema | Conta/domínio podem ser preparados agora; envio depois |
| Cloudflare Registrar / DNS | Registro do domínio, DNS e DNSSEC | Já escolhido; configurar e preservar |
| Cloudflare Email Routing | Receber `falecom@marmoteiro.com` por encaminhamento | Pode ser habilitado sem Workspace |
| Resend | E-mails transacionais do sistema | Configurar subdomínio e DNS; integrar depois |
| Caixa postal/SMTP profissional | Enviar e responder manualmente como `falecom@marmoteiro.com` | Só contratar quando houver necessidade operacional; não confundir com Email Routing |
| Google Calendar/Meet e Meta | Convites e lembretes | Preparar contas; concluir junto com cada integração |

A primeira publicação terá uma URL HTTPS `run.app`. Cadastro de cliente, pagamento, agenda e financeiro continuam demonstrativos. O login administrativo é real e depende do banco remoto. Criar um usuário no Firebase não concede acesso à gestão.

Reserve um gerenciador de senhas para os segredos. Anote os identificadores públicos numa ficha separada. Use a conta Google do proprietário e autenticação em duas etapas nas contas. Use sua conta Google pessoal já existente para Firebase/Google Cloud. **Google Workspace não é requisito** para criar projeto, usar Firebase, Cloud Run, Calendar API ou os benefícios do Google Developer Program. O e-mail comercial do domínio é uma decisão separada da identidade usada nos consoles.

## 2. Firebase e Google Cloud: um único projeto

1. Entre no [Firebase Console](https://console.firebase.google.com/).
2. Se o projeto deste produto já existir, abra-o. Caso contrário, escolha **Criar projeto / Create a project**.
3. Nome de exibição sugerido: `O Tal do Marmoteiro`.
4. ID sugerido: `marmoteiro-prod`. Se estiver ocupado, aceite um sufixo único e anote o ID completo. ID não é a mesma coisa que nome de exibição ou número do projeto.
5. Google Analytics é opcional para este produto nesta etapa. Pode deixá-lo desativado; as métricas financeiras virão do banco de negócio.
6. Termine a criação. Em **Configurações do projeto > Geral**, registre `Project ID` e `Project number`.
7. Abra o [Google Cloud Console](https://console.cloud.google.com/) com a mesma conta. No seletor superior, escolha o **mesmo ID**. Não crie outro projeto para o Cloud Run.

Firebase acrescenta serviços ao projeto Google Cloud associado. Registrar aplicativo web não publica o site. [Configuração oficial](https://firebase.google.com/docs/web/setup).

**Verificação:** o ID exibido nos dois consoles é idêntico.

## 3. Spark hoje; Blaze somente quando o deploy exigir

O projeto Firebase está atualmente no **Spark**, e isso é suficiente para preparar o aplicativo web, usar Firebase Authentication dentro das cotas do plano e desenvolver localmente. Porém, o desenho de produção deste repositório usa serviços Google Cloud pagos por consumo — especialmente Cloud Run, Cloud Build, Artifact Registry e Secret Manager — que **não ficam disponíveis no Spark**. O Firebase App Hosting também exige Cloud Billing.

A regra operacional é:

1. **Enquanto estiver apenas desenvolvendo e configurando Authentication:** pode permanecer no Spark.
2. **Antes do primeiro deploy em Cloud Run ou App Hosting:** vincule uma conta do Cloud Billing ao mesmo projeto.
3. Ao vincular o faturamento, o Firebase converte automaticamente esse projeto de Spark para **Blaze (pay as you go)**.
4. Blaze não é uma assinatura mensal fixa do Firebase; a cobrança depende do consumo dos produtos pagos, preservando as cotas sem custo aplicáveis.
5. Não crie um segundo projeto Google Cloud só para evitar a mudança de plano: Firebase e Google Cloud compartilham o mesmo Project ID, IAM e faturamento.

### Benefícios Google AI Pro / Google Developer Program

A conta do responsável participa do Google AI Pro para estudantes e do Google Developer Program. Na documentação oficial vigente em 28/09/2026, o Google AI Pro inclui o Google Developer Program Premium quando a assinatura está vinculada ao Perfil de Desenvolvedor, com:

- **US$ 10/mês em créditos Google Cloud**;
- cotas maiores do Gemini Code Assist;
- até **30 workspaces do Firebase Studio**;
- demais benefícios do programa.

Esses créditos podem ajudar a absorver o consumo pequeno do projeto, mas:

- confirme no Perfil de Desenvolvedor/área de benefícios que o Premium está realmente ativo;
- confirme que o crédito mensal foi resgatado/aplicado antes de contar com ele;
- não misture `créditos de IA` do Google One/Flow/Antigravity com `créditos Google Cloud`; são saldos e finalidades diferentes;
- o crédito não substitui a necessidade de uma conta de faturamento válida;
- consumo acima do crédito e das franquias continua faturável.

### Configurar faturamento com segurança

1. No Google Cloud, abra **Faturamento / Billing**.
2. Vincule uma conta de faturamento ao **mesmo Project ID** do Firebase.
3. Volte ao Firebase e confirme que o projeto aparece como **Blaze**.
4. Em **Budgets & alerts**, crie `Marmoteiro - acompanhamento mensal`.
5. Escopo: somente o projeto Marmoteiro; todos os serviços.
6. Use inicialmente um orçamento baixo de observação, por exemplo R$ 30 ou US$ 5, conforme a moeda da conta. É alerta, não promessa de custo.
7. Alertas: 50%, 80% e 100%; habilite previsão, se disponível.
8. Ative limites de instâncias e limpeza de artefatos descritos neste guia.
9. Depois do primeiro deploy, confira **Billing > Reports** e também a aplicação do crédito do Google Developer Program.

**Importante:** alertas de orçamento comuns não desligam automaticamente todos os serviços. Alguns produtos Firebase oferecem spend caps próprios, mas isso não deve ser tratado como trava global de Cloud Run/Google Cloud.

**Verificação:** mesmo Project ID nos dois consoles; Blaze somente depois do vínculo de billing; orçamento ativo; benefício Premium/US$ 10 registrado separadamente como crédito promocional/benefício e não como limite de gasto.

## 4. Preparar o Firebase Authentication

1. No Firebase, abra **Configurações do projeto > Geral > Seus aplicativos**.
2. Clique no ícone web `</>` e registre `marmoteiro-web`.
3. Se houver uma opção de configurar Firebase Hosting, deixe para a etapa de domínio. O site inicial será publicado diretamente no Cloud Run.
4. Guarde o objeto `firebaseConfig` apresentado, principalmente `apiKey`, `authDomain`, `projectId`, `appId` e `messagingSenderId`. `measurementId` pode não existir com Analytics desativado.
5. Essa configuração do SDK web é pública por natureza. Ela é diferente de senha do banco, chave Resend e chave privada de conta de serviço. Não gere JSON de chave privada do Firebase para esta etapa.
6. Abra **Authentication**, usando a busca do console se necessário. Clique em **Começar / Get started**.
7. Em **Método de login / Sign-in method**, habilite **E-mail/senha** e salve. Deixe o login por link de e-mail e telefone/SMS para quando houver um fluxo correspondente.
8. Em **Configurações > Domínios autorizados**, preserve os domínios padrão. Depois do deploy, adicione o hostname exato da web `run.app`, sem `https://`, porta ou caminho. Adicione `marmoteiro.com` e `www.marmoteiro.com` quando o domínio estiver conectado.
9. Em **Modelos / Templates**, confira o nome do produto e os modelos de recuperação/verificação. O envio de autenticação é separado dos avisos comerciais do Resend. A personalização final será homologada com o fluxo real.

A criação desta configuração não conecta automaticamente as telas atuais ao Firebase. O SDK, a sessão e a associação UID/PostgreSQL ainda serão implementados. [Aplicativo web](https://firebase.google.com/docs/web/setup), [e-mail e senha](https://firebase.google.com/docs/auth/web/password-auth).

Novos projetos não incluem `localhost` automaticamente nos domínios autorizados. Para testes locais com Auth real, preferir projeto de desenvolvimento separado ou emulador; caso se use o mesmo projeto temporariamente, a autorização de `localhost` será explícita. [Regra de domínios locais](https://firebase.google.com/docs/auth/web/email-link-auth).

**Verificação:** aplicativo web registrado e e-mail/senha habilitado; ninguém ganha papel administrativo por isso.

## 5. Criar o PostgreSQL no Neon

1. Entre no [console Neon](https://console.neon.tech/) e crie sua conta, confirmando o e-mail.
2. Confirme em Billing que o plano é **Free**. O projeto inicial utiliza PostgreSQL; Firebase já atenderá identidade.
3. Escolha **New Project**, nome `marmoteiro-prod`.
4. Região sugerida para este público: **AWS South America (São Paulo)**, código `aws-sa-east-1`, se disponível no plano selecionado. O Cloud Run correspondente será `southamerica-east1`.
5. As duas regiões têm nomes diferentes porque são provedores diferentes. Isso não significa rede privada entre eles; haverá conexão por TLS e eventual transferência faturada.
6. Expanda **Postgres database** e selecione PostgreSQL **16**, versão já usada nos testes deste projeto. Se não estiver disponível, anote a versão oferecida para homologação antes de aplicar migrações.
7. Mantenha apenas o serviço PostgreSQL necessário nesta etapa e crie o projeto.
8. Anote projeto, região, branch e banco. No console a branch inicial costuma se chamar `production`; o banco padrão pode ser `neondb`. Pode manter esses nomes. A branch do banco é independente da branch Git `dev`.

**A região do projeto Neon é fixa após a criação.** Para mudar depois, é necessário criar outro projeto e migrar. São Paulo consta da documentação atual; se a sua conta não oferecer essa região no Free, registre essa diferença antes de escolher outra localização. [Regiões](https://neon.com/docs/introduction/regions), [criação do projeto](https://neon.com/docs/manage/projects).

Agora obtenha as duas conexões:

1. Clique em **Connect**.
2. Selecione a mesma branch, compute, database e role para ambas.
3. Com **Connection pooling** habilitado, copie somente a URL `postgresql://...`. Guarde como **conexão pooled**. Normalmente o hostname contém `-pooler`.
4. Desative **Connection pooling** e copie a URL direta. Guarde como **conexão direta**.
5. Preserve os parâmetros TLS fornecidos pelo Neon. Não copie o comando `psql`, aspas ou quebra de linha para dentro do segredo.
6. Guarde ambas em seu gerenciador de senhas. Elas contêm senha e não devem ser enviadas no chat.

O pool será usado pela API; a conexão direta, pelas migrações. São caminhos de conexão, não papéis de segurança diferentes. A prévia pode usar a role inicial; antes da operação comercial, restringiremos a role de execução e separaremos as permissões de migração. [Conexões Neon](https://neon.com/docs/connect/connect-from-any-app).

Confira que a pausa automática por inatividade está mantida e acompanhe armazenamento/compute no painel. Não configure um monitor que consulte o banco a cada minuto. O Free atual anuncia 100 CU-h e 0,5 GB por projeto; backup/restauração precisam de um plano próprio antes de dados comerciais. [Franquias atuais](https://neon.com/blog/neon-backend-is-ga).

**Verificação:** duas URLs da mesma branch/banco, uma pooled e uma direta, guardadas privadamente; plano Free confirmado.

## 6. Habilitar os serviços Google Cloud

No projeto correto, use **APIs e serviços > Biblioteca**. Habilite:

| Serviço | Identificador |
| --- | --- |
| Cloud Run Admin API | `run.googleapis.com` |
| Cloud Build API | `cloudbuild.googleapis.com` |
| Artifact Registry API | `artifactregistry.googleapis.com` |
| Secret Manager API | `secretmanager.googleapis.com` |
| Cloud Logging API | `logging.googleapis.com` |
| Identity and Access Management API | `iam.googleapis.com` |
| Cloud Storage API | `storage.googleapis.com` |

Google Calendar API pode ser habilitada na etapa 15. Nenhuma dessas habilitações, sozinha, integra o checkout ou envia mensagens.

**Verificação:** serviços aparecem em **APIs e serviços > APIs ativadas**.

## 7. Criar as identidades dos serviços

Em **IAM e administrador > Contas de serviço > Criar conta de serviço**, crie:

| ID | Finalidade |
| --- | --- |
| `marmoteiro-web` | Executar Next.js |
| `marmoteiro-api` | Executar NestJS |
| `marmoteiro-migrate` | Aplicar migrações |
| `marmoteiro-build` | Construir e publicar imagens |

O e-mail gerado segue `NOME@ID_DO_PROJETO.iam.gserviceaccount.com`. As contas de execução serão associadas aos containers, sem arquivo JSON de chave. Na criação, pode concluir sem conceder papel no projeto inteiro; as permissões específicas vêm nas próximas etapas. Não dar Owner/Editor a essas contas.

Para `marmoteiro-build`, em **IAM > Conceder acesso**, atribua o papel **Logs Writer**, identificador `roles/logging.logWriter`, no projeto. Ele precisa escrever o log do build. Permissões de imagens e fonte serão dadas nos respectivos recursos. O proprietário que executa os comandos precisa poder usar essas contas (`iam.serviceAccounts.actAs`); numa conta corporativa, o administrador pode conceder **Service Account User** nas contas específicas.

Uma conta de build explícita evita depender de qual identidade padrão o Google selecionou para aquele projeto. [Contas de build](https://docs.cloud.google.com/build/docs/securing-builds/configure-user-specified-service-accounts).

**Verificação:** quatro contas listadas, sem chaves JSON criadas; build com Logs Writer.

## 8. Guardar os três segredos necessários ao deploy

Em **Security > Secret Manager > Create secret**, crie os nomes abaixo exatamente:

| Nome do segredo | Conteúdo | Contas que recebem Secret Accessor |
| --- | --- | --- |
| `marmoteiro-database-url` | URL pooled do Neon | `marmoteiro-api` |
| `marmoteiro-database-direct-url` | URL direta do Neon | `marmoteiro-migrate`; seu usuário Google para executar o CLI administrativo |
| `marmoteiro-admin-api-secret` | Texto aleatório de 64 caracteres hexadecimais | `marmoteiro-api` e `marmoteiro-web` |

Para gerar o terceiro valor sem colocá-lo no histórico ou na saída do Terminal do Mac, execute:

```sh
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))" | pbcopy
```

Cole o conteúdo da área de transferência no campo de valor do Secret Manager e guarde-o no gerenciador de senhas. Esse segredo autentica web/API entre si; **não é a sua senha de login**. Use exatamente o mesmo recurso nas duas aplicações.

Para cada segredo:

1. Preencha nome e valor, sem aspas adicionais.
2. Use replicação gerenciada na região escolhida, se quiser restringir a localização desse recurso; ou mantenha automática conscientemente. Isso não muda a região do banco.
3. Crie e anote o número da versão, inicialmente `1`.
4. Abra **Permissões > Conceder acesso** no próprio segredo.
5. Adicione os e-mails da tabela com **Secret Manager Secret Accessor** (`roles/secretmanager.secretAccessor`).
6. Não conceda esse papel às contas web/API no projeto inteiro.

URLs sem senha, como endereço da API e origem do site, serão variáveis comuns do Cloud Run. `OUTBOX_TRIGGER_SECRET`, chaves Resend e tokens Google/Meta entram somente quando os respectivos fluxos forem habilitados. [Secret Manager](https://docs.cloud.google.com/secret-manager/docs/creating-and-accessing-secrets), [segredos no Cloud Run](https://docs.cloud.google.com/run/docs/configuring/services/secrets).

**Verificação:** três recursos criados, versões anotadas e acesso limitado conforme a tabela. Nenhum segredo no Git.

## 9. Criar o repositório de imagens e o armazenamento de builds

No Google Cloud, abra **Artifact Registry > Repositories > Create repository**:

| Campo | Valor |
| --- | --- |
| Nome | `marmoteiro` |
| Formato | Docker |
| Modo | Standard |
| Tipo de localização | Region |
| Região | `southamerica-east1`, se foi a escolha da etapa 5 |
| Criptografia | Chave gerenciada pelo Google |

No repositório criado, abra **Permissões** e conceda à conta `marmoteiro-build` o papel **Artifact Registry Writer** (`roles/artifactregistry.writer`).

Em **Cloud Storage > Buckets > Create**, crie `ID_DO_PROJETO-build-source`, substituindo pelo ID real. Se o nome não estiver disponível globalmente, escolha outro e anote:

- Localização regional igual à dos builds; classe Standard.
- Controle uniforme de acesso; prevenção de acesso público ativada.
- Esse bucket guarda pacotes de código do build, não consultas nem backups do banco.
- Para esses arquivos temporários, pode desativar versionamento e recuperação de exclusão, mantendo uma regra de ciclo de vida que exclui objetos após 7 dias. Não aplicar essa política a dados de clientes ou backups.
- No bucket, conceda `marmoteiro-build` o papel **Storage Object Viewer** (`roles/storage.objectViewer`). O proprietário que envia o código precisa poder gravá-lo.

No Artifact Registry, configure inicialmente uma política de limpeza em **dry run** para observar o que seria removido. Preserve as imagens dos releases ativo e anterior; só ative exclusão real depois de revisar a seleção. Builds, armazenamento, logs e transferência também contam no custo. [Políticas de limpeza](https://docs.cloud.google.com/artifact-registry/docs/repositories/cleanup-policy).

**Verificação:** repositório Docker e bucket privados, com a conta de build autorizada nos dois recursos.

## 10. Configurar e-mail sem Google Workspace

A estratégia desta fase separa claramente **recebimento**, **envio transacional** e **caixa postal de uso humano**.

### 10.1 Receber `falecom@marmoteiro.com` com Cloudflare Email Routing

Cloudflare Email Routing encaminha mensagens para uma caixa já existente e não exige Google Workspace.

1. No Cloudflare Dashboard, abra a zona `marmoteiro.com`.
2. Entre em **Email > Email Routing** e habilite o recurso.
3. Cadastre o endereço pessoal existente que receberá as mensagens como **Destination address**.
4. Abra a mensagem de verificação enviada pela Cloudflare e confirme o destino.
5. Crie a rota:
   - Custom address: `falecom@marmoteiro.com`
   - Destination: o endereço pessoal verificado.
6. Deixe a Cloudflare criar/ajustar os registros MX necessários ao Email Routing.
7. Em **DNS > Records**, confirme que registros de e-mail estão como DNS-only; MX e TXT não passam pelo proxy HTTP de qualquer forma.
8. Envie uma mensagem de teste externa para `falecom@marmoteiro.com` e confirme a entrega.

**Limite importante:** Email Routing é encaminhamento de entrada, não uma caixa IMAP/SMTP completa. Ele resolve o recebimento do endereço oficial, não cria sozinho uma experiência para responder manualmente usando esse mesmo remetente.

### 10.2 Envio automático do sistema com Resend

Para mensagens transacionais, use o subdomínio `notificacoes.marmoteiro.com`, separado da raiz usada pelo atendimento humano.

1. Crie/abra a conta Resend e confirme o plano aplicável.
2. Em **Domains > Add domain**, adicione `notificacoes.marmoteiro.com`.
3. No Resend, copie exatamente os registros apresentados para verificação/autenticação.
4. Na Cloudflare, abra **DNS > Records > Add record**.
5. Crie cada TXT/CNAME/MX exatamente com nome, valor e prioridade mostrados pelo Resend.
6. Para CNAMEs de verificação/e-mail, use **DNS only**; não habilite proxy laranja.
7. Não altere os MX da raiz `marmoteiro.com` usados pelo Cloudflare Email Routing.
8. Não crie um segundo SPF no mesmo hostname. O isolamento em `notificacoes.marmoteiro.com` reduz esse conflito.
9. Aguarde o Resend marcar o domínio como **Verified**.
10. Crie a chave `marmoteiro-producao-envio` com a menor permissão disponível para envio nesse domínio.
11. Guarde-a no Secret Manager como `marmoteiro-resend-api-key`.
12. Remetente proposto: `O Tal do Marmoteiro <avisos@notificacoes.marmoteiro.com>`.
13. `Reply-To`: `falecom@marmoteiro.com`.

No plano Free consultado em 28/09/2026, o Resend anuncia 3.000 e-mails/mês e 100/dia. Confirmar novamente antes da ativação comercial.

### 10.3 Responder manualmente como `falecom@marmoteiro.com`

Não documentar Gmail pessoal + “Enviar como” como solução permanente: o Google anunciou a retirada do recurso de envio por endereços de terceiros a partir de janeiro de 2027.

Quando for necessário **enviar e responder manualmente** usando `falecom@marmoteiro.com`, adote uma destas opções de forma explícita:

- contratar uma caixa postal real com IMAP/SMTP em um provedor de e-mail de baixo custo; ou
- usar um serviço SMTP compatível e um cliente de e-mail dedicado.

Não contratar Google Workspace apenas para satisfazer essa necessidade se outro provedor atender ao requisito por menor custo. A escolha do provedor da caixa postal pode ser feita quando o atendimento por e-mail deixar de ser apenas entrada/encaminhamento.

### 10.4 DMARC e autenticação

Depois que todos os remetentes reais estiverem definidos:

1. criar `_dmarc.marmoteiro.com` inicialmente com política de observação (`p=none`);
2. validar SPF/DKIM do Resend e de qualquer futuro provedor SMTP;
3. só migrar para `quarantine`/`reject` após confirmar alinhamento e ausência de remetentes legítimos quebrados.

O passo a passo completo de DNS e domínio está em [domínio Cloudflare e e-mail](./dominio-cloudflare-email.md).

**Verificação:** `falecom@` recebe via Cloudflare; `notificacoes@` está verificado no Resend; nenhum Workspace contratado; nenhuma chave de envio foi colocada no Git.

## 11. Autenticar o Terminal do Mac

Esta é a etapa que permite ao Codex operar o seu projeto sem receber sua senha.

1. Siga o [instalador oficial do Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk), seção macOS.
2. Confirme se o Mac usa Apple Silicon ou Intel em **Sobre este Mac**; baixe o pacote correspondente.
3. Extraia o pacote, execute o instalador indicado pelo Google e aceite adicionar o `gcloud` ao PATH. Abra um novo Terminal após instalar.
4. Execute `gcloud version`. Se aparecer a versão, a instalação está acessível.
5. Autentique pelo navegador e configure o projeto:

```sh
gcloud auth login
gcloud config configurations create marmoteiro
gcloud config set project ID_REAL_DO_PROJETO
gcloud auth list
gcloud config get-value project
```

Se a configuração `marmoteiro` já existir, use `gcloud config configurations activate marmoteiro` em vez de criá-la. Escolha a mesma conta proprietária dos consoles. Os comandos de autenticação não criam um deploy nem substituem a autorização do aplicativo.

**Neste ponto você pode voltar ao chat e pedir o deploy.** As contas, o banco e os segredos estarão preparados; os próximos blocos documentam a execução técnica completa. Não é necessário você executá-los manualmente se preferir que o Codex continue.

## 12. Construir as imagens remotas

Execute os blocos em ordem, interrompendo se houver erro. O código atualizado está na pasta local e inclui trabalho ainda não publicado no GitHub; clonar a branch remota antiga não substitui essa pasta. Não executar commit/push automático de tudo para seguir o roteiro.

```sh
cd '/Users/wellbenicio/Documents/[Site] - O Tal do Marmoteiro'
export MARMOTEIRO_PROJECT='ID_REAL_DO_PROJETO'
export MARMOTEIRO_REGION='southamerica-east1'
export MARMOTEIRO_REPOSITORY='marmoteiro'
export MARMOTEIRO_RELEASE="preview-$(date -u +%Y%m%d-%H%M%S)"
export MARMOTEIRO_SOURCE_BUCKET="${MARMOTEIRO_PROJECT}-build-source"
export MARMOTEIRO_IMAGES="${MARMOTEIRO_REGION}-docker.pkg.dev/${MARMOTEIRO_PROJECT}/${MARMOTEIRO_REPOSITORY}"
gcloud projects describe "$MARMOTEIRO_PROJECT" --format='value(projectId)'
git status --short
gcloud meta list-files-for-upload
```

Ajuste região/bucket se escolheu outros. Confirme que nenhum `.env`, chave privada ou dependência local está no upload. A lista contém nomes de arquivos, não seus conteúdos. Revise o release local e os resultados de CI/testes antes de construir.

```sh
gcloud builds submit . --project="$MARMOTEIRO_PROJECT" \
  --region="$MARMOTEIRO_REGION" \
  --service-account="projects/$MARMOTEIRO_PROJECT/serviceAccounts/marmoteiro-build@$MARMOTEIRO_PROJECT.iam.gserviceaccount.com" \
  --gcs-source-staging-dir="gs://$MARMOTEIRO_SOURCE_BUCKET/source" \
  --config=infra/cloudbuild-api.yaml \
  --substitutions="_REGION=$MARMOTEIRO_REGION,_REPOSITORY=$MARMOTEIRO_REPOSITORY,_RELEASE=$MARMOTEIRO_RELEASE"
```

O YAML do repositório constrói `api`, `web` e `migrate`, com logs no Cloud Logging. Confira **Cloud Build > History > SUCCESS** e três imagens/tag no Artifact Registry. A API de build não precisa acessar as senhas do banco durante essa etapa. [Comando de build](https://docs.cloud.google.com/sdk/gcloud/reference/builds/submit).

## 13. Aplicar migrações e publicar

Os comandos abaixo usam a versão `1` dos segredos. Se você criou outras versões, ajuste explicitamente. O nome dos recursos é o da etapa 8.

Primeiro, o banco:

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

Se o banco já possuir dados reais, prepare backup/restauração antes dessa execução. O resultado esperado é migrações aplicadas ou ausência de migrações pendentes. Não seguir em caso de falha.

Depois, a API:

```sh
gcloud run deploy marmoteiro-api --project="$MARMOTEIRO_PROJECT" \
  --region="$MARMOTEIRO_REGION" --image="$MARMOTEIRO_IMAGES/api:$MARMOTEIRO_RELEASE" \
  --service-account="marmoteiro-api@$MARMOTEIRO_PROJECT.iam.gserviceaccount.com" \
  --allow-unauthenticated --port=8080 --cpu=1 --memory=512Mi \
  --min-instances=0 --max-instances=2 --concurrency=4 --timeout=300 --cpu-throttling \
  --set-env-vars='NODE_ENV=production,HOST=0.0.0.0,DATABASE_POOL_MAX=3,COMMUNICATIONS_ENABLED=false,OUTBOX_RUNNER=scheduled' \
  --set-secrets='DATABASE_URL=marmoteiro-database-url:1,ADMIN_API_SECRET=marmoteiro-admin-api-secret:1'
export MARMOTEIRO_API_URL="$(gcloud run services describe marmoteiro-api --project="$MARMOTEIRO_PROJECT" --region="$MARMOTEIRO_REGION" --format='value(status.url)')"
```

O acesso HTTP público é necessário no desenho atual; os endpoints administrativos continuam protegidos pelos guards da aplicação, segredo interno e sessão. Essa opção não cria login público de administrador. Uma política corporativa que proíba `allUsers` exige adaptar autenticação IAM entre serviços; não remover guards para contorná-la.

Agora, a web:

```sh
gcloud run deploy marmoteiro-web --project="$MARMOTEIRO_PROJECT" \
  --region="$MARMOTEIRO_REGION" --image="$MARMOTEIRO_IMAGES/web:$MARMOTEIRO_RELEASE" \
  --service-account="marmoteiro-web@$MARMOTEIRO_PROJECT.iam.gserviceaccount.com" \
  --allow-unauthenticated --port=8080 --cpu=1 --memory=512Mi \
  --min-instances=0 --max-instances=2 --concurrency=40 --timeout=60 --cpu-throttling \
  --set-env-vars="NODE_ENV=production,HOSTNAME=0.0.0.0,ADMIN_API_URL=$MARMOTEIRO_API_URL,APP_ORIGIN=https://invalid.example,TRUST_PROXY_HEADERS=false" \
  --set-secrets='ADMIN_API_SECRET=marmoteiro-admin-api-secret:1'
export MARMOTEIRO_WEB_ORIGIN="$(gcloud run services describe marmoteiro-web --project="$MARMOTEIRO_PROJECT" --region="$MARMOTEIRO_REGION" --format='value(status.url)')"
gcloud run services update marmoteiro-web --project="$MARMOTEIRO_PROJECT" \
  --region="$MARMOTEIRO_REGION" --update-env-vars="APP_ORIGIN=$MARMOTEIRO_WEB_ORIGIN"
```

`https://invalid.example` é um valor temporário que mantém o login bloqueado até conhecermos a URL real. A atualização seguinte é obrigatória antes de testar o painel. Confira no Cloud Run: duas instâncias máximas por serviço, mínimo zero, cobrança por requisição, segredos associados e URL da web funcionando. A API não fica consultando continuamente o banco para manter-se acordada.

## 14. Criar o administrador remoto e validar

A conta local não é copiada para o Neon. No Terminal interativo, na raiz do projeto, com `MARMOTEIRO_PROJECT` definido e seu usuário autorizado a ler o segredo direto, execute:

```sh
node -e '
const {execFileSync, spawnSync} = require("node:child_process");
const project = process.env.MARMOTEIRO_PROJECT;
if (!project) throw new Error("Defina MARMOTEIRO_PROJECT antes de continuar");
const database = execFileSync("gcloud", [
  "secrets", "versions", "access", "1",
  "--secret=marmoteiro-database-direct-url", "--project=" + project
], {encoding:"utf8"}).trim();
if (!database.startsWith("postgresql://") && !database.startsWith("postgres://"))
  throw new Error("O segredo nao contem uma URL PostgreSQL");
const result = spawnSync("npm", [
  "run", "admin:create", "--", "--email", "wellynton.benicio@marmoteiro.com",
  "--name", "Wellynton Benicio"
], {stdio:"inherit", env:{...process.env, DATABASE_URL:database}});
process.exitCode = result.status ?? 1;
'
```

O código lê o segredo sem imprimi-lo e só o passa ao processo administrativo. A senha do painel será solicitada de forma oculta, duas vezes, entre 15 e 128 caracteres. Guarde-a no gerenciador de senhas. O script não altera o arquivo de ambiente local. Se a conta remota já existir, use o procedimento de redefinição documentado; não exclua a conta para resolver o aviso.

Valide:

1. Abra a URL da web e verifique imagens/fontes.
2. Em janela anônima, acesse `/gestao`: deve abrir o login.
3. Entre com o acesso remoto recém-criado, abra uma página interna e saia.
4. Acesse novamente uma página interna: deve exigir login.
5. Confirme nos logs que não houve envio de mensagem ou criação de evento Google.
6. Acrescente o hostname da web aos domínios autorizados do Firebase para a próxima integração.
7. Registre release, URLs, revisões e resultados no [handoff](./handoff.md), sem senhas.

Testes de origem, cookies, acesso cruzado e indisponibilidade também serão repetidos pelo desenvolvedor antes da liberação comercial.

## 15. Preparação de Google Calendar/Meet e WhatsApp

### Google Calendar/Meet

1. Escolha a conta Google que será dona da agenda profissional. Ela pode diferir da conta de faturamento.
2. No [Google Calendar](https://calendar.google.com/), crie uma agenda `Consultas - O Tal do Marmoteiro`, com fuso `America/Sao_Paulo`, sem publicação pública.
3. Em **Configurações da agenda > Integrar agenda**, anote o ID. Não compartilhe links secretos iCal nem conteúdo da agenda pessoal.
4. No projeto Google Cloud, habilite **Google Calendar API** (`calendar-json.googleapis.com`).
5. Na área **Google Auth Platform**, prepare Branding/nome do aplicativo, e-mail de suporte e contato do desenvolvedor. Para teste, audiência External e seu usuário como testador, salvo se houver um Workspace e uso interno apropriado.
6. Na implementação OAuth, criaremos o cliente do tipo Web application com a URL de callback realmente implementada. Ainda não existe callback homologado no projeto; não use uma URL fictícia nem trate uma credencial criada como conexão concluída.
7. Escopos serão limitados a eventos e à disponibilidade necessária. Login Google via Firebase e autorização para editar a agenda são consentimentos separados.
8. Guardaremos `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` e `GOOGLE_CALENDAR_ID` com acesso de servidor. O refresh token virá da autorização da conta organizadora, com acesso offline.

Aplicativos OAuth externos em Testing podem ter refresh token de Calendar expirando em sete dias. A passagem para produção e eventual verificação precisam ser concluídas antes de depender da agenda diariamente. Convites com Meet serão homologados na conta escolhida; não pressupõem gravação/licenças avançadas. [Consentimento OAuth](https://developers.google.com/workspace/guides/configure-oauth-consent), [expiração](https://developers.google.com/identity/protocols/oauth2), [eventos e conferências](https://developers.google.com/workspace/calendar/api/guides/create-events).

### WhatsApp oficial

1. Prepare o portfólio empresarial na Meta Business Suite, usando os dados reais do negócio.
2. Acesse [Meta for Developers](https://developers.facebook.com/), crie/abra o aplicativo do negócio e selecione o caso de uso/produto WhatsApp oferecido no painel.
3. Vincule o portfólio. Comece com os ativos de teste disponibilizados pela Meta.
4. Anote WABA ID e Phone Number ID; são identificadores diferentes do número de telefone.
5. Para produção, complete os requisitos exibidos de cadastro, número, faturamento e verificação. Se pretende reutilizar seu número atual, avalie primeiro a elegibilidade de coexistência/migração; não exclua o WhatsApp do celular seguindo um tutorial genérico.
6. Prepare um template de utilidade para lembrar uma consulta, sem pergunta, resposta ou assunto íntimo. A classificação/aprovação final pertence à Meta.
7. Na integração, usaremos token com os ativos/permissões necessários (`whatsapp_business_messaging` e, para gestão, `whatsapp_business_management`), guardado no Secret Manager. Token temporário de teste não é credencial de produção.
8. Webhook, validação, recibos, versão Graph suportada e agendamento serão conectados no código. Não habilitar `COMMUNICATIONS_ENABLED` antes desse fluxo completo e do consentimento persistido.

A fonte técnica é a [coleção oficial da Meta](https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api). Os nomes de telas podem mudar; mensagens fora do atendimento manual dependem das condições e tarifas da plataforma.

O gateway de pagamento ainda não foi escolhido definitivamente. A criação da conta e das credenciais de sandbox será detalhada quando decidirmos o provedor, métodos e condições comerciais.

## 16. Domínio próprio no Cloudflare

O domínio `marmoteiro.com` já está registrado no **Cloudflare Registrar** e a zona DNS também fica na Cloudflare. Portanto não existe etapa futura de “escolher registrador/DNS”; o trabalho agora é conectar esse DNS ao frontend escolhido.

### Estado recomendado

1. Primeiro publique e valide web/API nas URLs `run.app`.
2. O Cloud Run continuará em `southamerica-east1`, junto da estratégia regional do banco.
3. **Não usar o mapeamento nativo de domínio do Cloud Run** como solução principal: ele continua em Preview, não é recomendado para produção e `southamerica-east1` não está na lista de regiões do recurso.
4. Para custo baixo, o candidato natural é **Firebase Hosting na frente do Cloud Run**, porque aceita domínio customizado e rewrites para Cloud Run em `southamerica-east1`.
5. Porém, **não ligar o domínio ao Hosting antes de corrigir a sessão administrativa**: Firebase Hosting remove cookies de requests dinâmicos, exceto o cookie especial `__session`; o código atual usa `__Host-marmoteiro-admin`.
6. Enquanto essa compatibilidade não for implementada/testada, mantenha o domínio sem apontar o tráfego autenticado ao Firebase Hosting.
7. A alternativa sem essa limitação é um **Global External Application Load Balancer** na frente do Cloud Run, recomendada pela própria documentação do Cloud Run, mas com mais configuração e potencial custo.

### Quando a opção Firebase Hosting estiver homologada

1. Alterar a sessão para um desenho compatível com `__session` e manter `Secure`, `HttpOnly`, `SameSite` e validação server-side.
2. Criar `firebase.json` com rewrite `**` para o serviço `marmoteiro-web` em `southamerica-east1`.
3. Fazer deploy da configuração do Hosting.
4. Em **Firebase Hosting > Add custom domain**, adicionar `marmoteiro.com`.
5. Usar o próprio wizard do Firebase como fonte dos registros TXT/A/CNAME.
6. Criar os registros no Cloudflare DNS inicialmente como **DNS only**. O Firebase já fornece CDN e certificado; uma segunda camada de proxy Cloudflare não é necessária para essa primeira topologia.
7. Adicionar `www.marmoteiro.com` como redirecionamento para o domínio canônico.
8. Aguardar status de certificado/domínio ficar ativo antes de mudar `APP_ORIGIN`.
9. Atualizar:
   - `APP_ORIGIN=https://marmoteiro.com`;
   - Firebase Auth > Authorized domains;
   - OAuth callbacks;
   - webhooks que dependam da origem;
   - testes de cookie, CSRF/origin e logout.
10. Manter a URL `run.app` registrada para troubleshooting/rollback, mas não divulgá-la como URL comercial.

O procedimento detalhado, inclusive DNSSEC, e-mail e checklists, está em [domínio Cloudflare e e-mail](./dominio-cloudflare-email.md).

## 17. Informações para retornar ao Codex

Pode colar esta ficha, sem credenciais:

```text
Domínio principal: marmoteiro.com
Registrador: Cloudflare Registrar
DNS: Cloudflare DNS
DNSSEC ativo: sim/não
Cloudflare Email Routing ativo: sim/não
falecom@marmoteiro.com encaminha para caixa verificada: sim/não
Firebase / Google Cloud Project ID:
Plano Firebase atual: Spark/Blaze
Google AI Pro vinculado ao Perfil de Desenvolvedor: sim/não
Google Developer Program Premium ativo: sim/não
Crédito Google Cloud mensal visível/resgatado: sim/não
Faturamento Google Cloud vinculado: sim/não
Orçamento de alerta criado: sim/não
Região Cloud Run escolhida:
Firebase app web registrado: sim/não
Firebase e-mail/senha habilitado: sim/não
Neon Project ID ou nome:
Neon região / PostgreSQL / branch / database:
Plano Neon Free confirmado: sim/não
Três segredos criados (somente nomes e versões):
Quatro contas de serviço criadas: sim/não
Repositório Artifact Registry:
Bucket de fonte do build:
gcloud autenticado neste Mac: sim/não
Domínio Resend: notificacoes.marmoteiro.com
Status Resend: Pending/Verified
Estratégia de domínio web: run.app / Firebase Hosting / Load Balancer
Provedor de caixa postal SMTP para envio humano (se houver):
```

Não enviar URLs completas de banco, senha de login, API key Resend, client secret Google, refresh token, token WhatsApp, chave JSON privada, Cloudflare API token ou códigos de autenticação. A configuração pública do SDK Firebase pode ser compartilhada; os segredos serão acessados pelos recursos autorizados no ambiente.

## 18. Problemas comuns

| Sintoma | Verificar |
| --- | --- |
| `gcloud: command not found` | Instalação/PATH; abrir novo Terminal |
| Projeto não encontrado | ID exato, conta ativa, permissões; não usar apenas nome de exibição |
| Build não lê fonte | Bucket selecionado, Storage Object Viewer para a conta de build |
| Build não grava imagem/log | Artifact Registry Writer no repositório e Logs Writer no projeto |
| `iam.serviceAccounts.actAs` negado | Permissão do usuário que executa o deploy na conta escolhida |
| Secret access denied | Papel Secret Accessor no segredo e conta de serviço efetivamente associada à revisão/job |
| Container não inicia | Logs, porta 8080, HOST/HOSTNAME, arquitetura Linux/amd64, conexão TLS do banco |
| Login retorna origem não autorizada | `APP_ORIGIN` igual à URL HTTPS usada, sem caminho; aplicar a segunda revisão web |
| Login indica indisponibilidade | API URL, segredo compartilhado, migrações, banco e logs |
| Senha local não entra no remoto | Conta remota ainda não provisionada ou senha diferente |
| Resend Pending | Autoridade DNS correta, nome sem duplicação, valores e propagação |
| Agenda para após alguns dias | Estado Testing/expiração OAuth, consentimento ou token revogado |

Não solucionar erro abrindo o banco, concedendo Owner a todos, removendo guards ou gravando senha em código. Registre o erro sem conteúdo secreto e corrija a permissão/configuração específica.
