# Handoff técnico e sequência de produção

Atualizado em 28/09/2026. Branch padrão/produção: `main`; integração: `dev`. Repositório: `wellbenicio/o-tal-do-marmoteiro`. Novos trabalhos usam `feature/<descricao>` conforme o [Git Flow](./git-flow.md). Consulte `git status` e os PRs antes de editar; não descarte arquivos de outras etapas. O histórico do PR registra o resultado de CI da publicação; isso não comprova deploy.

## Primeiro minuto de outro desenvolvedor/agente

Leia `AGENTS.md`, o baseline e [mapa técnico](./README.md). Confira arquivos de ambiente por nomes/validação, sem imprimir segredos. Inspecione processos nas portas 3008/3001 e Docker antes de reiniciar. A conta administrativa local existe; não criar senha padrão nem colocar credenciais em documentação/seed.

O responsável recebeu um [guia de criação das contas e primeira publicação](./configuracao-das-contas.md). Sua existência não comprova que as etapas foram executadas. Confirmar recursos/IDs reais antes de publicar. A região sugerida no guia é São Paulo quando disponível no plano escolhido; exemplos antigos em `us-central1` não são uma decisão já aplicada. Domínio próprio ainda exige escolha/homologação da frente HTTPS; Firebase Hosting filtra cookies e não é compatível automaticamente com o cookie administrativo atual.

## Contas e domínio — atualização em 28/09/2026

Informado pelo proprietário: `marmoteiro.com` registrado na **Cloudflare**; e-mail do domínio **ainda não configurado**; **Google Workspace não será contratado**; Firebase no **Spark**; Google AI Pro pela oferta de estudantes e participação no Google Developer Program. Não há confirmação de saldo/resgate de crédito, expiração da oferta, configuração DNS, plano Workers ou recursos remotos.

O [guia de contas](./configuracao-das-contas.md) passa a partir desse cenário: Email Routing para recebimento no Gmail, escolha separada do envio humano, Resend para a futura integração transacional, verificação dos benefícios AI Pro/Developer e migração Spark → Blaze quando for executar Cloud Run. Uso da conta Google pessoal é previsto para Calendar/Meet. Nenhum plano pago, envio, DNS ou deploy foi ativado pela atualização documental.

Cloudflare continua registrador/DNS; frente HTTPS para web/API permanece a homologar. O mapeamento nativo Cloud Run não contempla `southamerica-east1`; Firebase Hosting depende de ajuste/teste de cookies e um proxy Cloudflare não está implementado. Respeitar o baseline completo, sem substituir checkout por agenda Google ou site estático.

## Preços e duração — 25/09/2026

A decisão comercial D-024 estabelece videochamada de 60 minutos por R$ 50,00 e pergunta avulsa por R$ 10,00. A fonte central da interface é `apps/web/src/lib/preview-config.ts`, em centavos; landing page, checkout, exemplos do cliente/painel e restituições demonstrativas consomem essa configuração. Agenda, bloqueios, conclusão e exportação ICS usam a mesma duração. Horários iniciados a cada meia hora não podem sobrepor consultas de uma hora.

O catálogo persistente ainda será integrado. A prioridade de R$ 20,00 permanece demonstrativa. Dados já armazenados na sessão do navegador preservam seus valores de contratação; para explorar exemplos novos, saia e entre novamente na demonstração. Fixtures de testes financeiros podem manter valores anteriores para verificar que histórico e reembolsos não são recalculados pelo preço atual. Não há migração de preços no banco nesta alteração.

## Entregue nesta etapa de infraestrutura

- ADR 0003 e análise de lacunas/custos com fontes oficiais e data.
- Builds portáveis web/API, target separado de migração, configuração App Hosting e build Cloud Run.
- CI com Postgres de teste, lint, testes e builds; publicação e evidência de execução remota no [PR #5](https://github.com/wellbenicio/o-tal-do-marmoteiro/pull/5). Acompanhar o resultado do commit atual nos checks; não inferir sucesso de um commit anterior.
- Redis deixou de ser requisito do módulo raiz; dependências continuam disponíveis para evolução, sem fila fictícia.
- Outbox ganha executor por requisição autenticada com segredo próprio; sem disparos reais na prévia.
- Pool PostgreSQL explícito/limitado; frontend deixa de consultar sessão periodicamente em aba oculta.
- Next.js/eslint-config-next atualizados para 16.3.6; correções transitivas de `sharp`, `qs`, `fast-uri`, `js-yaml`, `multer` e `mysql2`. Estes dois últimos têm versões fixadas em `overrides` por segurança, mantendo NestJS 11 e Prisma 7.9.1. Instalar com `npm ci`; não regenerar o lockfile sem revisar auditoria e testes.
- Asset da personagem padronizado para `marmoteiro-baralho.png`: o nome original exportado retornava HTML no caminho interno do otimizador no build standalone. As quatro referências foram atualizadas, preservando os bytes da imagem.

## O que impede a publicação remota agora

O proprietário já informou um projeto Firebase Spark; seu ID e acesso operacional neste ambiente ainda precisam ser confirmados, assim como o banco remoto. O build local não equivale a deploy. Para o destino Cloud Run, é necessário conferir benefícios/créditos, vincular a conta de faturamento ao projeto (Blaze), autenticar o proprietário e provisionar banco, segredos e acesso administrativo. E-mail e apontamento web do domínio permanecem pendentes.

Não publicar somente a web dizendo que o painel está funcional: a verificação administrativa depende da API e do PostgreSQL. Uma prévia sem API falha fechada no login, mas isso precisa ser explicitamente combinado; o objetivo é publicar as camadas necessárias.

## Evidências da validação local — 22/09/2026

- `npm ci`, geração Prisma, lint dos três workspaces e TypeScript compartilhado passaram.
- 31 testes da API passaram com PostgreSQL isolado; 28 testes do frontend passaram (59 ao todo).
- `npm audit` completo: zero vulnerabilidades conhecidas reportadas nesta data; não é garantia de ausência de falhas.
- Builds de produção nos três targets Docker (web, API, migração) passaram. Arquitetura local `linux/arm64`; o build remoto Linux/amd64 ainda deverá ser executado no Cloud Build.
- Três migrações aplicadas em banco temporário; target de migração também verificado sem migrações pendentes.
- Containers integrados testados em 3010/3011 com administrador temporário: SSR/assets, login responsivo a 375 px, páginas protegidas, rejeição de origem externa, cookie Secure/HttpOnly/SameSite Strict, login/logout/revogação, guard de job e envios desativados.
- Nenhum ambiente local foi incluído nas imagens. Credenciais temporárias e banco de teste são removidos após validação; a conta administrativa original permanece no banco local.
- Deploy, domínio, carga sob Cloud Run e serviços externos **não foram homologados**. Não houve envio real de e-mail/WhatsApp, cobrança ou evento Google. A validação remota de código pelo GitHub Actions é independente dessas etapas; seu resultado fica nos checks do PR e de `dev`.

## Histórico e trabalho paralelo preservado

Os PRs [#5](https://github.com/wellbenicio/o-tal-do-marmoteiro/pull/5) e [#7](https://github.com/wellbenicio/o-tal-do-marmoteiro/pull/7) foram integrados em `dev`; suas features foram removidas após confirmação. O #7 reúne a limpeza de qualidade e acessibilidade, com CI e Sonar aprovados.

O [PR #6](https://github.com/wellbenicio/o-tal-do-marmoteiro/pull/6) preserva os 19 commits do antigo #3 e recebe a reconciliação com esse `dev`. Conferir o estado final do merge no próprio PR. As incompatibilidades de código foram resolvidas com:

- `/api/v1` para cálculos novos, preservando `/admin/*`, `/internal/*` e `GET /`;
- autenticação administrativa existente, sessão persistida e formato único de hashing;
- `OWNER` autorizado, `ADMIN` histórico sem escalada de privilégio;
- migration transacional sem remoção de colunas ou do histórico `ServiceExecution`;
- reembolso com enquadramento legal explícito e revisão manual nos casos indeterminados, sem percentual presumido;
- ADRs 0017/0018 renumeradas, mantendo as 0002/0003 vigentes;
- testes com PostgreSQL isolado para dados anteriores à migration, rollback, sessões e rotas; e2e incluído no CI.

As quatro migrations destrutivas que só existiam na feature antiga foram substituídas por `20260925140000_reconcile_domain_enums`; migrations já integradas não foram alteradas. Caso alguém tenha aplicado experimentalmente as migrations antigas fora de `dev`, interromper a atualização e reconciliar esse histórico em uma cópia com backup, sem apagar registros de `_prisma_migrations` nem executar reset. Valores desconhecidos de papel/status fazem a nova migration falhar transacionalmente e exigem revisão.

Os endpoints novos continuam sem persistência de recursos e não confirmam pagamentos, estornos ou autorização de clientes. A implantação comercial permanece sujeita às etapas abaixo. Os detalhes das branches históricas estão no [guia de versionamento](./git-flow.md).

Prévia de desenvolvimento em `http://localhost:3008/`, API local em 3001. Artefatos de inspeção desta execução em `/tmp/marmoteiro-deploy-review/`; são temporários, não armazenamento de produção.

## Ordem de implementação item por item

| Etapa | Dependência | Critério de conclusão |
| --- | --- | --- |
| 1. Publicar prévia | Projeto, faturamento escolhido, hospedagem, banco e segredos | URL HTTPS, assets, admin autenticado, API protegida, smoke test remoto, rollback identificado; comércio ainda demonstrativo |
| 2. Firebase e cadastro real | Projeto Auth, sessão/BFF, modelo UID | Signup/login/recuperação, e-mail verificado conforme política, perfil protegido, autorização por proprietário e testes contra acesso cruzado |
| 3. Catálogo e jurídico | Documentos integrais/versionados, dados do prestador | Preços e calendário operacional configuráveis, aceite por versão/hash/data, consentimentos independentes e evidência persistida |
| 4. Pedido/agenda/pergunta persistentes | Identidade e catálogo | Hold e exclusividade com concorrência, texto protegido, fila correta, correção cadastral e auditoria |
| 5. Gateway | Conta comercial e sandbox | Cobrança, assinatura/dedup de webhook, confirmação confiável, reconciliação, estorno e testes de falha/duplicidade |
| 6. Google Calendar/Meet | Pagamento/agenda confiáveis, OAuth e calendário | Convite com Meet, atualização/cancelamento, conflitos/disponibilidade pessoal e reconciliação sem dados íntimos |
| 7. E-mail transacional | Domínio/DNS e provedor | Templates versionados, opt-ins quando aplicáveis, outbox, retries, limites diários e recibos/bounces |
| 8. WhatsApp | Número/conta/template aprovados e consentimento | Agendamento de lembretes, revogação, revalidação, recibos de entrega e tratamento de incerteza |
| 9. Operação administrativa real | Domínios anteriores | Métricas financeiras sobre eventos reais, decisões manuais, contatos autorizados, auditoria e exportações |
| 10. Retenção e lançamento comercial | Jurídico/dados/integrações homologados | Backups/restauração, atendimento LGPD, retenção/legal hold, observabilidade, teste de carga e revisão final do fluxo inteiro |

Etapas podem avançar em paralelo se independentes, mas nenhuma capacidade do baseline é removida. Entrega incremental não autoriza cobrar antes de contratos/pagamento/cancelamento funcionarem corretamente.

## Definição de pronto por alteração

Registrar problema e comportamento final; contrato e autorização; regras/invariantes afetadas; migração/reversibilidade; eventos/auditoria; falhas/retries; prova de teste proporcional; variáveis sem valores secretos; status atualizado neste mapa. Se mudar arquitetura, escrever ADR e indicar qual decisão anterior foi substituída.

## Decisões ainda a fechar

- ID/conta do projeto Firebase, regiões e transferência aplicável de dados; limite de gasto aceitável e método de acompanhamento.
- Configurar recebimento por Email Routing/Gmail e escolher saída humana autenticada do e-mail profissional, sem Workspace; gateway/conta elegível para o ramo de atividade e formas de pagamento.
- Vínculo AI Pro/Developer, validade da oferta estudantil e créditos resgatados na conta Billing correta; confirmar custo bruto e após abatimentos.
- OAuth da agenda: conta organizadora, calendário e permissões; homologação do Meet conforme recursos da conta.
- Número Meta, template aprovado, política de contato comercial separada dos lembretes; atendimento inicial manual da pergunta continua previsto.
- Retenção por categoria de dados, backup e recuperação; arquivos e gravações (quando autorizadas) fora do banco relacional.

## Evitar na próxima etapa

Não usar credenciais de demonstração como produção; não copiar sessionStorage ao banco como prova jurídica; não confiar no botão de pagamento aprovado; não calcular prazo útil com calendário inventado; não liberar admin por cadastro/email informado; não usar automação não oficial de WhatsApp; não chamar “enviado/entregue” o que é apenas simulação ou aceite de API.
