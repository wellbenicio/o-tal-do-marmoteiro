# Configuração das contas e primeira publicação

Guia do responsável pelo O Tal do Marmoteiro. Revisado em **02/10/2026** para execução no **Windows com PowerShell**, considerando as informações do proprietário e as fontes oficiais indicadas. **Este documento é um roteiro: sua atualização não configura contas, DNS, faturamento ou integrações.** Os nomes dos menus podem variar.

## Como seguir este guia

Cada seção informa **onde fazer**, **o que precisa estar pronto** e **como conferir o resultado**. Nos painéis, clique nos botões indicados; os nomes entre crases são valores para preencher, não comandos. Execute somente os blocos marcados `powershell` no terminal do Windows. As tabelas de configuração não devem ser coladas no terminal.

| Etapas | Onde você trabalha | Resultado |
| --- | --- | --- |
| 1–3 | Navegador: Firebase, Google Cloud e benefícios Google | Projeto identificado, decisão de faturamento e alertas |
| 4 | Navegador: Firebase Console | Authentication preparado |
| 5 | Navegador: Neon e seu cofre pessoal | Banco e duas conexões guardadas |
| 6–9 | Navegador: Google Cloud Console; um comando local na 8.3 | APIs, contas de serviço, segredos e armazenamento |
| 10 | Navegador: Cloudflare, caixa de destino e Resend | Recebimento de e-mail e domínio de envio preparado |
| 11 | Instalador Google e PowerShell do seu computador | Terminal autenticado |
| 12–14 | PowerShell na pasta do repositório; painéis para conferir | Build, publicação de prévia e administrador remoto |
| 15 | Navegador: Google Calendar, Google Cloud e Meta | Preparação das integrações futuras |
| 16 | Navegador: Cloudflare e frente HTTPS a definir | Domínio; conexão final depende de homologação |
| 17–18 | Este guia e o chat | Ficha de acompanhamento e diagnóstico |

**Se já concluiu uma etapa, confira o resultado e prossiga. Não recrie projetos, contas ou segredos que já existem.** Uma tela diferente pode significar que o recurso já foi criado: confira nome, projeto e permissões antes de repetir.

**Como abrir o PowerShell:** no Windows, abra Iniciar e procure **PowerShell**, ou abra Windows Terminal e selecione o perfil PowerShell. Use uma janela interativa normal, sem necessidade de executar como administrador para os comandos deste guia. Cloud Shell, Prompt de Comando e Git Bash usam ambientes diferentes; não cole estes blocos neles.

**Como copiar comandos:** copie o bloco inteiro, sem os delimitadores de Markdown. Substitua os valores `ID_REAL_DO_PROJETO` e outros exemplos identificados antes de executar. Nos comandos de várias linhas, o acento grave no fim da linha continua o mesmo comando; não acrescente espaços depois dele. Execute um bloco por vez e confira o resultado antes de seguir. Se um comando falhar, pare: PowerShell pode continuar executando linhas posteriores se você colar vários comandos de uma vez.

Nas etapas 12–14, mantenha a mesma janela PowerShell: as variáveis `$env:MARMOTEIRO_...` guardam identificadores temporários da sessão. Se fechar a janela, repita a configuração da seção 12.1 com os mesmos valores, especialmente a tag do build que já foi concluído.

Termos usados: **API** é o servidor do sistema; **build** é a construção das imagens; **imagem** é o pacote executável da aplicação; **deploy** é sua publicação; **migração** atualiza a estrutura do banco; **IAM/papel** define quem pode fazer o quê; **conta de serviço** é a identidade de um programa; **segredo** é um valor confidencial, como uma URL contendo senha.

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

**Ordem prática:** conferir domínio na seção 16.1 → preparar recebimento na seção 10.3 → conferir benefícios e escolher Spark/Blaze na seção 3 → configurar Auth/banco → executar o deploy somente depois dos pré-requisitos. O domínio pode permanecer na Cloudflare com o site hospedado no Google.

## 1. O que será configurado

**Onde fazer:** leia esta seção antes de abrir os painéis. Separe sua conta Google e um cofre pessoal para as credenciais.

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

### 1.1 Cofre pessoal e Secret Manager são ferramentas diferentes

O **gerenciador de senhas pessoal** serve para você guardar e recuperar credenciais. O **Google Cloud Secret Manager**, configurado na seção 8, permite que a aplicação receba essas credenciais com permissões controladas. Salvar uma URL no seu cofre não configura a aplicação; criar o segredo no Google também não publica o site.

Se já usa um cofre com notas seguras, mantenha-o. Se não usa, uma opção é [Bitwarden Password Manager Free](https://bitwarden.com/help/password-manager-plans/), que inclui notas seguras sem mensalidade. Não precisa contratar o produto Bitwarden Secrets Manager para seguir este guia.

1. Crie sua conta no [Bitwarden](https://bitwarden.com/) ou abra seu cofre existente.
2. Use senha mestra exclusiva e habilite autenticação em duas etapas; guarde o código de recuperação em local seguro.
3. Na seção 5, crie duas **Notas seguras**, uma para cada URL Neon. Na seção 8, crie outra para o segredo interno web/API.
4. Cole os valores no conteúdo das notas e salve. Não use um documento comum, planilha ou arquivo dentro do repositório como cofre. [Criar itens no Bitwarden](https://bitwarden.com/help/managing-items/).

**Pronto quando:** você consegue acessar o cofre e sabe distinguir valores secretos de nomes/IDs públicos. Não precisa enviar nenhum segredo ao chat.

## 2. Firebase e Google Cloud: um único projeto

**Onde fazer:** navegador, [Firebase Console](https://console.firebase.google.com/) e [Google Cloud Console](https://console.cloud.google.com/). Nenhum comando de terminal.

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

**Onde fazer:** navegador, nos painéis Google One, Developer Program, Firebase e Google Cloud indicados abaixo. **Antes:** confirme o Project ID da seção 2. Vincular faturamento é uma escolha do responsável e pode gerar cobranças por uso; atualizar este documento não faz essa associação.

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

**Onde fazer:** navegador, [Firebase Console](https://console.firebase.google.com/), dentro do projeto da seção 2. **Antes:** tenha o Project ID anotado. Pode preparar esta etapa ainda no Spark.

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

**Onde fazer:** navegador, [console Neon](https://console.neon.tech/) e seu gerenciador de senhas pessoal. **Antes:** tenha o cofre da seção 1.1 preparado. Não use o Secret Manager para criar o banco: ele só guardará as URLs depois.

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
6. No seu cofre, crie a nota segura `Marmoteiro — Neon — pooled` e cole a primeira URL completa. Crie a nota `Marmoteiro — Neon — direta` e cole a segunda. Salve ambas. Elas contêm senha e não devem ser enviadas no chat.

**O que você está copiando:** a URL é o endereço de conexão do programa com o banco e inclui usuário, senha, hostname, banco e parâmetros TLS. Copie o valor inteiro, sem editá-lo nem substituir a senha por asteriscos. Os asteriscos só servem para ocultação visual; a aplicação precisa do valor real. Na seção 8 você copiará esses mesmos valores do cofre para o Google.

O pool será usado pela API; a conexão direta, pelas migrações. São caminhos de conexão, não papéis de segurança diferentes. A prévia pode usar a role inicial; antes da operação comercial, restringiremos a role de execução e separaremos as permissões de migração. [Conexões Neon](https://neon.com/docs/connect/connect-from-any-app).

Confira que a pausa automática por inatividade está mantida e acompanhe armazenamento/compute no painel. Não configure um monitor que consulte o banco a cada minuto. Confira as franquias atuais em **Billing/Usage**: a publicação anterior anunciava 100 CU-h e 0,5 GB por projeto; o Neon também anunciou aumento de armazenamento para 1 GB. Registre o limite efetivamente exibido na sua conta, sem assumir que uma franquia antiga continua igual. Backup/restauração precisam de um plano próprio antes de dados comerciais. [Anúncio anterior](https://neon.com/blog/neon-backend-is-ga), [atualização de armazenamento](https://neon.com/blog/neon-free-plan-1-gb-per-project).

**Verificação:** duas URLs da mesma branch/banco, uma pooled e uma direta, guardadas privadamente; plano Free confirmado.

## 6. Habilitar os serviços Google Cloud

**Onde fazer:** navegador, [Google Cloud Console](https://console.cloud.google.com/). **Antes:** confira o projeto no seletor superior e conclua a decisão de faturamento da seção 3 para preparar este deploy.

1. Abra **☰ > APIs e serviços > Biblioteca**.
2. Pesquise o primeiro serviço da tabela pelo nome ou identificador.
3. Abra o resultado e clique em **Ativar / Enable**. Se aparecer **Gerenciar / Manage**, a API já está ativa.
4. Volte à Biblioteca e repita para os demais serviços.

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

**Onde fazer:** navegador, [Google Cloud Console](https://console.cloud.google.com/). Esta seção inteira usa cliques no painel, sem terminal. **Antes:** projeto correto selecionado e APIs da seção 6 habilitadas.

Uma conta de serviço identifica um programa perante o Google. Não é uma conta Gmail, não recebe e-mails e não tem senha de login. Cada componente recebe sua própria identidade para que possamos limitar suas permissões.

### 7.1 Criar as quatro contas

1. No topo do Google Cloud Console, confira o Project ID do Marmoteiro.
2. Abra **☰ > IAM e administrador > Contas de serviço**. Se não localizar o menu, pesquise `Contas de serviço` na busca superior.
3. Clique em **Criar conta de serviço**.
4. Para a primeira conta, preencha **Nome** e **ID** com `marmoteiro-web`. Confira o ID, pois o painel pode sugeri-lo automaticamente. Na descrição, use a finalidade da tabela.
5. Clique em **Criar e continuar**.
6. Em **Conceder a esta conta de serviço acesso ao projeto**, deixe os papéis vazios e clique em **Continuar**.
7. Em **Conceder aos usuários acesso a esta conta de serviço**, deixe vazio por enquanto e clique em **Concluir**.
8. Repita para as outras três linhas. Se a conta já existir, confira o ID e não a recrie.

| Nome e ID | Descrição/finalidade |
| --- | --- |
| `marmoteiro-web` | Executar Next.js |
| `marmoteiro-api` | Executar NestJS |
| `marmoteiro-migrate` | Aplicar migrações |
| `marmoteiro-build` | Construir e publicar imagens |

O e-mail gerado segue `NOME@ID_DO_PROJETO.iam.gserviceaccount.com`. As contas de execução serão associadas aos containers, sem arquivo JSON de chave. Na criação, pode concluir sem conceder papel no projeto inteiro; as permissões específicas vêm nas próximas etapas. Não dar Owner/Editor a essas contas.

Copie os quatro e-mails da listagem para sua ficha de identificadores públicos. Use os e-mails completos nas próximas etapas, incluindo o ID real do projeto. [Criar contas de serviço](https://docs.cloud.google.com/iam/docs/service-accounts-create).

### 7.2 Permitir que o build escreva logs

1. Abra **☰ > IAM e administrador > IAM**. Esta é a página de acesso ao projeto, diferente de **Contas de serviço**.
2. Clique em **Conceder acesso / Grant access**.
3. Em **Novos principais / New principals**, cole o e-mail completo de `marmoteiro-build`, copiado da listagem.
4. Em **Selecionar um papel**, procure **Logs Writer / Gravador de registros**, identificador `roles/logging.logWriter`.
5. Deixe a condição vazia e clique em **Salvar**.
6. Na listagem IAM, confira que o papel aparece para esse e-mail.

Ele precisa escrever o log do build. Permissões de imagens e fonte serão dadas nos respectivos recursos na seção 9. Não conceda esse papel às outras três contas apenas para repetir a configuração.

### 7.3 Sua permissão para usar essas identidades

O usuário Google que executará o deploy precisa poder associar as contas aos serviços: essa permissão se chama `iam.serviceAccounts.actAs`. Esse texto é o nome de uma permissão, **não um comando**. Se você já tem essa permissão, não precisa acrescentar outro papel.

Se ela faltar, um administrador autorizado deve abrir **Contas de serviço**, selecionar a conta correspondente e usar **Permissões > Conceder acesso** (ou **Gerenciar acesso** na listagem). O principal é **seu e-mail Google** e o papel é **Service Account User / Usuário da conta de serviço** (`roles/iam.serviceAccountUser`). Conceda nas contas específicas que você usará. Não confunda esta operação com conceder acesso ao projeto para a própria conta de build. [Acesso às contas de serviço](https://docs.cloud.google.com/iam/docs/manage-access-service-accounts).

Uma conta de build explícita evita depender de qual identidade padrão o Google selecionou para aquele projeto. [Contas de build](https://docs.cloud.google.com/build/docs/securing-builds/configure-user-specified-service-accounts).

**Verificação:** quatro contas listadas, sem chaves JSON criadas; build com Logs Writer.

## 8. Guardar os três segredos necessários ao deploy

**Onde fazer:** navegador, [Secret Manager do Google Cloud](https://console.cloud.google.com/security/secret-manager). Somente a geração do terceiro valor, na seção 8.3, usa o PowerShell local. **Antes:** APIs habilitadas, quatro contas da seção 7 criadas, duas URLs Neon no cofre e decisão de faturamento concluída.

Aqui você cadastra no Google os valores que os programas usarão. **Nome do segredo** é a etiqueta pública do recurso. **Valor do segredo** é o conteúdo confidencial. **Versão** identifica uma edição desse conteúdo: a primeira normalmente é `1`. Os comandos de deploy usarão nome e versão para buscar o valor; você não colocará as senhas dentro deles.

### 8.1 Conferir os três valores e os acessos

Crie os nomes abaixo exatamente, pois o deploy os referencia:

| Nome do segredo | Conteúdo | Contas que recebem Secret Accessor |
| --- | --- | --- |
| `marmoteiro-database-url` | URL pooled do Neon | `marmoteiro-api` |
| `marmoteiro-database-direct-url` | URL direta do Neon | `marmoteiro-migrate`; seu usuário Google para executar o CLI administrativo |
| `marmoteiro-admin-api-secret` | Texto aleatório de 64 caracteres hexadecimais | `marmoteiro-api` e `marmoteiro-web` |

Na coluna de contas, os nomes abreviados representam os **e-mails completos das contas de serviço** da seção 7. “Seu usuário Google” representa o e-mail com que você entra no console, não `falecom@` automaticamente.

### 8.2 Criar os dois segredos do banco, pelo navegador

1. Abra o Secret Manager e confira o projeto no seletor superior. Se o painel pedir para ativar a API, volte à seção 6 e habilite **Secret Manager API**.
2. Clique em **Criar segredo / Create secret**.
3. No campo **Nome / Name**, preencha `marmoteiro-database-url`.
4. No seu cofre pessoal, abra `Marmoteiro — Neon — pooled` e copie a URL completa.
5. Cole somente essa URL em **Valor do segredo / Secret value**. Não use a função de anexar arquivo, não copie `psql`, aspas, espaços ou quebras de linha e preserve os parâmetros TLS.
6. Em **Replicação / Replication policy**, para este roteiro selecione a opção gerenciada pelo usuário e somente `southamerica-east1`, se essa foi sua região Google escolhida. Pode aparecer como **Escolher locais / Choose locations**. Se você já adotou replicação automática conscientemente, mantenha e registre: ela permite ao Google escolher a localização e não é equivalente a restringir o segredo a São Paulo. Esta escolha não muda a localização do banco Neon.
7. Mantenha criptografia com chave gerenciada pelo Google. Não configure chave própria, rotação automática ou tópicos Pub/Sub nesta etapa.
8. Clique em **Criar segredo**. Na página do recurso, abra **Versões** e anote o número da versão habilitada; inicialmente costuma ser `1`.
9. Repita os passos criando `marmoteiro-database-direct-url`, mas agora cole a URL da nota `Marmoteiro — Neon — direta`.

Se um desses nomes já existir, abra-o e confira versão e configuração. Não acrescente outra versão apenas para repetir esta etapa. Se o valor estiver incorreto, uma nova versão será necessária e o deploy precisará apontar para ela; anote o número, sem apagar versões usadas por uma aplicação existente.

### 8.3 Gerar e criar o segredo interno web/API

Esse valor autentica a comunicação entre site e API. **Não é sua senha de administrador, senha Google nem senha Neon.** Será um único segredo compartilhado pelas duas aplicações.

1. Abra o **PowerShell do Windows**, como explicado no início do guia. Pode estar em qualquer pasta.
2. Execute `node --version`. É necessário Node.js disponível no PATH; o projeto usa Node 22 nos checks. Se o comando não existir, instale a versão compatível indicada para o projeto pelo [site oficial do Node.js](https://nodejs.org/en/download), abra nova janela e confira novamente.
3. Execute este comando uma única vez:

```powershell
node -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('hex'))" | Set-Clipboard
```

4. É normal não aparecer o segredo no terminal: ele foi copiado para a área de transferência. O comando gera 32 bytes aleatórios, representados por 64 caracteres hexadecimais.
5. No seu cofre, crie a nota segura `Marmoteiro — segredo interno web-API`, cole e salve o valor. Não gere outro valor entre o salvamento no cofre e a criação no Google.
6. No navegador, em **Secret Manager > Criar segredo**, use o nome `marmoteiro-admin-api-secret` e cole exatamente o mesmo valor no campo **Valor do segredo**.
7. Use a mesma política de replicação/criptografia definida em 8.2 e clique em **Criar segredo**. Anote a versão.
8. Depois de salvar nos dois locais, limpe a área de transferência com `Set-Clipboard -Value ''`. Se o histórico de área de transferência do Windows estiver ativo, abra **Win+V** e remova a entrada que contém o segredo.

Não cole o valor no chat para conferir o tamanho. Não crie uma chave diferente para web e API: ambas referenciam `marmoteiro-admin-api-secret`.

### 8.4 Conceder acesso a cada segredo

Faça isto **dentro do recurso de cada segredo**, não na página IAM do projeto inteiro:

1. Volte à lista Secret Manager e abra `marmoteiro-database-url`.
2. Abra **Permissões > Conceder acesso**. Em algumas versões do painel, selecione o segredo na lista e use o painel lateral de permissões.
3. Em **Novos principais**, cole o e-mail completo da conta de serviço `marmoteiro-api`.
4. Em **Selecionar um papel**, procure **Secret Manager Secret Accessor**, identificador `roles/secretmanager.secretAccessor`. Esse papel permite ler o valor; não escolha **Secret Manager Admin** para a aplicação.
5. Deixe a condição vazia e salve.
6. Abra `marmoteiro-database-direct-url` e repita para `marmoteiro-migrate`. Conceda o mesmo papel também ao seu usuário Google, que lerá a conexão para criar o administrador remoto na seção 14. Se já houver acesso herdado suficiente, não é necessário duplicá-lo.
7. Abra `marmoteiro-admin-api-secret` e conceda o papel às contas `marmoteiro-api` e `marmoteiro-web`.
8. Confira os principais e papéis em cada segredo usando a tabela 8.1. A conta `marmoteiro-build` não precisa ler nenhum dos três.

Não conceda acesso a `allUsers` ou `allAuthenticatedUsers`. Uma permissão ampla já herdada do projeto não desaparece ao adicionar uma permissão no segredo; revise qualquer concessão ampla feita por engano.

### 8.5 Custo e conferência final

O Google Cloud Secret Manager é cobrado por consumo, com franquia mensal de **6 versões ativas**, **10 mil acessos** e **3 notificações de rotação**, compartilhada pelos projetos da mesma conta de faturamento. Acima da franquia, a tabela em dólares indica aproximadamente **US$ 0,06 por versão/mês**, **US$ 0,03 por 10 mil acessos** e **US$ 0,05 por notificação de rotação**. A moeda de sua conta pode ter tabela própria. [Preços oficiais](https://cloud.google.com/secret-manager/pricing).

Com três segredos, uma versão de cada e uma localização ou replicação automática, o armazenamento cabe nessa franquia se ela não estiver consumida por outros projetos. Acessos também devem ficar dentro do limite. **Versões desabilitadas continuam contando como ativas para cobrança**; replicação em várias localizações também aumenta a contagem. Não destrua versões necessárias para revisão em execução ou rollback apenas para reduzir custo.

**Pronto quando:** três recursos existem; suas versões estão habilitadas e anotadas; os valores também estão no cofre; cada conta tem o acesso da tabela 8.1. Você não precisa executar um comando que imprima os segredos para conferir. Criar esses recursos ainda não aplica migrações nem publica o site.

URLs sem senha, como endereço da API e origem do site, serão variáveis comuns do Cloud Run. `OUTBOX_TRIGGER_SECRET`, chaves Resend e tokens Google/Meta entram somente quando os respectivos fluxos forem habilitados. [Secret Manager](https://docs.cloud.google.com/secret-manager/docs/creating-and-accessing-secrets), [segredos no Cloud Run](https://docs.cloud.google.com/run/docs/configuring/services/secrets).

**Verificação:** três recursos criados, versões anotadas e acesso limitado conforme a tabela. Nenhum segredo no Git.

## 9. Criar o repositório de imagens e o armazenamento de builds

**Onde fazer:** navegador, [Google Cloud Console](https://console.cloud.google.com/). **Antes:** APIs da seção 6 ativas e e-mail completo de `marmoteiro-build` disponível. Os recursos desta seção armazenam artefatos do build e podem gerar cobrança por uso.

### 9.1 Repositório Docker

No Google Cloud, abra **Artifact Registry > Repositories > Create repository**:

| Campo | Valor |
| --- | --- |
| Nome | `marmoteiro` |
| Formato | Docker |
| Modo | Standard |
| Tipo de localização | Region |
| Região | `southamerica-east1`, se foi a escolha da etapa 5 |
| Criptografia | Chave gerenciada pelo Google |

Clique em **Criar**, abra o repositório e use **Permissões > Conceder acesso**. Em **Novos principais**, cole o e-mail completo de `marmoteiro-build`; em papel, escolha **Artifact Registry Writer** (`roles/artifactregistry.writer`); salve sem condição. Se a permissão aparecer no painel lateral da listagem, selecione o repositório para editá-la. O papel deve valer neste repositório.

### 9.2 Bucket para enviar o código ao build

Em **Cloud Storage > Buckets > Create**, crie `ID_DO_PROJETO-build-source`, substituindo pelo ID real. Se o nome não estiver disponível globalmente, escolha outro e anote:

- Localização regional igual à dos builds; classe Standard.
- Controle uniforme de acesso; prevenção de acesso público ativada.
- Esse bucket guarda pacotes de código do build, não consultas nem backups do banco.
- Para esses arquivos temporários, pode desativar versionamento e recuperação de exclusão, mantendo uma regra de ciclo de vida que exclui objetos após 7 dias. Não aplicar essa política a dados de clientes ou backups.
- No bucket, conceda `marmoteiro-build` o papel **Storage Object Viewer** (`roles/storage.objectViewer`). O proprietário que envia o código precisa poder gravá-lo.

Para conceder o acesso: abra o bucket criado, **Permissões > Conceder acesso**, cole o e-mail completo de `marmoteiro-build`, selecione **Storage Object Viewer** e salve. Para a regra de limpeza, abra **Ciclo de vida / Lifecycle > Adicionar regra**, escolha excluir objeto e condição **idade de 7 dias**, revise e salve. A regra se aplica somente a este bucket temporário.

No Artifact Registry, configure inicialmente uma política de limpeza em **dry run** para observar o que seria removido. Preserve as imagens dos releases ativo e anterior; só ative exclusão real depois de revisar a seleção. Builds, armazenamento, logs e transferência também contam no custo. [Políticas de limpeza](https://docs.cloud.google.com/artifact-registry/docs/repositories/cleanup-policy).

**Verificação:** repositório Docker e bucket privados, com a conta de build autorizada nos dois recursos.

## 10. Configurar Cloudflare e e-mail sem Google Workspace

**Onde fazer:** navegador, [Cloudflare](https://dash.cloudflare.com/), [Resend](https://resend.com/) e sua caixa de destino. **Antes:** acesso à conta que contém o domínio. Nenhum comando de terminal nesta seção. Recebimento, resposta humana e envio automático são três configurações distintas.

Objetivo desta etapa:

- conferir o domínio `marmoteiro.com`;
- receber mensagens em `falecom@marmoteiro.com`;
- preparar `notificacoes.marmoteiro.com` no Resend;
- não contratar Google Workspace.

### 10.1 Conferir domínio e DNSSEC

1. Entre em [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Selecione sua conta.
3. Abra **Domain Registration > Manage Domains**.
4. Em `marmoteiro.com`, confirme **Auto-renew = On**.
5. Clique em **Manage > Configuration**.
6. Habilite **DNSSEC** se estiver desligado.

**Pronto quando:** domínio ativo, renovação automática ligada e DNSSEC habilitado.

### 10.2 Onde adicionar registros DNS

Quando Resend, Firebase ou outro serviço pedir um TXT/CNAME/MX:

1. abra `marmoteiro.com` na Cloudflare;
2. vá a **DNS > Records**;
3. clique em **Add record**;
4. copie exatamente os campos fornecidos pelo serviço;
5. deixe **TTL = Auto**;
6. para CNAME de validação/e-mail, use **DNS only**;
7. clique em **Save**.

| Campo | Significado |
| --- | --- |
| Type | TXT, MX, CNAME, A etc. |
| Name | Host/subdomínio; `@` representa `marmoteiro.com` |
| Content / Target | Valor fornecido pelo serviço |
| Priority | Usado em MX; copie exatamente |
| TTL | Deixe `Auto` nesta fase |

Não invente valores e não apague registro que você não reconhece.

### 10.3 Receber `falecom@marmoteiro.com`

#### Ativar Email Routing

1. Cloudflare Dashboard > sua conta.
2. Abra **Compute > Email Service > Email Routing**.
3. Clique em **Onboard Domain**.
4. Escolha `marmoteiro.com`.
5. Revise os registros que a Cloudflare adicionará.
6. Clique em **Done**.

A Cloudflare pode criar automaticamente os MX e registros de autenticação necessários. Não duplique esses registros manualmente.

#### Informar sua caixa de destino

1. Vá a **Compute > Email Service > Email Routing > Destination Addresses**.
2. Informe a caixa de e-mail que você já usa.
3. Abra o e-mail de confirmação recebido nela.
4. Clique em **Verify email address**.
5. Volte à Cloudflare e confirme que aparece como verificada.

#### Criar o endereço `falecom@`

1. Abra **Email Routing > Routing Rules**.
2. Clique em **Create routing rule**.
3. Em **Email pattern**, informe:
   ```text
   falecom
   ```
4. Selecione `marmoteiro.com`.
5. Em **Action**, escolha encaminhar para um endereço.
6. Em **Destination**, escolha sua caixa verificada.
7. Salve.

Deixe **Catch-all desligado** inicialmente.

#### Testar

Envie de outro e-mail para:

```text
falecom@marmoteiro.com
```

**Pronto quando:** a mensagem chega à sua caixa de destino.

> Email Routing só recebe/encaminha. Ele não cria webmail, IMAP ou SMTP para você enviar manualmente como `falecom@`.

### 10.4 Configurar o Resend

O sistema usará:

```text
notificacoes.marmoteiro.com
```

1. Entre no Resend.
2. Abra **Domains > Add domain**.
3. Informe `notificacoes.marmoteiro.com`.
4. Se o Resend oferecer integração automática com Cloudflare/Domain Connect, prefira essa opção.
5. Caso contrário, mantenha Resend e Cloudflare abertos lado a lado e, para cada registro mostrado:
   - Cloudflare > `marmoteiro.com` > **DNS > Records > Add record**;
   - copie Type;
   - copie Name;
   - copie Content/Target;
   - copie Priority, se existir;
   - TTL = Auto;
   - Proxy = **DNS only**, quando esse campo existir;
   - Save.
6. Volte ao Resend e execute a verificação.
7. Só conclua quando o domínio aparecer como **Verified**.

Regras importantes:

- não altere os MX da raiz `marmoteiro.com` criados pelo Email Routing;
- não crie dois TXT começando com `v=spf1` no mesmo hostname;
- copie DKIM exatamente como o Resend mostrar;
- não use proxy laranja em registro de validação/e-mail.

### 10.5 Criar a API Key do Resend

Depois de `Verified`:

1. Resend > **API Keys > Create API Key**.
2. Nome: `marmoteiro-producao-envio`.
3. Permissão: **Sending access**.
4. Restrinja ao domínio `notificacoes.marmoteiro.com`, se disponível.
5. Crie e copie a chave.
6. No Google Cloud Secret Manager, salve como:
   ```text
   marmoteiro-resend-api-key
   ```

Use o procedimento de criação da seção 8.2 com esse nome e a chave Resend como valor; guarde uma cópia no cofre pessoal. Quando habilitarmos o envio real, concederemos leitura apenas ao serviço que precisar da chave. Criá-la agora não altera o deploy da prévia e não habilita envio automático.

Nunca grave essa chave no Git ou na documentação.

Configuração prevista:

```text
From: O Tal do Marmoteiro <avisos@notificacoes.marmoteiro.com>
Reply-To: falecom@marmoteiro.com
```

### 10.6 Criar DMARC inicial

Depois que Routing e Resend estiverem funcionando:

1. Cloudflare > `marmoteiro.com` > **DNS > Records > Add record**.
2. Type: **TXT**.
3. Name:
   ```text
   _dmarc
   ```
4. Content:
   ```text
   v=DMARC1; p=none;
   ```
5. TTL: **Auto**.
6. Save.

`p=none` é somente observação. Não usar `quarantine`/`reject` antes de validar todos os remetentes.

Se já existir TXT em `_dmarc`, revise o registro existente em vez de criar outro. Este exemplo não configura relatórios DMARC nem substitui a validação dos remetentes.

### 10.7 Responder manualmente como `falecom@`

Depois de receber o teste, clicar em **Responder** no Gmail pode usar seu endereço pessoal. Email Routing não fornece SMTP de saída e Resend será usado pelo sistema para mensagens automáticas. O envio humano profissional ainda precisa de um provedor de saída/caixa postal escolhido e configurado; não está concluído pelo encaminhamento.

Quando o provedor for escolhido, obtenha dele servidor SMTP, porta, usuário e senha. No Gmail, abra **Configurações > Ver todas as configurações > Contas e importação > Enviar e-mail como > Adicionar outro endereço de e-mail**, informe `falecom@marmoteiro.com` e siga a configuração SMTP e verificação do provedor. Não invente servidor ou use a chave Resend como senha Gmail. Alguns provedores exigem outros registros DNS; preserve os MX de recebimento até homologar a solução.

**Pronto quando:** uma mensagem enviada/respondida chega a outra caixa com remetente profissional correto. Enquanto o provedor não for escolhido, registre **envio humano pendente** na ficha 17; não marque a etapa como concluída.

### 10.8 Checklist

- [ ] `marmoteiro.com` ativo
- [ ] Auto-renew ligado
- [ ] DNSSEC ativo
- [ ] Email Routing onboarded
- [ ] Destination Address verificada
- [ ] regra `falecom@` criada
- [ ] teste de recebimento passou
- [ ] Catch-all desligado
- [ ] `notificacoes.marmoteiro.com` Verified no Resend
- [ ] API key guardada no Secret Manager
- [ ] DMARC `p=none` criado
- [ ] envio humano profissional testado, ou pendência registrada
- [ ] nenhuma credencial no Git

Se algo falhar, use o runbook [domínio Cloudflare, DNS e e-mail](./dominio-cloudflare-email.md), que contém diagnóstico por problema.

## 11. Instalar e autenticar o terminal no Windows

**Onde fazer:** instalador oficial Google e PowerShell no seu computador. **Antes:** saiba o Project ID e a conta Google autorizada. `gcloud` é o programa de linha de comando que conversa com o Google Cloud. Autenticar salva credenciais locais: não compartilhe esses arquivos nem códigos de login.

1. Abra o [instalador oficial do Google Cloud CLI](https://docs.cloud.google.com/sdk/docs/install-sdk) e selecione **Windows**.
2. Baixe e execute o instalador oficial `.exe`. Siga as opções de instalação e de Python fornecidas pelo instalador; não é necessário instalar uma segunda versão de Python separadamente só para este guia.
3. Termine a instalação e abra uma **nova janela PowerShell** para atualizar o PATH, que é a lista de pastas onde o Windows procura programas.
4. Execute `gcloud version`. Se aparecerem versões dos componentes, a instalação está acessível. Se não reconhecer o comando, corrija instalação/PATH antes de seguir.
5. Execute `gcloud auth login`. O navegador abrirá: escolha a mesma conta Google autorizada no projeto e conclua o login diretamente no Google.
6. Volte ao PowerShell. Para uma configuração nova, execute as linhas abaixo **uma por vez**, substituindo `ID_REAL_DO_PROJETO` pelo ID da seção 2:

```powershell
gcloud config configurations create marmoteiro
gcloud config set project ID_REAL_DO_PROJETO
gcloud auth list
gcloud config get-value project
```

Se a configuração `marmoteiro` já existir, use `gcloud config configurations activate marmoteiro` em vez de criá-la. Escolha a mesma conta proprietária dos consoles. Os comandos de autenticação não criam um deploy nem substituem a autorização do aplicativo.

**Pronto quando:** `gcloud auth list` marca com `*` a conta correta e `gcloud config get-value project` mostra o Project ID real. `ID_REAL_DO_PROJETO` é um marcador para substituir; não é o nome literal que deve aparecer no resultado.

**Depois de concluir os pré-requisitos, você pode voltar ao chat e pedir o deploy.** Confirme Blaze/faturamento, banco e segredos na ficha da seção 17; os próximos blocos documentam a execução técnica completa. Não é necessário você executá-los manualmente se preferir que o Codex continue.

## 12. Construir as imagens remotas

**Onde fazer:** PowerShell local, na pasta do repositório. **Antes:** seções 3 e 5–11 concluídas, versão integrada e validada conforme Git Flow, sem alterações locais alheias ao build. Esta etapa envia código ao Google e executa um build faturável. Não exige Docker local: o Cloud Build constrói as imagens remotamente.

### 12.1 Entrar na pasta e definir os identificadores

O caminho abaixo corresponde ao workspace atual do Windows. Se seu checkout estiver em outro local, ajuste apenas o caminho. Substitua o Project ID pelo seu; os outros nomes devem corresponder aos recursos que criou. Execute as configurações e depois cada comando de conferência separadamente.

```powershell
Set-Location -LiteralPath 'C:\Users\William\Documents\ChatGPT\O tal do marmoteiro - site'
$env:MARMOTEIRO_PROJECT = 'ID_REAL_DO_PROJETO'
$env:MARMOTEIRO_REGION = 'southamerica-east1'
$env:MARMOTEIRO_REPOSITORY = 'marmoteiro'
$env:MARMOTEIRO_RELEASE = 'preview-' + [DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')
$env:MARMOTEIRO_SOURCE_BUCKET = "${env:MARMOTEIRO_PROJECT}-build-source"
$env:MARMOTEIRO_IMAGES = "${env:MARMOTEIRO_REGION}-docker.pkg.dev/${env:MARMOTEIRO_PROJECT}/${env:MARMOTEIRO_REPOSITORY}"
```

Anote a tag gerada, exibindo `$env:MARMOTEIRO_RELEASE` no terminal. Ela não é segredo e identifica este build. Ao retomar um build existente em outra janela, atribua a tag anotada a essa variável, em vez de gerar outra.

```powershell
gcloud projects describe "$env:MARMOTEIRO_PROJECT" --format='value(projectId)'
git status --short
git rev-parse HEAD
gcloud meta list-files-for-upload
```

Ajuste região/bucket se escolheu outros. Confirme que nenhum `.env`, chave privada ou dependência local está no upload. A lista contém nomes de arquivos, não seus conteúdos. Revise o release local e os resultados de CI/testes antes de construir.

**Confira antes de continuar:** Project ID correto; `git status --short` sem mudanças locais; SHA correspondente à versão aprovada; lista de upload sem credenciais. Anote o SHA na ficha 17.

### 12.2 Enviar o código e construir

Execute o bloco seguinte na mesma janela. O comando pode levar alguns minutos; espere sua conclusão. Se falhar, veja o erro e os logs e não execute o deploy.

```powershell
gcloud builds submit . --project="${env:MARMOTEIRO_PROJECT}" `
  --region="${env:MARMOTEIRO_REGION}" `
  --service-account="projects/${env:MARMOTEIRO_PROJECT}/serviceAccounts/marmoteiro-build@${env:MARMOTEIRO_PROJECT}.iam.gserviceaccount.com" `
  --gcs-source-staging-dir="gs://${env:MARMOTEIRO_SOURCE_BUCKET}/source" `
  --config=infra/cloudbuild-api.yaml `
  --substitutions="_REGION=${env:MARMOTEIRO_REGION},_REPOSITORY=${env:MARMOTEIRO_REPOSITORY},_RELEASE=${env:MARMOTEIRO_RELEASE}"
```

O YAML do repositório constrói `api`, `web` e `migrate`, com logs no Cloud Logging. Confira **Cloud Build > History > SUCCESS** e três imagens/tag no Artifact Registry. A API de build não precisa acessar as senhas do banco durante essa etapa. [Comando de build](https://docs.cloud.google.com/sdk/gcloud/reference/builds/submit).

## 13. Aplicar migrações e publicar

**Onde fazer:** mesma janela PowerShell da seção 12, na pasta do repositório. **Antes:** build com `SUCCESS`, três imagens na tag anotada e versões dos segredos habilitadas. Aqui você altera o banco e publica serviços acessíveis pela internet; não é só preparação de conta.

Os comandos abaixo usam a versão `1` dos segredos. Se você criou outras versões, ajuste explicitamente. O nome dos recursos é o da etapa 8.

### 13.1 Criar e executar o job de migração

Um **job** é uma tarefa que termina depois de executar. O primeiro comando cria/atualiza a tarefa de migração; o segundo realmente a executa no banco. Execute um por vez. Se houver dados reais, prepare backup/restauração antes da execução.

```powershell
gcloud run jobs deploy marmoteiro-migrate --project="${env:MARMOTEIRO_PROJECT}" `
  --region="${env:MARMOTEIRO_REGION}" --image="${env:MARMOTEIRO_IMAGES}/migrate:${env:MARMOTEIRO_RELEASE}" `
  --service-account="marmoteiro-migrate@${env:MARMOTEIRO_PROJECT}.iam.gserviceaccount.com" `
  --tasks=1 --parallelism=1 --max-retries=0 --task-timeout=300s `
  --cpu=1 --memory=1Gi `
  --set-secrets='DIRECT_DATABASE_URL=marmoteiro-database-direct-url:1'
```

Depois que o job estiver criado, execute:

```powershell
gcloud run jobs execute marmoteiro-migrate --project="${env:MARMOTEIRO_PROJECT}" `
  --region="${env:MARMOTEIRO_REGION}" --wait
```

Se o banco já possuir dados reais, prepare backup/restauração antes dessa execução. O resultado esperado é migrações aplicadas ou ausência de migrações pendentes. Não seguir em caso de falha.

### 13.2 Publicar a API

Depois da migração bem-sucedida, execute o deploy da API abaixo. Espere terminar; somente depois execute a atribuição da URL. A URL obtida é pública e pode ser anotada, sem senha.

```powershell
gcloud run deploy marmoteiro-api --project="${env:MARMOTEIRO_PROJECT}" `
  --region="${env:MARMOTEIRO_REGION}" --image="${env:MARMOTEIRO_IMAGES}/api:${env:MARMOTEIRO_RELEASE}" `
  --service-account="marmoteiro-api@${env:MARMOTEIRO_PROJECT}.iam.gserviceaccount.com" `
  --allow-unauthenticated --port=8080 --cpu=1 --memory=512Mi `
  --min-instances=0 --max-instances=2 --concurrency=4 --timeout=300 --cpu-throttling `
  --set-env-vars='NODE_ENV=production,HOST=0.0.0.0,DATABASE_POOL_MAX=3,COMMUNICATIONS_ENABLED=false,OUTBOX_RUNNER=scheduled' `
  --set-secrets='DATABASE_URL=marmoteiro-database-url:1,ADMIN_API_SECRET=marmoteiro-admin-api-secret:1'
```

Após o deploy bem-sucedido, capture e confira a URL:

```powershell
$env:MARMOTEIRO_API_URL = gcloud run services describe marmoteiro-api --project="$env:MARMOTEIRO_PROJECT" --region="$env:MARMOTEIRO_REGION" --format='value(status.url)'
if ($LASTEXITCODE -ne 0 -or $env:MARMOTEIRO_API_URL -notmatch '^https://') { throw 'Não foi possível obter a URL da API.' }
$env:MARMOTEIRO_API_URL
```

O acesso HTTP público é necessário no desenho atual; os endpoints administrativos continuam protegidos pelos guards da aplicação, segredo interno e sessão. Essa opção não cria login público de administrador. Uma política corporativa que proíba `allUsers` exige adaptar autenticação IAM entre serviços; não remover guards para contorná-la.

### 13.3 Publicar o site e configurar sua origem

Depois de a API estar pronta, publique a web. Execute o deploy, a captura da URL e a atualização de origem separadamente, conferindo o resultado de cada comando. A variável de URL precisa conter o endereço retornado pelo Google, não uma mensagem de erro.

```powershell
gcloud run deploy marmoteiro-web --project="${env:MARMOTEIRO_PROJECT}" `
  --region="${env:MARMOTEIRO_REGION}" --image="${env:MARMOTEIRO_IMAGES}/web:${env:MARMOTEIRO_RELEASE}" `
  --service-account="marmoteiro-web@${env:MARMOTEIRO_PROJECT}.iam.gserviceaccount.com" `
  --allow-unauthenticated --port=8080 --cpu=1 --memory=512Mi `
  --min-instances=0 --max-instances=2 --concurrency=40 --timeout=60 --cpu-throttling `
  --set-env-vars="NODE_ENV=production,HOSTNAME=0.0.0.0,ADMIN_API_URL=${env:MARMOTEIRO_API_URL},APP_ORIGIN=https://invalid.example,TRUST_PROXY_HEADERS=false" `
  --set-secrets='ADMIN_API_SECRET=marmoteiro-admin-api-secret:1'
```

Após o deploy bem-sucedido, capture e confira a URL:

```powershell
$env:MARMOTEIRO_WEB_ORIGIN = gcloud run services describe marmoteiro-web --project="$env:MARMOTEIRO_PROJECT" --region="$env:MARMOTEIRO_REGION" --format='value(status.url)'
if ($LASTEXITCODE -ne 0 -or $env:MARMOTEIRO_WEB_ORIGIN -notmatch '^https://') { throw 'Não foi possível obter a URL da web.' }
$env:MARMOTEIRO_WEB_ORIGIN
```

Agora aplique a origem real, na mesma janela:

```powershell
gcloud run services update marmoteiro-web --project="${env:MARMOTEIRO_PROJECT}" `
  --region="${env:MARMOTEIRO_REGION}" --update-env-vars="APP_ORIGIN=${env:MARMOTEIRO_WEB_ORIGIN}"
```

`https://invalid.example` é um valor temporário que mantém o login bloqueado até conhecermos a URL real. A atualização seguinte é obrigatória antes de testar o painel. Confira no Cloud Run: duas instâncias máximas por serviço, mínimo zero, cobrança por requisição, segredos associados e URL da web funcionando. A API não fica consultando continuamente o banco para manter-se acordada.

**Pronto quando:** no navegador, **Google Cloud > Cloud Run**, o job tem execução bem-sucedida e `marmoteiro-api`/`marmoteiro-web` mostram revisão pronta. Abra a URL de `marmoteiro-web`; ela deve carregar. A senha administrativa será criada na seção 14. Esta publicação é uma prévia e não habilita operação comercial.

## 14. Criar o administrador remoto e validar

**Onde fazer:** PowerShell local interativo, na raiz do repositório; depois navegador para testar. **Antes:** migrações aplicadas, serviços prontos, `MARMOTEIRO_PROJECT` definido e seu usuário Google com acesso ao segredo direto. A conta administrativa local não é copiada para o Neon e criar usuário no Firebase não cria administrador.

### 14.1 Preparar o CLI administrativo local

Confira `node --version` e `npm.cmd --version`. O projeto usa Node 22 no CI. Na raiz do repositório, execute cada comando abaixo separadamente e aguarde sucesso antes do próximo. Eles preparam dependências e cliente Prisma local; não aplicam migrações remotas.

```powershell
npm.cmd ci --ignore-scripts
npm.cmd run prisma:generate --workspace @marmoteiro/api
```

### 14.2 Criar a conta no banco remoto

No bloco abaixo, substitua `SEU_EMAIL_ADMIN` e `SEU_NOME` pelo e-mail e nome que utilizará no painel. Esse login administrativo é distinto da sua conta Google de console. Ajuste a versão `1` se sua conexão direta estiver em outra versão.

Copie e execute o bloco inteiro. Ele busca a URL sem imprimi-la, disponibiliza-a ao processo administrativo e restaura o ambiente local ao terminar, inclusive em caso de erro. Não execute a linha de leitura do segredo isoladamente sem atribuição, pois isso imprimiria a URL.

```powershell
if (-not $env:MARMOTEIRO_PROJECT) { throw 'Defina o projeto conforme a seção 12.1.' }
$marmoteiroPreviousDatabaseUrl = $env:DATABASE_URL
$marmoteiroRemoteDatabaseUrl = $null
try {
    $marmoteiroRemoteDatabaseUrl = gcloud secrets versions access 1 --secret=marmoteiro-database-direct-url --project="$env:MARMOTEIRO_PROJECT"
    if ($LASTEXITCODE -ne 0) { throw 'Não foi possível acessar o segredo direto.' }
    $marmoteiroRemoteDatabaseUrl = ($marmoteiroRemoteDatabaseUrl -join "`n").Trim()
    if ($marmoteiroRemoteDatabaseUrl -notmatch '^postgres(ql)?://') { throw 'O segredo não contém uma URL PostgreSQL.' }
    $env:DATABASE_URL = $marmoteiroRemoteDatabaseUrl
    npm.cmd run admin:create -- --email 'SEU_EMAIL_ADMIN' --name 'SEU_NOME'
    if ($LASTEXITCODE -ne 0) { throw 'A criação do administrador falhou. Confira a mensagem acima.' }
} finally {
    $env:DATABASE_URL = $marmoteiroPreviousDatabaseUrl
    Remove-Variable marmoteiroRemoteDatabaseUrl, marmoteiroPreviousDatabaseUrl -ErrorAction SilentlyContinue
}
```

Quando aparecer **Senha (15 a 128 caracteres; entrada oculta)**, digite a senha escolhida e pressione Enter. Os caracteres não aparecem: isso é esperado. Repita na confirmação. Guarde a senha no cofre pessoal. Ela não deve ser passada como argumento, variável ou mensagem no chat. O bloco não altera o arquivo `.env` local.

**Pronto quando:** aparecer `Operação concluída: create` com seu e-mail. Se a conta remota já existir e você precisar redefinir a senha, use o mesmo bloco trocando somente `admin:create` por `admin:password` e mantendo o e-mail da conta existente. Não exclua a conta para contornar o aviso; a redefinição revoga as sessões anteriores.

### 14.3 Conferir o acesso no navegador

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

**Onde fazer:** navegador, nos painéis Google Calendar, Google Cloud e Meta. **Antes:** contas escolhidas e acesso ao e-mail de suporte. Esta seção prepara recursos; a integração no código ainda está pendente. Pode registrar pendências e seguir com a prévia: não há callback ou webhook homologado para preencher por suposição.

### Google Calendar/Meet

Usar sua **conta Google pessoal**, sem contratar Workspace. O Google One documenta recursos premium de Calendar/Meet para planos AI elegíveis com 2 TB ou mais, inclusive no Brasil: reuniões mais longas, gravação e funcionalidades de agenda. Confira o que está efetivamente habilitado na conta organizadora da oferta estudantil. A expressão “Workspace premium features” nessa página não exige comprar uma assinatura empresarial separada. [Benefícios de Calendar/Meet](https://support.google.com/googleone/answer/12351029?hl=en).

Ter gravação disponível não autoriza gravar uma consulta: preservar consentimento separado, retenção ordinária de até 90 dias e legal hold. Armazenamento Google One não substitui automaticamente a política de arquivos do sistema. Páginas de agendamento do Google também não substituem checkout, confirmação de pagamento e regras do projeto.

1. Escolha a conta Google que será dona da agenda profissional; preferir a titular dos benefícios que pretende usar. Ela pode diferir da conta de faturamento.
2. No [Google Calendar](https://calendar.google.com/), crie uma agenda `Consultas - O Tal do Marmoteiro`, com fuso `America/Sao_Paulo`, sem publicação pública.
   No navegador do computador, clique na engrenagem **Configurações > Adicionar agenda > Criar nova agenda**. Preencha o nome e fuso e clique em **Criar agenda**. Em **Permissões de acesso**, mantenha desmarcada a disponibilização pública.
3. Em **Configurações da agenda > Integrar agenda**, anote o ID. Não compartilhe links secretos iCal nem conteúdo da agenda pessoal.
4. No projeto Google Cloud, habilite **Google Calendar API** (`calendar-json.googleapis.com`).
5. Na área **Google Auth Platform**, prepare Branding/nome do aplicativo, e-mail de suporte e contato do desenvolvedor. Para teste com a conta pessoal, use audiência **External** e seu usuário como testador; não escolher Internal, que pressupõe organização compatível.
   No Google Cloud, pesquise **Google Auth Platform**. Se aparecer **Começar / Get started**, siga o assistente; se já estiver configurado, confira **Branding** e **Audience / Público-alvo**. Use um e-mail já funcional para contatos, sem presumir que `falecom@` já recebe mensagens. Não adicione escopos amplos nem crie cliente OAuth antes da definição do callback.
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

**Pronto nesta fase quando:** agenda privada criada, ID anotado e ativos de teste Meta identificados, ou suas pendências registradas. **Ainda pendente para integração:** callbacks/webhooks reais, autorização OAuth, tokens de produção, templates aprovados e testes. Não há um valor secreto pronto para todos esses campos antes da implementação.

## 16. Domínio na Cloudflare e conexão com a hospedagem

**Onde fazer:** navegador, [Cloudflare](https://dash.cloudflare.com/) e o painel da frente HTTPS que será homologada. **Antes da conexão final:** prévia `run.app` validada nas seções 12–14. A conferência do registro em 16.1 pode ser feita agora, sem deploy.

### 16.1 Conferir o domínio que você já registrou

1. No [painel Cloudflare](https://dash.cloudflare.com/), selecione `marmoteiro.com` e confira o estado da zona e do registro.
2. Confira verificação do e-mail do registrante, vencimento e renovação. Use um endereço de acesso já funcional enquanto `falecom@marmoteiro.com` estiver em preparação.
3. Abra **DNS > Records** e revise os registros existentes. Guarde uma cópia antes de alterações de hospedagem/e-mail; não remover registros por parecerem antigos.
4. Mantenha os nameservers Cloudflare. Domínios registrados no Cloudflare Registrar já usam seus nameservers; para hospedar no Google basta configurar os registros adequados, sem transferir o domínio. [Registrar](https://developers.cloudflare.com/registrar/get-started/register-domain/), [nameservers](https://developers.cloudflare.com/dns/nameservers/update-nameservers/).

### 16.2 Publicar primeiro e definir a frente HTTPS

Esta subseção explica uma **decisão pendente**, não pede que você compre ou ative uma das alternativas agora. Mantenha a URL `run.app` para testar a prévia. A frente HTTPS é o serviço que reconhecerá `marmoteiro.com` e fornecerá certificado válido antes de encaminhar pedidos ao Cloud Run.

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

**Onde fazer:** preencha a ficha abaixo numa nota sem segredos e cole no chat quando precisar de ajuda ou estiver pronto para solicitar o deploy. Use `pendente` onde não concluiu algo. Isto evita repetir recursos ou confundir preparação com publicação.

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
gcloud autenticado neste Windows/PowerShell: sim/não
SHA do código validado / tag do build concluído:
Job de migração bem-sucedido: sim/não/pendente
URLs run.app da API e web (sem credenciais):
Administrador remoto criado / login e logout testados: sim/não/pendente
Domínio Resend / status Verified:
Domínio registrado na Cloudflare / zona ativa: sim/não
Email Routing configurado / recebimento testado: sim/não
Provedor de envio humano / resposta com remetente profissional testada:
Frente HTTPS escolhida / domínio conectado / URL canônica:
```

Não enviar URLs completas de banco, senha de login, API key Resend, client secret Google, refresh token, token WhatsApp, chave JSON privada ou códigos de autenticação. A configuração pública do SDK Firebase pode ser compartilhada; os segredos serão acessados pelos recursos autorizados no ambiente.

## 18. Problemas comuns

**Onde fazer:** use a tabela para voltar ao painel ou comando correspondente. Compartilhe somente o texto do erro sem valores confidenciais; não envie captura de tela com o campo de valor dos segredos aberto. Um erro de permissão deve ser corrigido no recurso indicado, sem repetir todos os cadastros.

| Sintoma | Verificar |
| --- | --- |
| `gcloud: command not found` | Instalação/PATH; abrir novo Terminal |
| `gcloud` ou `node` não é reconhecido no PowerShell | Instale o programa oficial, abra nova janela e confira `gcloud version` ou `node --version` |
| `npm.ps1` não pode ser carregado | Use `npm.cmd` nos comandos Windows deste guia; não é necessário desativar globalmente a política de execução |
| `export`, `pbcopy` ou continuação com `\` não funciona | Bloco antigo de Mac/Bash; use os blocos PowerShell deste guia |
| Variáveis vazias depois de reabrir o terminal | Repita 12.1 e restaure a tag anotada do build existente |
| Segredo já existe | Abra o recurso e confira a versão; não crie versão extra só para repetir o cadastro |
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
| Resposta mostra Gmail pessoal | Encaminhamento não configura envio; validar SMTP/remetente profissional na etapa 10.7 |
| Domínio abre erro ou login não mantém sessão | Hostname/certificado da origem, frente HTTPS, cache/cookies e `APP_ORIGIN`; CNAME sozinho não basta |
| Agenda para após alguns dias | Estado Testing/expiração OAuth, consentimento ou token revogado |

Não solucionar erro abrindo o banco, concedendo Owner a todos, removendo guards ou gravando senha em código. Registre o erro sem conteúdo secreto e corrija a permissão/configuração específica.
