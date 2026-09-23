# Handoff técnico e sequência de produção

Atualizado em 22/09/2026. Branch de integração: `dev`. Repositório: `wellbenicio/o-tal-do-marmoteiro`. Novos trabalhos usam `feature/<descricao>` conforme o [Git Flow](./git-flow.md). Consulte `git status` e os PRs antes de editar; não descarte arquivos de outras etapas. O histórico do PR registra o resultado de CI da publicação; isso não comprova deploy.

## Primeiro minuto de outro desenvolvedor/agente

Leia `AGENTS.md`, o baseline e [mapa técnico](./README.md). Confira arquivos de ambiente por nomes/validação, sem imprimir segredos. Inspecione processos nas portas 3008/3001 e Docker antes de reiniciar. A conta administrativa local existe; não criar senha padrão nem colocar credenciais em documentação/seed.

O responsável recebeu um [guia de criação das contas e primeira publicação](./configuracao-das-contas.md). Sua existência não comprova que as etapas foram executadas. Confirmar recursos/IDs reais antes de publicar. A região sugerida no guia é São Paulo quando disponível no plano escolhido; exemplos antigos em `us-central1` não são uma decisão já aplicada. Domínio próprio ainda exige escolha/homologação da frente HTTPS; Firebase Hosting filtra cookies e não é compatível automaticamente com o cookie administrativo atual.

## Entregue nesta etapa de infraestrutura

- ADR 0003 e análise de lacunas/custos com fontes oficiais e data.
- Builds portáveis web/API, target separado de migração, configuração App Hosting e build Cloud Run.
- CI com Postgres de teste, lint, testes e builds; execução remota depende de publicação do código no GitHub.
- Redis deixou de ser requisito do módulo raiz; dependências continuam disponíveis para evolução, sem fila fictícia.
- Outbox ganha executor por requisição autenticada com segredo próprio; sem disparos reais na prévia.
- Pool PostgreSQL explícito/limitado; frontend deixa de consultar sessão periodicamente em aba oculta.
- Next.js/eslint-config-next atualizados para 16.3.6; correções transitivas de `sharp`, `qs`, `fast-uri`, `js-yaml`, `multer` e `mysql2`. Estes dois últimos têm versões fixadas em `overrides` por segurança, mantendo NestJS 11 e Prisma 7.9.1. Instalar com `npm ci`; não regenerar o lockfile sem revisar auditoria e testes.
- Asset da personagem padronizado para `marmoteiro-baralho.png`: o nome original exportado retornava HTML no caminho interno do otimizador no build standalone. As quatro referências foram atualizadas, preservando os bytes da imagem.

## O que impede a publicação remota agora

Nenhuma conta Firebase/Google Cloud/hospedagem está autenticada neste ambiente e nenhum projeto remoto foi informado. Também não há banco remoto configurado. O build local não equivale a deploy. É necessário selecionar projeto/conta de faturamento, autenticar o proprietário, criar/conectar o banco e provisionar segredos/acesso administrativo.

Não publicar somente a web dizendo que o painel está funcional: a verificação administrativa depende da API e do PostgreSQL. Uma prévia sem API falha fechada no login, mas isso precisa ser explicitamente combinado; o objetivo é publicar as camadas necessárias.

## Evidências da validação local — 22/09/2026

- `npm ci`, geração Prisma, lint dos três workspaces e TypeScript compartilhado passaram.
- 31 testes da API passaram com PostgreSQL isolado; 28 testes do frontend passaram (59 ao todo).
- `npm audit` completo: zero vulnerabilidades conhecidas reportadas nesta data; não é garantia de ausência de falhas.
- Builds de produção nos três targets Docker (web, API, migração) passaram. Arquitetura local `linux/arm64`; o build remoto Linux/amd64 ainda deverá ser executado no Cloud Build.
- Três migrações aplicadas em banco temporário; target de migração também verificado sem migrações pendentes.
- Containers integrados testados em 3010/3011 com administrador temporário: SSR/assets, login responsivo a 375 px, páginas protegidas, rejeição de origem externa, cookie Secure/HttpOnly/SameSite Strict, login/logout/revogação, guard de job e envios desativados.
- Nenhum ambiente local foi incluído nas imagens. Credenciais temporárias e banco de teste são removidos após validação; a conta administrativa original permanece no banco local.
- CI remoto, deploy, domínio, carga sob Cloud Run e serviços externos **não foram homologados**. Não houve envio real de e-mail/WhatsApp, cobrança ou evento Google.

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
- Provedor atual do e-mail profissional; gateway/conta elegível para o ramo de atividade e formas de pagamento.
- OAuth da agenda: conta organizadora, calendário e permissões; homologação do Meet conforme recursos da conta.
- Número Meta, template aprovado, política de contato comercial separada dos lembretes; atendimento inicial manual da pergunta continua previsto.
- Retenção por categoria de dados, backup e recuperação; arquivos e gravações (quando autorizadas) fora do banco relacional.

## Evitar na próxima etapa

Não usar credenciais de demonstração como produção; não copiar sessionStorage ao banco como prova jurídica; não confiar no botão de pagamento aprovado; não calcular prazo útil com calendário inventado; não liberar admin por cadastro/email informado; não usar automação não oficial de WhatsApp; não chamar “enviado/entregue” o que é apenas simulação ou aceite de API.
