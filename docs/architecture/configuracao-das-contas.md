# Configuração das contas e primeira publicação

Guia do responsável pelo O Tal do Marmoteiro. Atualizado em **28/09/2026**, considerando as informações do proprietário e as fontes oficiais indicadas nas seções revisadas. **Este documento é um roteiro: sua atualização não configura contas, DNS, faturamento ou integrações.** Os nomes dos menus podem variar.

## Ponto de partida confirmado pelo proprietário

| Item | Situação informada | Próxima ação |
| --- | --- | --- |
| Domínio `marmoteiro.com` | Registrado na **Cloudflare** | Conferir zona DNS e registro; não comprar outro domínio |
| E-mail `falecom@marmoteiro.com` | **Ainda não configurado** | Preparar recebimento e envio conforme a seção 10 |
| Google Workspace | **Não será contratado** | Usar conta Google pessoal; e-mail do domínio terá configuração separada |
| Firebase | Projeto no plano **Spark** | Preparar Auth; seguir a seção 3 antes de publicar no Cloud Run |
| Google AI Pro | Assinatura pela oferta de estudantes | Conferir vigência e benefícios no Google One e no perfil de desenvolvedor |
| Google Developer Program | Participação informada | Conferir vínculo com AI Pro e resgate de créditos; saldo ainda não verificado |

Essas informações são declarações do proprietário, não uma inspeção dos consoles. ID do projeto, validade da oferta, créditos, banco remoto e configuração de hospedagem ainda precisam ser confirmados.

**Ordem prática:** conferir domínio na seção 16.1 → preparar recebimento na seção 10.1 → conferir benefícios e escolher Spark/Blaze na seção 3 → configurar Auth/banco → executar o deploy somente depois dos pré-requisitos. O domínio pode permanecer na Cloudflare com o site hospedado no Google.

## 1. O que será configurado

| Ferramenta | Responsabilidade | Quando configurar |
| --- | --- | --- |
| Firebase | Identidade dos futuros usuários reais | Usar o projeto Spark existente; integração no código depois |
| Google Cloud Run | Executar site e API | Depois de vincular faturamento/Blaze |
| Artifact Registry / Cloud Build | Guardar e construir as imagens da aplicação | Na preparação do deploy com faturamento |
| Secret Manager | Guardar URLs com senha e chaves privadas | Na preparação do deploy com faturamento |
| Neon | PostgreSQL remoto | Agora |
| Resend | E-mails automáticos do sistema | Conta/domínio podem ser preparados agora; envio depois |
| Cloudflare Registrar/DNS | Registro e DNS de `marmoteiro.com` | Domínio já registrado; conferir zona e renovação |
| Cloudflare Email Routing + Gmail | Encaminhar recebimento do endereço profissional | Proposta para configurar agora; envio tratado separadamente |
| Google AI Pro / Developer Program | Benefícios de desenvolvimento e possíveis créditos Cloud | Conferir e resgatar antes de estimar abatimentos |
| Google Calendar/Meet e Meta | Convites e lembretes | Preparar contas; concluir junto com cada integração |

A primeira publicação terá uma URL HTTPS `run.app`. Cadastro de cliente, pagamento, agenda e financeiro continuam demonstrativos. O login administrativo é real e depende do banco remoto. Criar um usuário no Firebase não concede acesso à gestão.

Reserve um gerenciador de senhas para os segredos. Anote os identificadores públicos numa ficha separada. Use sua conta Google pessoal, preferencialmente a mesma do AI Pro e Developer Program, e autenticação em duas etapas. Não é necessário contratar Workspace para Firebase, Google Cloud, Calendar ou uso da conta pessoal no Meet. `falecom@marmoteiro.com` continua sendo o canal público oficial; não precisa ser o login dos consoles.

## 2. Firebase e Google Cloud: um único projeto

1. Entre no [Firebase Console](https://console.firebase.google.com/).
2. Abra o projeto Spark que você já utiliza e confirme que é o destinado a este produto. Não crie outro somente para trocar de plano. Apenas se ainda não existir um projeto do Marmoteiro, escolha **Criar projeto / Create a project**.
3. Nome de exibição sugerido: `O Tal do Marmoteiro`.
4. ID sugerido: `marmoteiro-prod`. Se estiver ocupado, aceite um sufixo único e anote o ID completo. ID não é a mesma coisa que nome de exibição ou número do projeto.
5. Google Analytics é opcional para este produto nesta etapa. Pode deixá-lo desativado; as métricas financeiras virão do banco de negócio.
6. Termine a criação. Em **Configurações do projeto > Geral**, registre `Project ID` e `Project number`.
7. Abra o [Google Cloud Console](https://console.cloud.google.com/) com a mesma conta. No seletor superior, escolha o **mesmo ID**. Não crie outro projeto para o Cloud Run.

Firebase acrescenta serviços ao projeto Google Cloud associado. Registrar aplicativo web não publica o site. [Configuração oficial](https://firebase.google.com/docs/web/setup).

**Verificação:** o ID exibido nos dois consoles é idêntico.

## 3. Spark, Blaze, benefícios e controle de gastos

### 3.1 O Spark atende ao projeto?

**Atende à preparação e ao uso de Firebase Authentication com e-mail/senha dentro dos limites aplicáveis. Não atende ao deploy completo descrito neste guia.** O projeto usa Next.js com rotas de servidor, API NestJS e PostgreSQL; Firebase Hosting estático sozinho não executa essas camadas. [Planos Firebase](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [preços por produto](https://firebase.google.com/pricing).

| Caminho | O que fazer | Resultado |
| --- | --- | --- |
| Continuar no Spark por enquanto | Preparar Auth, domínio, e-mail e banco; manter execução local | Sem faturamento Google habilitado; deploy Cloud Run fica pendente |
| Seguir a hospedagem já prevista | Vincular Cloud Billing ao mesmo projeto e conferir Blaze | Permite Cloud Run e os recursos de deploy; cobranças dependem do uso |

Blaze é cobrança por consumo, sem mensalidade fixa de plano Firebase. Vincular faturamento ao projeto Google Cloud também muda o Firebase associado para Blaze. Créditos não dispensam esse vínculo. App Hosting também exige Blaze; não é um atalho para manter o Spark. [Mudança de plano](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans), [App Hosting](https://firebase.google.com/docs/app-hosting/costs).

Se quiser manter **toda** a hospedagem sem Cloud Billing, será necessário escolher e homologar outro destino para web/API. Ter o domínio na Cloudflare não executa os containers; migrar Next/Nest para Workers seria outra decisão técnica. Não converter a aplicação em site estático para contornar o plano e perder a proteção administrativa.

### 3.2 Aproveitar Google AI Pro e Google Developer Program

A documentação atual do AI Pro lista **US$ 10/mês em créditos Google Cloud** e 30 workspaces Firebase Studio, mediante assinatura ativa vinculada ao perfil de desenvolvedor. O benefício Developer não é compartilhado com membros da família. [Benefícios AI Pro](https://support.google.com/googleone/answer/14534406?hl=en).

Sua assinatura estudantil foi informada, mas não consultada. Ofertas estudantis variam por região, período e tipo de oferta; verifique a assinatura existente, sem assumir que a oferta anunciada hoje para novos inscritos substitui seu contrato. [Ofertas estudantis](https://support.google.com/googleone/answer/17422238?hl=en).

1. Abra [Google One](https://one.google.com/) com a conta da oferta e confira **AI Pro**, titularidade, validade e próxima renovação/preço.
2. Na mesma conta, abra [My Benefits do Google Developer Program](https://developers.google.com/program/my-benefits). Confira se os benefícios AI Pro/Premium aparecem; concluir cadastro Standard sozinho não comprova o crédito mensal.
3. Localize o benefício de **Google Cloud credits** e siga o resgate mostrado. Confira a conta de faturamento de destino; ela deve ser a que será ligada ao projeto Marmoteiro.
4. Se aparecer código promocional, use o [resgate oficial do Cloud Billing](https://console.cloud.google.com/billing/redeem), sem publicar o código. Se houver seleção direta de conta, use esse fluxo. A FAQ informa que o crédito resgatado se aplica a uma única conta de faturamento. [FAQ de benefícios](https://developers.google.com/profile/help/benefits).
5. Em **Google Cloud > Billing > Credits**, confirme que o crédito foi concedido. Registre privadamente valor, saldo, validade, serviços elegíveis e se o próximo período exige novo resgate. As condições do crédito específico prevalecem; não aplicar prazos de planos antigos à oferta atual.
6. Se o benefício não aparecer, confirme a conta/vínculo e consulte o suporte indicado na página do AI Pro. Até resolver, calcule o orçamento com crédito **zero**; não contratar outra assinatura apenas para tentar liberar um benefício possivelmente já incluído.

**Não somar benefícios diferentes:** o Standard oferece recursos de aprendizagem, mas não equivale ao Premium do AI Pro. Créditos de Google Skills, AI credits de Flow/Antigravity, armazenamento do Google One e workspaces do Firebase Studio não pagam a hospedagem. Os antigos pacotes Premium anuais de US$ 500 não são automaticamente incluídos no AI Pro; a documentação atual distingue esses contratos. [Comparação dos planos](https://developers.google.com/program/plans-and-pricing), [transição dos benefícios](https://developers.google.com/profile/help/benefits).

Créditos Cloud elegíveis podem abater serviços Google, como Cloud Run; não pagam a renovação Cloudflare, Neon, Resend ou Meta. Manter estimativa antes dos créditos e acompanhar o valor abatido na fatura. Expiração da promoção/assinatura não é mecanismo para desligar recursos faturáveis.

### 3.3 Como mudar de Spark para Blaze quando for publicar

1. No Firebase, abra o projeto correto e a opção **Upgrade / Fazer upgrade**, junto ao plano Spark.
2. Escolha **Blaze** e selecione/crie sua conta Cloud Billing. Use a mesma conta de faturamento do crédito, se resgatado.
3. Revise cadastro, pagamento e condições no próprio Google e conclua a associação. O procedimento equivalente é **Google Cloud > Billing > Link a billing account** no mesmo Project ID.
4. Confira **Blaze** no Firebase e o vínculo do projeto em Billing. Não é necessário recriar Auth, usuários ou projeto.
5. Configure os alertas abaixo antes de habilitar recursos e executar as etapas 6–9 e 12–14. [Vincular faturamento](https://docs.cloud.google.com/billing/docs/how-to/modify-project).

**Se permanecer no Spark, não execute os comandos de build/deploy deste guia.** Pode continuar com as etapas preparatórias; a mudança de plano não foi realizada por esta atualização documental.

### 3.4 Alertas e acompanhamento

Cloud Run exige uma conta de faturamento vinculada, mesmo quando o consumo cabe na franquia. A associação de faturamento também deve aparecer no Firebase como plano Blaze. Não confundir créditos temporários de avaliação com franquias permanentes.

1. No Google Cloud, abra **Faturamento / Billing**.
2. Vincule uma conta existente ou crie a sua, preenchendo país, cadastro e pagamento diretamente no Google.
3. Confira a associação ao projeto Marmoteiro. Leia a moeda e condições antes de concluir.
4. Em **Orçamentos e alertas / Budgets & alerts**, crie um orçamento do tipo **somente alertas**.
5. Nome: `Marmoteiro - acompanhamento mensal`.
6. Escopo: somente este projeto; todos os serviços.
7. Período: mensal. Valor sugerido para acompanhamento: R$ 30 se a conta faturar em reais, ou US$ 5 se faturar em dólares. São exemplos de alertas, não conversão cambial nem promessa de custo.
8. Crie alertas em 50%, 80% e 100% do valor. Ative também previsão de ultrapassagem, se disponível.
9. Confirme os destinatários de faturamento; inclua um endereço que você acompanha.
10. Depois do primeiro deploy, acompanhe **Billing > Reports**, filtrando o projeto.

**Um orçamento somente de alertas não interrompe cobranças.** Os limites de instâncias ajudam, mas não são um teto financeiro. O Google oferece controles de gasto em prévia para alguns cenários; não são parte da configuração deste roteiro. [Orçamentos oficiais](https://docs.cloud.google.com/billing/docs/how-to/budgets).

**Verificação:** faturamento ativo para o ID correto e orçamento listado com os destinatários corretos.

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

## 10. E-mail profissional sem Google Workspace

O endereço oficial continua sendo **falecom@marmoteiro.com**. Como ainda não foi configurado, primeiro prepare recebimento; depois valide o envio. Nenhuma conta de Workspace faz parte deste roteiro.

### 10.1 Receber no Gmail com Cloudflare Email Routing

O encaminhamento simples está disponível no plano gratuito; a caixa que armazena as mensagens será seu Gmail de destino. [Preços do Email Service](https://developers.cloudflare.com/email-service/platform/pricing/).

1. No [painel Cloudflare](https://dash.cloudflare.com/), procure **Email Routing**, atualmente em **Compute > Email Service**; em interfaces anteriores, pode aparecer dentro do domínio em **Email**.
2. Em **Onboard Domain**, selecione `marmoteiro.com`. Revise os registros MX/TXT propostos antes de confirmar. Se já aparecer outro serviço de e-mail no DNS, confira sua função antes de substituir registros.
3. Em **Destination Addresses**, adicione seu Gmail de destino e confirme o link recebido nessa caixa.
4. Em **Routing Rules**, crie `falecom` no domínio, ação **Send to an email**, escolhendo o destino verificado. Salve.
5. Teste a partir de **outra conta**, diferente do Gmail de destino: envie para `falecom@marmoteiro.com` e confirme a chegada, inclusive na pasta de spam. [Passo a passo oficial](https://developers.cloudflare.com/email-service/get-started/route-emails/).

Não é necessário publicar o Gmail pessoal como contato do negócio. Marque o recebimento como concluído apenas após o teste; registro do domínio sozinho não cria uma caixa de entrada.

### 10.2 Enviar e responder como falecom@marmoteiro.com

Receber uma mensagem encaminhada não configura automaticamente o remetente no Gmail. Responder normalmente pode revelar o endereço Gmail. Para usar o canal profissional também na saída, escolha e valide um serviço de envio/SMTP autorizado para o domínio ou uma caixa postal de outro provedor, sem obrigatoriedade de Workspace.

A Cloudflare oferece **Email Sending em beta, inclusive SMTP**, separadamente do encaminhamento. Envio para destinatários arbitrários exige **Workers Paid**, segundo a tabela atual; não considerar esse recurso incluído gratuitamente no registro do domínio. Pode ser avaliado como alternativa, mas ainda exige domínio autorizado, cliente de e-mail compatível e testes de entrega. [SMTP Cloudflare](https://developers.cloudflare.com/email-service/api/send-emails/smtp/), [condições de preço](https://developers.cloudflare.com/email-service/platform/pricing/).

Antes de usar o endereço em atendimento real, testar recebimento, resposta com `From: falecom@marmoteiro.com` e autenticação SPF/DKIM/DMARC no destinatário. O provedor de saída humana continua **a escolher**. O Resend abaixo é o candidato já documentado para mensagens automáticas da aplicação; sua configuração não cria uma interface de caixa postal.

### 10.3 Preparar o Resend para mensagens automáticas

Esta etapa pode ser feita agora, mas não é necessária para a primeira URL `run.app`.

1. Entre no [Resend](https://resend.com/) e crie sua conta. Confirme o e-mail e o plano Free.
2. Abra **Domains > Add domain**.
3. Use o subdomínio `notificacoes.marmoteiro.com`. Ele separa os envios do sistema do recebimento de `falecom@marmoteiro.com`.
4. Escolha a região de envio disponível mais adequada e registre a escolha; ela é independente da região do banco.
5. O Resend exibirá os registros DNS. Abra **Cloudflare > marmoteiro.com > DNS > Records > Add record**. Copie os nomes e valores fornecidos, sem duplicar `.marmoteiro.com` no nome. Registros de e-mail/verificação devem ficar em **DNS only** quando existir a opção de proxy; TXT/MX não são proxy HTTP. [Configuração Resend na Cloudflare](https://resend.com/docs/knowledge-base/cloudflare).
6. Copie **tipo, host/nome, conteúdo e prioridade**, quando houver, exatamente do painel. O TTL padrão normalmente serve.
7. Atenção ao campo de nome: alguns provedores acrescentam `.marmoteiro.com` automaticamente. Evite criar um nome duplicado como `...marmoteiro.com.marmoteiro.com`.
8. Preserve os MX da raiz usados pelo Cloudflare Email Routing, se já ativado. O MX do subdomínio de retorno do Resend tem outra finalidade. Não habilite recebimento Resend na raiz nem troque esses MX para configurar somente envio.
9. Não crie dois TXT começando com `v=spf1` no mesmo hostname. Se já houver um registro no nome solicitado, concilie-o com a configuração existente.
10. Clique em **Verify / I've added the records** e aguarde a verificação. Se continuar pendente, compare os nomes completos e valores antes de repetir registros.

Verificar domínio de envio não exige transferir sua caixa postal. O sistema terá remetente sugerido `O Tal do Marmoteiro <avisos@notificacoes.marmoteiro.com>` e resposta dirigida a `falecom@marmoteiro.com`. Esse remetente é uma proposta para a futura integração, não uma variável já utilizada pelo código. [Domínios](https://resend.com/docs/dashboard/domains/introduction), [gestão e verificação](https://resend.com/docs/dashboard/domains/manage-domains).

Depois da verificação, crie a chave em **API Keys > Create API Key**:

| Campo | Valor |
| --- | --- |
| Nome | `marmoteiro-producao-envio` |
| Permissão | Sending access |
| Domínio | `notificacoes.marmoteiro.com` |

Guarde o valor exibido uma vez no gerenciador de senhas. Depois de preparar Blaze/Secret Manager, cadastre-o como segredo `marmoteiro-resend-api-key`. A associação à API e a variável de ambiente serão acrescentadas quando implementarmos o provedor de envio. Desative rastreamento de abertura/clique para os avisos de consulta; preserve conteúdo mínimo. Se a conta solicitar aprovação para produção, complete o cadastro verdadeiro do negócio. [Chaves](https://resend.com/docs/dashboard/api-keys/introduction), [permissões](https://resend.com/docs/api-reference/api-keys/create-api-key).

**Verificação:** domínio Verified, chave restrita guardada privadamente e recebimento profissional testado. A aplicação ainda precisa da integração de envio; verificar DNS não ativa mensagens automáticas no projeto.

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

**Depois de concluir os pré-requisitos, você pode voltar ao chat e pedir o deploy.** Confirme Blaze/faturamento, banco e segredos na ficha da seção 17; os próximos blocos documentam a execução técnica completa. Não é necessário você executá-los manualmente se preferir que o Codex continue.

## 12. Construir as imagens remotas

Execute os blocos em ordem, interrompendo se houver erro. Use a versão revisada e integrada conforme o Git Flow, com o SHA validado identificado. Confira alterações locais antes de enviar a fonte; não publicar arquivos alheios ou segredos junto do build.

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

Usar sua **conta Google pessoal**, sem contratar Workspace. O Google One documenta recursos premium de Calendar/Meet para planos AI elegíveis com 2 TB ou mais, inclusive no Brasil: reuniões mais longas, gravação e funcionalidades de agenda. Confira o que está efetivamente habilitado na conta organizadora da oferta estudantil. A expressão “Workspace premium features” nessa página não exige comprar uma assinatura empresarial separada. [Benefícios de Calendar/Meet](https://support.google.com/googleone/answer/12351029?hl=en).

Ter gravação disponível não autoriza gravar uma consulta: preservar consentimento separado, retenção ordinária de até 90 dias e legal hold. Armazenamento Google One não substitui automaticamente a política de arquivos do sistema. Páginas de agendamento do Google também não substituem checkout, confirmação de pagamento e regras do projeto.

1. Escolha a conta Google que será dona da agenda profissional; preferir a titular dos benefícios que pretende usar. Ela pode diferir da conta de faturamento.
2. No [Google Calendar](https://calendar.google.com/), crie uma agenda `Consultas - O Tal do Marmoteiro`, com fuso `America/Sao_Paulo`, sem publicação pública.
3. Em **Configurações da agenda > Integrar agenda**, anote o ID. Não compartilhe links secretos iCal nem conteúdo da agenda pessoal.
4. No projeto Google Cloud, habilite **Google Calendar API** (`calendar-json.googleapis.com`).
5. Na área **Google Auth Platform**, prepare Branding/nome do aplicativo, e-mail de suporte e contato do desenvolvedor. Para teste com a conta pessoal, use audiência **External** e seu usuário como testador; não escolher Internal, que pressupõe organização compatível.
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

## 16. Domínio na Cloudflare e conexão com a hospedagem

### 16.1 Conferir o domínio que você já registrou

1. No [painel Cloudflare](https://dash.cloudflare.com/), selecione `marmoteiro.com` e confira o estado da zona e do registro.
2. Confira verificação do e-mail do registrante, vencimento e renovação. Use um endereço de acesso já funcional enquanto `falecom@marmoteiro.com` estiver em preparação.
3. Abra **DNS > Records** e revise os registros existentes. Guarde uma cópia antes de alterações de hospedagem/e-mail; não remover registros por parecerem antigos.
4. Mantenha os nameservers Cloudflare. Domínios registrados no Cloudflare Registrar já usam seus nameservers; para hospedar no Google basta configurar os registros adequados, sem transferir o domínio. [Registrar](https://developers.cloudflare.com/registrar/get-started/register-domain/), [nameservers](https://developers.cloudflare.com/dns/nameservers/update-nameservers/).

### 16.2 Publicar primeiro e definir a frente HTTPS

Primeiro valide web/API na URL `run.app`, conforme etapas 12–14. Um CNAME direto para ela, mesmo com proxy Cloudflare, não configura sozinho reconhecimento do hostname e certificado na origem. O Google oferece load balancer, Firebase Hosting e mapeamento nativo limitado. Este último está em prévia, não é recomendado para produção e **não inclui `southamerica-east1`** na lista de regiões suportadas. [Opções de domínio](https://docs.cloud.google.com/run/docs/mapping-custom-domains).

Firebase Hosting como frente do Cloud Run pode ser uma opção econômica, mas precisa de ajuste e homologação do login: esse proxy encaminha normalmente apenas o cookie `__session`; hoje usamos `__Host-marmoteiro-admin`. Portanto, não configurar esse redirecionamento como se já estivesse compatível. [Cookies do Hosting](https://firebase.google.com/docs/hosting/manage-cache).

Load balancer possui custo próprio; não o contratar automaticamente para a prévia. Um proxy/Worker Cloudflare seria outra opção a implementar e homologar, com atenção ao hostname da origem e cookies; o registro do domínio não entrega esse proxy pronto. A escolha da frente HTTPS continua pendente, sem alterar a região do banco/aplicação apenas para contornar uma restrição de DNS.

### 16.3 Aplicar DNS depois da escolha

1. Configure o domínio e certificado no serviço de hospedagem/frente HTTPS escolhido e obtenha os registros exatos de verificação e destino.
2. Em **Cloudflare > DNS > Records**, adicione somente os registros fornecidos para raiz (`@`) e/ou `www`. Não inventar IP, alvo CNAME ou valor TXT. Preserve MX/TXT de e-mail.
3. Para verificações, use DNS only quando aplicável. Habilitar proxy HTTP exige confirmar TLS e comportamento com a origem; não usar SSL Flexible para contornar falhas de certificado.
4. Escolha a URL canônica, por exemplo `https://marmoteiro.com`, e configure redirecionamento da outra variante. Atualize `APP_ORIGIN` para a origem exata e os domínios autorizados do Firebase. Ajuste callbacks/webhooks quando implementados.
5. Valide login, logout, cookies, origem e páginas autenticadas. Regras de CDN devem preservar `Cache-Control: no-store` e impedir cache de sessões/conteúdo privado, inclusive `/gestao`, `/minha-conta` e `/api/admin`.
6. Repita o teste de recebimento e resposta do e-mail após a alteração. Registre destino, data e resultado no handoff, sem segredos.

**Estado atual:** domínio registrado; apontamento da aplicação, certificado e testes ainda não confirmados. Este roteiro mantém essa pendência explícita em vez de tratar DNS como deploy concluído.

## 17. Informações para retornar ao Codex

Pode colar esta ficha, sem credenciais:

```text
Firebase / Google Cloud Project ID:
Plano Firebase exibido (Spark/Blaze):
Faturamento vinculado: sim/não
Google AI Pro ativo / data final da oferta / próxima renovação:
Benefício Developer vinculado e visível: sim/não
Crédito Cloud resgatado / valor / validade / serviços elegíveis (sem código):
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
Domínio Resend / status Verified:
Domínio registrado na Cloudflare / zona ativa: sim/não
Email Routing configurado / recebimento testado: sim/não
Provedor de envio humano / resposta com remetente profissional testada:
Frente HTTPS escolhida / domínio conectado / URL canônica:
```

Não enviar URLs completas de banco, senha de login, API key Resend, client secret Google, refresh token, token WhatsApp, chave JSON privada ou códigos de autenticação. A configuração pública do SDK Firebase pode ser compartilhada; os segredos serão acessados pelos recursos autorizados no ambiente.

## 18. Problemas comuns

| Sintoma | Verificar |
| --- | --- |
| `gcloud: command not found` | Instalação/PATH; abrir novo Terminal |
| Projeto não encontrado | ID exato, conta ativa, permissões; não usar apenas nome de exibição |
| Cloud Run exige faturamento | Spark não executa este deploy; seguir a etapa 3.3 no projeto correto |
| AI Pro ativo, mas sem crédito Cloud | Mesma conta titular, vínculo Developer, benefício disponível, resgate e conta Billing de destino |
| Crédito esgotou ou venceu | Revisar fatura e consumo; promoção não é teto de gasto nem desligamento de recursos |
| Build não lê fonte | Bucket selecionado, Storage Object Viewer para a conta de build |
| Build não grava imagem/log | Artifact Registry Writer no repositório e Logs Writer no projeto |
| `iam.serviceAccounts.actAs` negado | Permissão do usuário que executa o deploy na conta escolhida |
| Secret access denied | Papel Secret Accessor no segredo e conta de serviço efetivamente associada à revisão/job |
| Container não inicia | Logs, porta 8080, HOST/HOSTNAME, arquitetura Linux/amd64, conexão TLS do banco |
| Login retorna origem não autorizada | `APP_ORIGIN` igual à URL HTTPS usada, sem caminho; aplicar a segunda revisão web |
| Login indica indisponibilidade | API URL, segredo compartilhado, migrações, banco e logs |
| Senha local não entra no remoto | Conta remota ainda não provisionada ou senha diferente |
| Resend Pending | Autoridade DNS correta, nome sem duplicação, valores e propagação |
| E-mail profissional não chega | Destino verificado, regra `falecom`, MX ativos e teste a partir de outra conta |
| Resposta mostra Gmail pessoal | Encaminhamento não configura envio; validar SMTP/remetente profissional na etapa 10.2 |
| Domínio abre erro ou login não mantém sessão | Hostname/certificado da origem, frente HTTPS, cache/cookies e `APP_ORIGIN`; CNAME sozinho não basta |
| Agenda para após alguns dias | Estado Testing/expiração OAuth, consentimento ou token revogado |

Não solucionar erro abrindo o banco, concedendo Owner a todos, removendo guards ou gravando senha em código. Registre o erro sem conteúdo secreto e corrija a permissão/configuração específica.
