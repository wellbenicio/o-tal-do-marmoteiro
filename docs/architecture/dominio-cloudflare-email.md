# Domínio Cloudflare, DNS, e-mail e Firebase/Google Cloud

Atualizado em 28/09/2026. Este documento é a referência operacional para o domínio `marmoteiro.com` e para a relação entre Cloudflare, Firebase e Google Cloud. Foi escrito assumindo que quem executa a configuração **não conhece previamente o painel da Cloudflare**.

## 1. Decisões já tomadas

| Item | Decisão |
| --- | --- |
| Domínio | `marmoteiro.com` |
| Registrador | Cloudflare Registrar |
| DNS autoritativo | Cloudflare DNS |
| Google Workspace | Não contratar nesta fase |
| Firebase atual | Spark |
| Identidade futura de clientes | Firebase Authentication |
| Execução da aplicação | Cloud Run, quando houver billing |
| Banco | Neon PostgreSQL |
| E-mail transacional | Resend em `notificacoes.marmoteiro.com` |
| Entrada do e-mail oficial | Cloudflare Email Routing para `falecom@marmoteiro.com` |
| Caixa postal humana completa | Só contratar se houver necessidade de enviar/responder manualmente como `falecom@` |
| Benefício Google | Google AI Pro + Google Developer Program Premium, quando corretamente vinculados |

Cloudflare Registrar exige que o domínio use nameservers da própria Cloudflare. Não tentar mover a zona para outro provedor de DNS enquanto o registro permanecer na Cloudflare. Fonte: [Cloudflare Registrar](https://developers.cloudflare.com/registrar/get-started/register-domain/).

## 2. Primeiros passos dentro da Cloudflare

### 2.1 Como se localizar no painel

1. Acesse [dash.cloudflare.com](https://dash.cloudflare.com/) e faça login.
2. Se a Cloudflare mostrar mais de uma conta, selecione a conta onde `marmoteiro.com` foi registrado.
3. Existem duas áreas que você usará bastante:
   - **Domain Registration > Manage Domains**: registro, renovação e DNSSEC do domínio;
   - selecione `marmoteiro.com` e depois **DNS > Records**: registros técnicos do domínio.
4. Para e-mail, a navegação atual é:
   - **Compute > Email Service > Email Routing**.

Use a busca do painel se algum item mudar de posição. Os nomes acima correspondem à documentação oficial consultada em 28/09/2026.

### 2.2 Conferir renovação

1. Abra **Domain Registration > Manage Domains**.
2. Localize `marmoteiro.com`.
3. Confira se **Auto-renew** está ligado.
4. Clique em **Manage** se quiser ver detalhes de renovação.

Cloudflare Registrar liga auto-renew por padrão e tenta renovar antes do vencimento. Ainda assim, mantenha a forma de pagamento válida e acompanhe os avisos enviados por e-mail.

### 2.3 Habilitar DNSSEC

Como o domínio está no próprio Cloudflare Registrar:

1. **Domain Registration > Manage Domains**.
2. Em `marmoteiro.com`, clique em **Manage**.
3. Abra **Configuration**.
4. Clique em **Enable DNSSEC**.
5. Depois, para conferir o resultado, abra o domínio e vá a **DNS > Settings**; procure **DNSSEC**.

No Cloudflare Registrar a ativação é integrada; você não precisa copiar DS record para outro registrador.

### 2.4 Onde criar um registro DNS

Sempre que Resend, Firebase ou outro serviço pedir um TXT/CNAME/MX:

1. selecione `marmoteiro.com`;
2. abra **DNS > Records**;
3. clique em **Add record**;
4. escolha o **Type**;
5. copie **Name**, **Content/Target** e **Priority** exatamente do provedor;
6. mantenha **TTL = Auto**, salvo instrução contrária;
7. em registros CNAME/A/AAAA relacionados a validação de e-mail, use **DNS only** quando o campo de proxy aparecer;
8. clique em **Save**.

### 2.5 O que significa cada campo

| Campo | Explicação simples |
| --- | --- |
| Type | Qual tipo de informação DNS está sendo criada |
| Name | Para qual endereço/subdomínio vale o registro |
| Content / Target | Para onde aponta ou qual valor deve ser publicado |
| Priority | Ordem usada por registros MX |
| TTL | Tempo de cache do DNS; `Auto` serve para esta configuração |
| Proxy status | Se a Cloudflare ficará no meio do tráfego HTTP; e-mail/validação normalmente usa DNS only |

`@` representa a raiz do domínio, isto é, `marmoteiro.com`. Não confunda raiz com `www` ou `notificacoes`.

### 2.6 Regras de segurança

- habilite 2FA na conta Cloudflare;
- não crie Global API Key para automações; prefira token com escopo mínimo;
- não apague registros DNS que você não reconhece antes de descobrir a origem;
- nunca coloque senha, API key ou token dentro de TXT;
- CNAME de validação/e-mail não deve ser proxied pelo ícone laranja;
- MX e TXT não usam o proxy HTTP da Cloudflare.

## 3. Firebase Spark e o momento correto de ir para Blaze

### O que pode continuar no Spark

Enquanto o projeto estiver em preparação, o Spark é adequado para:

- registrar o aplicativo web;
- configurar Firebase Authentication;
- testar e-mail/senha dentro dos limites do plano;
- usar emuladores/desenvolvimento local;
- manter o projeto sem uma conta de faturamento vinculada.

A documentação vigente informa que projetos Spark não têm acesso aos produtos pagos do Google Cloud, incluindo Cloud Run, Cloud Build, Artifact Registry e Secret Manager. Fonte: [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans).

### Quando Blaze passa a ser obrigatório

Antes do primeiro deploy da arquitetura atual:

1. abra o projeto no Google Cloud Console;
2. vincule uma **Cloud Billing Account**;
3. confirme que o mesmo Project ID aparece no Firebase Console;
4. volte ao Firebase e confirme a mudança para **Blaze**;
5. crie orçamento e alertas antes de implantar Cloud Run.

Associar billing ao projeto Google Cloud converte automaticamente o Firebase de Spark para Blaze. Não é necessário migrar usuários nem criar outro projeto. Fonte: [Understand Firebase projects](https://firebase.google.com/docs/projects/learn-more).

O Blaze é pagamento por uso; não existe uma assinatura fixa apenas por mudar de plano. O risco financeiro vem do consumo dos serviços habilitados.

## 4. Google AI Pro e Google Developer Program

A conta do responsável participa do programa estudantil e possui Google AI Pro. Segundo a documentação oficial consultada em 28/09/2026, quando a assinatura Google AI Pro está vinculada ao Perfil de Desenvolvedor, ela inclui o Google Developer Program Premium com:

- US$ 10/mês em créditos Google Cloud;
- cotas maiores do Gemini Code Assist;
- até 30 workspaces do Firebase Studio;
- benefícios adicionais do programa.

Fontes:

- [Google AI Pro — benefícios](https://support.google.com/googleone/answer/14534406?hl=pt-BR)
- [Google Developer Program — planos e preços](https://developers.google.com/program/plans-and-pricing?hl=pt-br)

### Checklist do benefício

1. Abra seu Perfil de Desenvolvedor Google.
2. Confirme que a assinatura aparece como **Premium**.
3. Confirme que o Google AI Pro está vinculado ao mesmo perfil.
4. Verifique a área de benefícios/créditos.
5. Só inclua os US$ 10/mês no planejamento depois que o crédito estiver efetivamente disponível.
6. Após vincular Cloud Billing ao projeto Marmoteiro, confira em Billing/Reports se o crédito está sendo aplicado à conta/projeto elegível.

**Não confundir:**

- crédito Google Cloud do Developer Program;
- créditos de IA usados por Flow/Antigravity/outros produtos;
- franquias sem custo de Cloud Run/Firebase.

São mecanismos diferentes.

## 5. Topologia recomendada para o site

### Fase A — primeira publicação

Publicar primeiro:

- `marmoteiro-web` no Cloud Run;
- `marmoteiro-api` no Cloud Run;
- região planejada: `southamerica-east1`;
- acesso de avaliação pela URL `run.app`.

Validar banco, login, cookies, headers e rollback antes de ligar o domínio comercial.

### Fase B — domínio `marmoteiro.com`

Existem três caminhos oficiais para domínio customizado no Cloud Run:

1. Global External Application Load Balancer — opção recomendada pelo Google para produção;
2. Cloud Run domain mapping — Preview e disponibilidade regional limitada;
3. Firebase Hosting na frente do Cloud Run.

Fonte: [Cloud Run custom domains](https://docs.cloud.google.com/run/docs/mapping-custom-domains).

Para este projeto, **não usar Cloud Run domain mapping nativo**, porque:

- continua em Preview;
- o Google não o recomenda para produção;
- `southamerica-east1` não está na lista de regiões disponíveis para esse mapeamento.

### Candidato de menor custo: Firebase Hosting -> Cloud Run

Firebase Hosting aceita rewrite para Cloud Run em `southamerica-east1` e fornece domínio customizado/CDN/certificado. Fonte: [Hosting + Cloud Run](https://firebase.google.com/docs/hosting/cloud-run).

Porém existe um bloqueio de compatibilidade no código atual: Firebase Hosting remove cookies em requests dinâmicos, exceto o cookie chamado `__session`. O login administrativo atualmente usa `__Host-marmoteiro-admin`.

Fonte: [Firebase Hosting — cookies](https://firebase.google.com/docs/hosting/manage-cache#using_cookies).

**Portanto, não apontar o domínio de produção para Firebase Hosting até implementar e testar uma estratégia de sessão compatível.**

### Alteração de código necessária antes do Hosting

A implementação deve:

1. usar `__session` para a sessão que precisa atravessar Firebase Hosting, ou adotar outro mecanismo server-side compatível;
2. preservar `Secure`, `HttpOnly` e a política `SameSite` adequada;
3. manter validação de origem/CSRF;
4. impedir cache público de respostas autenticadas;
5. testar login, navegação interna, logout, expiração e revogação pela URL `web.app` antes do domínio real.

## 6. Configuração do Firebase Hosting após homologar a sessão

Criar na raiz um `firebase.json` equivalente a:

```json
{
  "hosting": {
    "public": "firebase-public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "run": {
          "serviceId": "marmoteiro-web",
          "region": "southamerica-east1"
        }
      }
    ]
  }
}
```

A pasta `firebase-public` pode conter apenas um marcador estático, pois o conteúdo dinâmico será servido pelo Cloud Run. Validar a configuração no ambiente real antes de versionar como decisão definitiva.

Com a Firebase CLI autenticada:

```sh
firebase use ID_REAL_DO_PROJETO
firebase deploy --only hosting
```

Teste primeiro:

- `https://ID_DO_PROJETO.web.app`
- `https://ID_DO_PROJETO.firebaseapp.com`

Somente depois conecte o domínio.

## 7. Ligar `marmoteiro.com` ao Firebase Hosting usando Cloudflare DNS

No Firebase Console:

1. Abra **Hosting**.
2. Clique em **Add custom domain**.
3. Informe `marmoteiro.com`.
4. Escolha o domínio raiz como canônico.
5. Se quiser `www`, configure-o para redirecionar ao domínio raiz.
6. O wizard fornecerá um registro TXT de verificação e os registros de apontamento.

Na Cloudflare:

1. Vá para **DNS > Records**.
2. Crie o TXT exatamente como fornecido pelo Firebase.
3. Crie A/CNAME exatamente como fornecidos pelo Firebase.
4. Durante a verificação e emissão do certificado, mantenha os registros web do Firebase como **DNS only**.
5. Não invente endereços IP nem reutilize valor copiado de tutorial antigo; o wizard é a fonte do valor atual.
6. Aguarde o Firebase indicar domínio e certificado como ativos.

A documentação oficial mostra Cloudflare como provedor suportado no fluxo de custom domain. Fonte: [Firebase Hosting custom domain](https://firebase.google.com/docs/hosting/custom-domain).

### Por que manter DNS only inicialmente

O Firebase Hosting já entrega CDN e TLS. Colocar o proxy laranja da Cloudflare na frente adiciona outra camada de cache/TLS/headers sem benefício obrigatório nesta fase e aumenta a quantidade de pontos a diagnosticar.

Depois de estabilizar produção, proxy Cloudflare pode ser avaliado em uma ADR específica.

## 8. Ajustes obrigatórios após ativar o domínio

Atualizar Cloud Run/web:

```text
APP_ORIGIN=https://marmoteiro.com
```

Atualizar também:

- Firebase Authentication > Authorized domains:
  - `marmoteiro.com`
  - `www.marmoteiro.com`, somente se usuários realmente acessarem esse hostname;
- OAuth redirect/callback URIs;
- webhooks cujo provedor valide host/origem;
- links absolutos em e-mails;
- CORS/origin checks;
- documentação/handoff.

Testar:

- login e logout;
- cookie;
- páginas protegidas;
- navegação direta por URL;
- `www` -> raiz;
- HTTP -> HTTPS;
- 404;
- assets;
- chamadas web -> API;
- ausência de cache de conteúdo autenticado.

## 9. Configurar o e-mail oficial sem Google Workspace

O endereço funcional definido é:

```text
falecom@marmoteiro.com
```

A arquitetura é:

```text
ENTRADA HUMANA
falecom@marmoteiro.com
        |
        v
Cloudflare Email Routing
        |
        v
sua caixa pessoal existente

ENVIO AUTOMÁTICO DO SISTEMA
API do Marmoteiro
        |
        v
Resend
        |
        v
avisos@notificacoes.marmoteiro.com
```

Google Workspace não participa dessa arquitetura.

### 9.1 Ativar Email Routing no domínio

1. Entre no Cloudflare Dashboard e selecione sua conta.
2. Abra **Compute > Email Service > Email Routing**.
3. Clique em **Onboard Domain**.
4. Escolha `marmoteiro.com`.
5. A Cloudflare mostrará os registros de DNS necessários para receber/autenticar mensagens, incluindo MX e registros TXT de autenticação conforme a configuração.
6. Conclua em **Done**.

Como o DNS está na própria Cloudflare, o onboarding pode aplicar esses registros diretamente. Depois, você pode conferir em `marmoteiro.com > DNS > Records`.

Se a Cloudflare disser que existem MX ou SPF conflitantes, **pare e identifique esses registros antes de excluir**. Um domínio não deve receber e-mail simultaneamente por dois conjuntos concorrentes de MX sem planejamento.

### 9.2 Adicionar a caixa para onde as mensagens serão encaminhadas

A Cloudflare chama essa caixa real de **Destination Address**.

1. Abra **Compute > Email Service > Email Routing > Destination Addresses**.
2. Digite o endereço que você já usa e deseja acompanhar.
3. Envie.
4. Abra essa caixa.
5. Localize a mensagem da Cloudflare.
6. Clique em **Verify email address**.
7. Volte ao painel e confirme que o destino está verificado.

Sem essa confirmação, a Cloudflare não mantém ativa uma regra que encaminhe mensagens para esse destino.

### 9.3 Criar `falecom@marmoteiro.com`

1. Abra **Compute > Email Service > Email Routing > Routing Rules**.
2. Clique em **Create routing rule**.
3. Em **Email pattern**, preencha:
   ```text
   falecom
   ```
4. Confirme o domínio `marmoteiro.com`.
5. Em **Action**, escolha enviar/encaminhar para um endereço.
6. Em **Destination**, selecione o endereço verificado.
7. Salve.

A Cloudflare monta o endereço completo `falecom@marmoteiro.com`; você não precisa digitar `@marmoteiro.com` no campo de padrão se a tela já mostra o domínio ao lado.

### 9.4 Não habilitar catch-all agora

Catch-all aceitaria qualquer endereço inexistente, por exemplo:

```text
asdf@marmoteiro.com
teste123@marmoteiro.com
qualquercoisa@marmoteiro.com
```

Isso aumenta ruído e spam. Deixe desativado até existir uma necessidade real.

### 9.5 Teste do recebimento

Use uma conta externa e envie:

```text
Para: falecom@marmoteiro.com
Assunto: teste Cloudflare
```

Resultado esperado:

1. a mensagem entra na Cloudflare;
2. a routing rule identifica `falecom@`;
3. a Cloudflare encaminha;
4. sua caixa de destino recebe.

Se não chegar após alguns minutos, verifique:

- Destination Address = Verified;
- Routing Rule = Enabled;
- domínio onboarded no Email Routing;
- MX/TXT do Email Routing presentes em **DNS > Records**.

A documentação da Cloudflare informa que DNS pode levar até 24 horas para propagação global, embora alterações em zonas Cloudflare normalmente apareçam bem antes disso.

### 9.6 Limitação importante

Email Routing **não é uma caixa postal**. Ele não entrega:

- webmail;
- IMAP;
- SMTP;
- senha de `falecom@`;
- envio manual autenticado como `falecom@`.

Ele resolve o recebimento. Se você responder diretamente pela caixa pessoal, o remetente visível pode ser sua caixa pessoal.

## 10. Configurar e-mails automáticos no Resend

Domínio de envio:

```text
notificacoes.marmoteiro.com
```

O sistema usará algo como:

```text
From: O Tal do Marmoteiro <avisos@notificacoes.marmoteiro.com>
Reply-To: falecom@marmoteiro.com
```

### 10.1 Adicionar o subdomínio

1. Entre no Resend.
2. Abra **Domains**.
3. Clique em **Add domain**.
4. Digite:
   ```text
   notificacoes.marmoteiro.com
   ```
5. Continue.

O Resend atualmente detecta provedores de DNS e a Cloudflare suporta **Domain Connect**, então pode aparecer uma opção de configuração automática/um clique. Se aparecer, prefira esse caminho: reduz erro de cópia.

### 10.2 Se o Resend oferecer configuração automática

1. Confira que o domínio exibido é `notificacoes.marmoteiro.com`.
2. Escolha a integração com Cloudflare.
3. Autorize a inclusão dos registros solicitados.
4. Volte ao Resend.
5. Aguarde a checagem dos registros.
6. Confirme status **Verified**.

Depois confira Cloudflare > `marmoteiro.com > DNS > Records` para entender o que foi criado.

### 10.3 Se precisar adicionar manualmente

Deixe duas abas abertas: Resend e Cloudflare.

Para cada registro apresentado pelo Resend:

1. Cloudflare > `marmoteiro.com` > **DNS > Records**.
2. **Add record**.
3. Em **Type**, copie o tipo mostrado pelo Resend.
4. Em **Name**, copie o nome mostrado pelo Resend.
5. Em **Content/Target**, copie o valor mostrado.
6. Se for MX, copie também **Priority**.
7. TTL = **Auto**.
8. Se existir **Proxy status**, escolha **DNS only**.
9. **Save**.
10. Repita para a próxima linha.

Não use valores de tutorial ou print antigo. SPF/DKIM/MX podem mudar e o Resend mostra os valores específicos da sua conta.

### 10.4 Não misturar os MX

Existem dois objetivos distintos:

- MX da raiz `marmoteiro.com`: Cloudflare Email Routing recebe `falecom@`;
- registros que o Resend pedir para `notificacoes.marmoteiro.com`: autenticação/envio do sistema.

**Não substitua os MX da raiz pelos MX do Resend.**

### 10.5 Regra do SPF

SPF é um TXT cujo conteúdo começa com:

```text
v=spf1
```

Não pode haver dois SPF independentes no **mesmo hostname**.

Exemplo conceitual válido:

```text
marmoteiro.com                 -> SPF A
notificacoes.marmoteiro.com   -> SPF B
```

São hostnames diferentes.

Exemplo problemático:

```text
marmoteiro.com -> SPF A
marmoteiro.com -> SPF B
```

Se encontrar isso, não tente “resolver” criando um terceiro. Primeiro identifique quais serviços precisam autorizar envio.

### 10.6 Regra do DKIM

DKIM usa um seletor específico fornecido pelo serviço. Copie **Name** e **Value** exatamente. Não encurte, não renomeie e não altere o texto.

### 10.7 Confirmar no Resend

1. Volte ao domínio no Resend.
2. Inicie/continue a verificação.
3. Veja o status individual de SPF, DKIM e demais registros.
4. Só considere concluído quando o domínio ficar **Verified**.
5. Se apenas um item falhar, corrija apenas aquele registro.

O Resend oferece diagnóstico por registro e detecção do provedor DNS; use essas mensagens antes de fazer alterações adicionais.

### 10.8 Criar a chave para a aplicação

1. Resend > **API Keys**.
2. **Create API Key**.
3. Name:
   ```text
   marmoteiro-producao-envio
   ```
4. Permission: **Sending access**.
5. Restrinja a `notificacoes.marmoteiro.com` se a tela oferecer a opção.
6. Crie.
7. Copie o token uma única vez.
8. Armazene no Google Cloud Secret Manager como:
   ```text
   marmoteiro-resend-api-key
   ```
9. Nunca salve em Markdown, `.env` versionado, GitHub Issue/PR ou código-fonte.

O plano Free deve ser reconfirmado antes do lançamento; limites podem mudar.

## 11. Como responder manualmente sem Workspace

Cloudflare Email Routing, sozinho, não fornece SMTP para resposta.

Também não devemos estruturar a solução de longo prazo em cima do recurso **Gmail "Enviar como"** com SMTP de terceiros: o Google anunciou a remoção dessa funcionalidade para contas de terceiros em janeiro de 2027.

Fonte: [Mudanças em contas de terceiros no Gmail](https://support.google.com/mail/answer/17101213?hl=pt-BR).

Quando for necessário responder manualmente como `falecom@marmoteiro.com`, escolher uma solução real:

### Opção A — caixa postal de baixo custo

Contratar um provedor que entregue:

- webmail;
- IMAP;
- SMTP autenticado;
- DKIM;
- SPF;
- suporte a domínio próprio.

É a opção preferível se e-mail se tornar canal regular de atendimento.

### Opção B — Cloudflare Email Service para saída

Cloudflare possui Email Sending com SMTP/API, mas o envio para destinatários arbitrários exige Workers Paid. Em 28/09/2026 a documentação informa 3.000 envios/mês incluídos no plano pago, enquanto Email Routing de entrada permanece disponível no Free.

Fontes:

- [Cloudflare Email Service](https://developers.cloudflare.com/email-service/)
- [Cloudflare Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/)

Como essa opção adiciona custo fixo e não cria uma caixa IMAP completa, **não é a escolha inicial** enquanto Cloudflare Routing + Resend atenderem o produto.

## 12. SPF, DKIM e DMARC

SPF e DKIM serão principalmente criados pelos serviços durante o onboarding. Você não precisa “inventar” esses registros.

Depois que Email Routing e Resend estiverem funcionando, adicione um DMARC inicial:

1. Cloudflare > `marmoteiro.com`.
2. **DNS > Records**.
3. **Add record**.
4. Type: **TXT**.
5. Name:
   ```text
   _dmarc
   ```
6. Content:
   ```text
   v=DMARC1; p=none;
   ```
7. TTL: **Auto**.
8. **Save**.

`p=none` é modo de observação. Ele não pede aos destinatários para rejeitar mensagens ainda. Só evolua para `quarantine`/`reject` depois de confirmar que todos os remetentes legítimos passam SPF/DKIM corretamente.

## 13. DNS: matriz de responsabilidade

| Nome | Finalidade | Quem fornece o valor | Proxy Cloudflare |
| --- | --- | --- | --- |
| `marmoteiro.com` | Site | Firebase Hosting wizard ou Load Balancer | DNS only no baseline Firebase |
| `www.marmoteiro.com` | Redirecionamento/site | Firebase Hosting wizard | DNS only no baseline Firebase |
| TXT de verificação Firebase | Prova de domínio | Firebase | DNS only |
| MX de `marmoteiro.com` | Entrada `falecom@` | Cloudflare Email Routing | Não aplicável |
| TXT/SPF raiz | Autorização de e-mail | Cloudflare/futuro SMTP | Não aplicável |
| `notificacoes.marmoteiro.com` e seletores | Resend | Resend | DNS only |
| `_dmarc.marmoteiro.com` | Política DMARC | Definição do projeto | Não aplicável |

### Diagnóstico rápido de e-mail

| Problema | Onde olhar primeiro |
| --- | --- |
| `falecom@` não recebe | Email Routing > Destination Addresses e Routing Rules |
| Destination pendente | Abra a caixa de destino e conclua o link de verificação |
| Cloudflare pede DNS | Email Routing > Onboard Domain e DNS > Records |
| Resend não verifica | No Resend, veja qual registro específico está pendente |
| CNAME Resend não valida | Confirme **DNS only**, Name e Target |
| SPF duplicado | DNS > Records; filtre por TXT e compare o mesmo hostname |
| MX conflitante | DNS > Records; não misture MX da raiz com serviço de subdomínio |
| E-mail chega mas resposta sai do endereço pessoal | Comportamento esperado do Routing; falta uma caixa/SMTP de saída |
| API key perdida | Revogue/crie outra no Resend; não tente recuperá-la de código/documentação |

## 14. Ordem recomendada de execução

1. confirmar segurança/renovação/DNSSEC do domínio na Cloudflare;
2. manter Firebase em Spark enquanto não houver deploy Cloud Run;
3. confirmar Google Developer Program Premium e crédito Google Cloud;
4. criar/validar Firebase Authentication;
5. configurar Cloudflare Email Routing para `falecom@`;
6. configurar Resend em `notificacoes.marmoteiro.com`;
7. preparar Neon, Secret Manager, Artifact Registry e Cloud Build;
8. vincular Cloud Billing -> projeto passa para Blaze;
9. criar alertas de orçamento;
10. publicar API e web em `run.app`;
11. validar sessão;
12. adaptar cookie/sessão para Firebase Hosting;
13. validar em `web.app`;
14. conectar `marmoteiro.com` pelo wizard do Firebase;
15. trocar `APP_ORIGIN` e callbacks;
16. executar smoke tests;
17. decidir caixa postal SMTP humana somente se realmente necessária.

## 15. Checklist final

- [ ] Cloudflare registrant e-mail verificado
- [ ] auto-renew conferido
- [ ] 2FA Cloudflare
- [ ] DNSSEC ativo
- [ ] `falecom@marmoteiro.com` recebendo
- [ ] Resend Verified
- [ ] nenhum Google Workspace contratado
- [ ] Firebase Project ID anotado
- [ ] Spark mantido até a etapa de billing
- [ ] Google Developer Program Premium confirmado
- [ ] US$ 10/mês de crédito confirmado/resgatado
- [ ] Cloud Billing vinculado antes do Cloud Run
- [ ] Firebase aparece como Blaze após billing
- [ ] orçamento/alertas ativos
- [ ] Cloud Run validado em `run.app`
- [ ] sessão compatível com Firebase Hosting
- [ ] domínio Firebase ativo e certificado emitido
- [ ] `APP_ORIGIN=https://marmoteiro.com`
- [ ] Auth Authorized domains atualizado
- [ ] SPF/DKIM testados
- [ ] DMARC iniciado em monitoramento
- [ ] nenhum segredo no Git
