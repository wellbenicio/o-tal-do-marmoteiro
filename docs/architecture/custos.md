# Custos e alternativas de infraestrutura

Referência revisada em 28/09/2026. Valores em USD, antes de câmbio/impostos, sujeitos a alteração. Franquia gratuita não significa SLA, backup completo ou limite financeiro automático. Créditos promocionais temporários não entram nas estimativas.

## Recomendação para 50 consulentes + 1 administrador

Firebase Authentication + Cloud Run (web e API, em dois containers) + Neon PostgreSQL + Resend (e-mails transacionais). O domínio `marmoteiro.com` já está no Cloudflare Registrar/DNS. Google Workspace não será contratado nesta fase; entrada de `falecom@marmoteiro.com` pode usar Cloudflare Email Routing. WhatsApp oficial e gateway são despesas variáveis de operação. Redis não é necessário nesta fase.

Firebase App Hosting é uma alternativa gerenciada para a web, condicionada à homologação: a tabela oficial consultada ainda não confirma suporte ativo ao Next.js 16.3.6 e ao monorepo npm deste projeto. Os containers próprios evitam depender desse adaptador no primeiro deploy. [Suporte de frameworks](https://firebase.google.com/docs/app-hosting/frameworks-tooling).

Estimativa de planejamento, não orçamento garantido: **US$ 0 a US$ 5/mês para a infraestrutura pequena**, enquanto dentro das franquias, sem grandes arquivos/gravações, sem instâncias sempre ligadas e sem consultas periódicas que mantenham o banco acordado. Isso exclui renovação do domínio, eventual caixa postal, pagamento, WhatsApp, tributos e quaisquer planos extras.

O projeto Firebase está hoje no **Spark**, mas Cloud Run/App Hosting exigem Cloud Billing e, ao vinculá-lo, o projeto passa automaticamente para **Blaze**. Blaze não implica mensalidade fixa; libera produtos pagos por consumo. O Google AI Pro vinculado ao Google Developer Program Premium anuncia **US$ 10/mês em créditos Google Cloud**. Esse crédito pode absorver parte ou todo o consumo pequeno, mas não entra como garantia de custo zero e deve ser confirmado mensalmente antes de ser considerado no caixa.

## Spark, Blaze e benefício Google AI Pro

- **Spark:** adequado enquanto o trabalho estiver limitado a configuração/desenvolvimento dos produtos Firebase gratuitos.
- **Blaze:** necessário para Cloud Run, Cloud Build, Artifact Registry, Secret Manager e App Hosting. O vínculo de uma Cloud Billing Account ao mesmo projeto converte Spark -> Blaze.
- **Google AI Pro / Developer Program Premium:** a documentação vigente inclui US$ 10/mês em créditos Google Cloud, além de cotas maiores do Gemini Code Assist e 30 workspaces Firebase Studio.
- **Planejamento financeiro:** tratar o crédito como abatimento promocional/benefício, não como teto de uso. Alertas de orçamento continuam obrigatórios.

Detalhes operacionais: [domínio, Cloudflare e billing](./dominio-cloudflare-email.md).

## Componentes

| Componente | Possibilidade inicial | Limite/cuidado relevante |
| --- | --- | --- |
| Identidade Firebase | E-mail/senha e provedores sociais podem ficar na faixa gratuita; com Identity Platform, franquia de 50 mil MAU | Telefone/SMS tem cobrança; 50 clientes não precisam de 50 licenças de e-mail profissional. [Firebase](https://firebase.google.com/pricing) |
| Next.js e NestJS no Cloud Run | Pode ficar na franquia com cobrança por requisição e mínimo de instâncias zero | Referência Tier 1: 180 mil vCPU-s, 360 mil GiB-s e 2 milhões de requisições/mês, compartilhados na conta. Saída para usuários no Brasil tem cobrança de rede; não aplicar a franquia de 10 GiB do App Hosting aqui. Partida a frio; CPU fora da requisição não é execução confiável de jobs. [Cobrança](https://docs.cloud.google.com/run/docs/configuring/billing-settings), [preços](https://cloud.google.com/run/pricing) |
| Alternativa: Next.js no App Hosting | Sem mensalidade fixa obrigatória; depende de homologação do adaptador | Requer Blaze/faturamento. Franquia de saída de 10 GiB/mês; excedente anunciado de US$ 0,15/GiB em cache e US$ 0,20/GiB sem cache. Build, imagens, logs e segredos têm contadores próprios. [Custos](https://firebase.google.com/docs/app-hosting/costs) |
| PostgreSQL Neon | Plano gratuito com 0,5 GB e 100 CU-h por projeto/mês | Dados pequenos cabem; índices/auditoria também ocupam espaço. Ausência de tráfego permite pausar. Confirmar retenção, regiões e transferência na conta. [Anúncio atual](https://neon.com/blog/neon-backend-is-ga), [pausa](https://neon.com/blog/building-patterns-unlocked-by-scale-to-zero) |
| E-mails Resend | 3.000/mês, até 100/dia no gratuito | Domínio remetente verificado; contabilizar e-mails ao dono e ao cliente. Rajadas podem atingir o limite diário mesmo abaixo do mensal. [Franquia](https://resend.com/blog/new-free-tier), [planos](https://resend.com/pricing) |
| Google Calendar / Meet | Uso padrão da Calendar API sem custo adicional | OAuth, quotas e recursos permitidos à conta. Gravação automática e outros recursos avançados do Meet não estão incluídos nessa afirmação. [Calendar API](https://developers.google.com/workspace/calendar/api/guides/quota) |
| WhatsApp Business Platform | Cobrança variável por mensagens/categoria/mercado e condições vigentes | Lembretes agendados não devem ser orçados como universalmente gratuitos. Usar Cloud API direta evita mensalidade de um intermediário, mas não elimina tarifas Meta. [Preços oficiais](https://whatsappbusiness.com/products/platform-pricing/) |
| Gateway | Há provedores sem mensalidade básica que cobram por transação | Taxa varia por método, prazo de recebimento, parcelamento e contrato. Consultar a conta comercial antes de decidir; não confundir Pix pessoal manual com integração gratuita de checkout. [Exemplo Mercado Pago](https://www.mercadopago.com.br/blog/links-pagamento-o-que-sao-vantagens) |
| Agendamento técnico | Cloud Scheduler oferece 3 jobs gratuitos por conta de faturamento; excedente US$ 0,10/job/mês | A execução disparada pode gerar custo no Cloud Run/banco. Usar Cloud Tasks para horários individuais na etapa funcional; não manter o banco ativo só para consultar uma fila vazia. [Scheduler](https://cloud.google.com/scheduler/pricing) |
| Domínio e DNS | Cloudflare Registrar + Cloudflare DNS | Domínio já contratado; considerar renovação anual. Nameservers permanecem na Cloudflare. DNSSEC é gratuito. |
| Entrada `falecom@` | Cloudflare Email Routing | Encaminhamento de entrada sem Workspace; não oferece uma caixa IMAP/SMTP completa. |
| E-mail transacional | Resend Free inicialmente | 3.000 e-mails/mês e 100/dia na referência de 28/09/2026; usar `notificacoes.marmoteiro.com`. |
| Caixa postal humana | Não contratar inicialmente | Só adicionar provedor IMAP/SMTP quando houver necessidade de responder manualmente como `falecom@`. Não depender do Gmail “Enviar como”, cuja retirada para terceiros foi anunciada para janeiro/2027. |

## Outras hospedagens que vale conhecer

| Alternativa | Uso comercial/custo | Adequação a este projeto |
| --- | --- | --- |
| Vercel Hobby | Gratuito, restrito a uso pessoal não comercial | Não serve como hospedagem gratuita do negócio. [Política/plano](https://vercel.com/docs/plans/hobby) |
| Vercel Pro | A partir de US$ 20/mês para um assento de desenvolvimento, mais consumo/extras aplicáveis | Muito conveniente para Next.js, mas acrescenta custo fixo. Não substitui banco e API. [Preços](https://vercel.com/pricing) |
| Netlify Free | Permite projetos comerciais; plano atual com 300 créditos/mês e limite rígido | Boa alternativa para prévia, com risco de pausa ao esgotar créditos. Deploys, tráfego e compute dividem o saldo; usar a tabela atual, não as cotas do plano legado. [Uso comercial](https://www.netlify.com/blog/introducing-netlify-free-plan/), [créditos](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/) |
| Cloudflare Workers | Grátis até 100 mil requisições/dia, 10 ms de CPU por invocação; pago a partir de US$ 5/mês | Next.js exige homologação com adaptador; SSR pode exceder CPU gratuita. NestJS não é transplantado automaticamente para esse runtime. [Preços](https://developers.cloudflare.com/workers/platform/pricing/) |
| Firebase Hosting estático | Tem franquia gratuita | Não hospeda sozinho as rotas de servidor do projeto. Não trocar App Hosting por exportação estática removendo a proteção do admin. [Planos Firebase](https://firebase.google.com/pricing) |
| Supabase Free | PostgreSQL com 500 MB; projeto pode pausar após uma semana de pouca atividade | Alternativa válida, mas já escolhemos Firebase Auth. Backup automático/PITR não faz parte do Free; Pro parte de US$ 25/mês. [Planos](https://supabase.com/pricing) |

## Vale colocar o banco inteiro no Firebase?

Firebase Authentication e banco de negócio são escolhas independentes. Firestore é um banco documental com transações e poderia atender o produto mediante outro desenho. A franquia padrão consultada é 1 GiB, 50 mil leituras/dia, 20 mil escritas/dia e 20 mil exclusões/dia; consultas, índices e listeners têm regras de cobrança. [Firestore](https://firebase.google.com/docs/firestore/pricing).

No projeto atual, manter PostgreSQL evita reescrever relações entre pedido, pagamento, agendamento, aceite, restituição e auditoria. Métricas e reconciliação também aproveitam SQL. Não precisamos manter cópias concorrentes do mesmo perfil em Firestore e PostgreSQL. O Firebase será a identidade; o cadastro completo do consulente terá o UID associado no banco relacional.

Firebase SQL Connect (antigo Data Connect) é outra opção: usa PostgreSQL/Cloud SQL, mas o banco tem custo próprio após avaliação. A documentação apresenta entrada de Cloud SQL a partir de US$ 9,37/mês, variando por região/configuração. Não equivale a PostgreSQL permanentemente gratuito. [SQL Connect](https://firebase.google.com/docs/sql-connect/pricing).

## Como estimar sem confundir usuários com consumo

Exemplo de planejamento: 50 usuários ativos, 50 atendimentos no mês, 5 mil visualizações, 30 mil chamadas dinâmicas, 500 e-mails e 100 lembretes WhatsApp. Não é previsão de vendas ou medição do sistema.

- Web/API: 30 mil chamadas com 0,3 s de CPU média dão aproximadamente 9 mil vCPU-s; somar partidas a frio, jobs, otimização de imagem e build. Compare o total com a franquia compartilhada da modalidade selecionada.
- Banco: CU-h = capacidade média × horas ativas. 0,25 CU ligada 730 h consome 182,5 CU-h: ultrapassa 100 CU-h mesmo com poucos usuários. A cada 15 segundos ou minuto, uma consulta de fila pode impedir a pausa. A cada 15 minutos, com 5 minutos acordado por acionamento, o cenário idealizado dá cerca de 60,8 CU-h/mês, antes do uso real. Essas contas ilustram o risco; a duração de pausa deve ser confirmada no provedor e não é um SLA do produto.
- E-mails: 50 atendimentos × 8 mensagens de sistema, mais recuperação/cadastro/exceções, podem caber em 3 mil/mês; observar 100/dia.
- WhatsApp: quantidade de templates entregues × tarifa vigente da categoria/país. Sem tarifário específico da conta aprovado, não fixar um número no código ou prometer zero.
- Gateway: faturamento por método × taxa negociada, mais valores fixos/parcelamento aplicáveis. Essa despesa cresce com as vendas.
- Arquivos: 50 gravações de 300 MB por mês, retidas por 90 dias, aproximam 45 GB no estoque, antes de cópias/transferência/legal hold. Isso muda o orçamento e não está incluído na faixa pequena de infraestrutura acima.

## Controles operacionais

Configuração inicial: mínimo zero, máximo duas instâncias por serviço, pool de três conexões por instância, sem Redis obrigatório, sem envios reais e sem timer contínuo de outbox na nuvem. Esses limites controlam capacidade; não são teto financeiro absoluto. Alertas de orçamento também não impedem cobranças por si só.

Definir alertas de orçamento/uso, limpeza de imagens antigas, retenção mínima necessária de logs sem conteúdo íntimo, backups cifrados e teste de restauração. A região deve considerar usuários no Brasil, latência entre API/banco, preços e tratamento de dados; escolher região estrangeira só depois de registrar a decisão de transferência aplicável. Não assumir que toda franquia de armazenamento se aplica à região brasileira.

Reavaliar aos 60–70% de armazenamento/compute, diante de fila acumulada ou lentidão medida. Primeiro corrigir consultas, loops e cache; depois elevar plano/capacidade. Não adicionar microserviços por quantidade de cadastros.
