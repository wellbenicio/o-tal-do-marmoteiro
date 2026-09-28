# Domínio Cloudflare, DNS, e-mail e Firebase/Google Cloud

Atualizado em 28/09/2026. Este documento é a referência operacional para o domínio `marmoteiro.com` e para a relação entre Cloudflare, Firebase e Google Cloud.

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

## 2. Segurança básica da zona Cloudflare

No Cloudflare Dashboard:

1. Abra **Domain Registration > Manage Domains > marmoteiro.com**.
2. Confirme que o e-mail do registrante está verificado. Uma pendência de verificação ICANN pode suspender temporariamente a resolução do domínio.
3. Mantenha **Auto-renew** habilitado, salvo decisão consciente em contrário.
4. Ative **DNSSEC** em **DNS > Settings > DNSSEC**.
5. Habilite 2FA na conta Cloudflare.
6. Não crie API Token global sem necessidade. Quando automação for necessária, use token com escopo mínimo e guarde fora do Git.
7. Em **DNS > Records**, remova registros de estacionamento ou testes somente depois de saber a finalidade deles.

### Proxy laranja versus DNS only

- A/AAAA/CNAME de tráfego web podem ser proxied quando a origem suporta essa arquitetura.
- registros de e-mail, verificação de domínio e outros registros fornecidos por terceiros devem permanecer **DNS only** quando o provedor assim exigir;
- MX e TXT não são proxied pelo proxy HTTP da Cloudflare.

Fonte: [Proxy status](https://developers.cloudflare.com/dns/proxy-status/).

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

## 9. E-mail oficial sem Google Workspace

O endereço funcional definido é:

```text
falecom@marmoteiro.com
```

Google Workspace não é necessário para registrar domínio, usar Cloudflare, Firebase, Google Cloud ou Calendar API.

### 9.1 Entrada gratuita com Cloudflare Email Routing

Cloudflare Email Routing pode encaminhar mensagens do domínio para uma caixa pessoal existente.

Configuração:

1. Cloudflare Dashboard -> `marmoteiro.com`.
2. **Email > Email Routing**.
3. Habilite o serviço.
4. Adicione o endereço pessoal de destino.
5. Confirme o endereço pelo e-mail de verificação.
6. Crie:
   - custom address: `falecom@marmoteiro.com`;
   - destination: caixa verificada.
7. Deixe a Cloudflare configurar os MX necessários.
8. Teste com remetente externo.

Fonte: [Cloudflare Email Routing](https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/).

Email Routing é **entrada/encaminhamento**, não uma caixa IMAP/SMTP completa.

## 10. E-mails do sistema com Resend

Usar:

```text
notificacoes.marmoteiro.com
```

Motivos:

- isola autenticação de e-mail transacional da raiz;
- reduz conflito com os registros do endereço humano;
- permite trocar o provedor de caixa postal sem mexer no domínio de envio do sistema.

### Passo a passo

1. Resend -> **Domains > Add domain**.
2. Informe `notificacoes.marmoteiro.com`.
3. Copie cada registro DNS fornecido.
4. Cloudflare -> **DNS > Add record**.
5. Crie TXT/CNAME/MX exatamente como informado.
6. CNAMEs de validação devem ficar **DNS only**.
7. Não substituir os MX da raiz `marmoteiro.com`.
8. Não criar dois SPF (`v=spf1`) no mesmo hostname.
9. Aguarde `Verified`.
10. Crie API key restrita ao envio.
11. Armazene no Secret Manager como `marmoteiro-resend-api-key`.

Sugestão:

```text
From: O Tal do Marmoteiro <avisos@notificacoes.marmoteiro.com>
Reply-To: falecom@marmoteiro.com
```

O plano Free consultado em 28/09/2026 informa 3.000 e-mails/mês e 100/dia. Fonte: [Resend pricing](https://resend.com/pricing).

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

Princípios:

- nunca criar dois TXT `v=spf1` no mesmo hostname;
- DKIM deve ser criado exatamente com seletor/valor fornecido pelo provedor;
- registros de verificação/e-mail ficam DNS only;
- só endurecer DMARC depois de inventariar todos os remetentes legítimos.

Fase inicial:

```text
_dmarc.marmoteiro.com
v=DMARC1; p=none;
```

Antes de ativar `quarantine` ou `reject`:

1. testar Resend;
2. testar eventual SMTP humano;
3. validar alinhamento de SPF/DKIM;
4. garantir que Firebase/Auth e outros remetentes não dependam de um domínio não autenticado;
5. adicionar endereço de relatório somente quando houver caixa preparada para receber os XMLs.

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
