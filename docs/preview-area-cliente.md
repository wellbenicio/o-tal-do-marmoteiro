# Prévia da interface — baseline 21/09/2026

O site está em `apps/web`, sobre a `dev` atualizada (`6606a80`). A referência visual e os elementos isolados do Figma foram preservados em `apps/web/public/assets`. O checkout anterior e as APIs MySQL da branch antiga não substituem a arquitetura aprovada da `dev`.

## Abrir localmente

```sh
npm ci
npm run dev:web -- --port 3008
```

A área demonstrativa do cliente não depende de banco, Redis ou credenciais. O acesso administrativo exige API e banco, conforme [configuração administrativa](./acesso-administrativo.md). Abra `http://localhost:3008/login` e selecione **Explorar uma conta de demonstração**. Use somente dados fictícios. Autenticação do cliente, agenda e operações comerciais ainda são uma simulação para validar interface; apenas formulários e estado de sessão no navegador, sem proteção de contas reais.

## Rotas

- `/`: landing, modalidades, jornada e perguntas frequentes.
- `/login` e `/cadastro`: acesso, cadastro completo, recuperação demonstrativa e retorno à contratação.
- `/agendar`: acesso → três resumos jurídicos → horário/consentimento de gravação → revisão/pagamento.
- `/agendar?modalidade=pergunta`: texto da pergunta e contexto opcional, entrega WhatsApp e opção de prioridade, com valores ilustrativos.
- `/minha-conta`: próxima consulta, histórico, perguntas pendentes e solicitações em andamento.
- `/minha-conta/consultas`: listagem, detalhes, reagendamento e cancelamento/arrependimento.
- `/minha-conta/perguntas`: perguntas, prioridade, fila e detalhes; o prazo final não é calculado sem calendário operacional.
- `/minha-conta/anotacoes`: anotações fictícias; integração/link real do Notion ainda indisponíveis.
- `/minha-conta/pagamentos`: pagamento, protocolos e devoluções, sem transferências reais.
- `/minha-conta/dados`: perfil protegido, contato editável e solicitação de correção sem alterar diretamente os campos bloqueados.
- `/minha-conta/privacidade`: canal oficial, formulário e histórico demonstrativo de solicitações.
- `/termos` e `/documentos/{terms,privacy,confidentiality}`: resumos separados, identificados como prévia.

## Regras representadas

Os três eixos são separados: `orderStatus`, `paymentStatus` e execução (`status`). Estados financeiros e decisões de refund usam os tipos do pacote compartilhado. Os demais nomes locais são modelos de apresentação, não decisões de schema persistente.

Um reagendamento por iniciativa do cliente exige pelo menos 24h de antecedência. Abrir as opções inicia uma solicitação de 48h. Fechar o modal não consome o uso; só confirmar o novo horário o consome. Expiração preserva a data original e o direito, encaminhando dúvidas à operação; o baseline não autoriza inventar penalidade automática nessa situação. O prestador pode disponibilizar opções de reagendamento no painel `/gestao`; o cliente confirma sem consumir um novo uso de seu direito.

Cancelamento gera protocolo e timestamp e considera execução/total/contexto. `refund-policy.ts` centraliza as regras 30/70, 50/50, restituição integral com prioridade e precedência legal. A prévia não apura juridicamente casos reais: solicitações pagas novas ficam em análise manual, sem retenção presumida. Exemplos separados mostram reembolso aprovado em processamento e concluído. O cliente não pode aprovar o próprio refund.

Gravação tem uma escolha própria, inicialmente vazia; a recusa permite continuar. Cada pedido tem snapshots de versão/data/manifestação de leitura dos três resumos, registro separado da gravação e timeline. Esses snapshots são locais e não constituem evidência jurídica ou aceite contratual real.

O catálogo, hold e slots fictícios estão em `preview-config.ts`; não representam configuração comercial aprovada. Não foi inventado calendário de horas úteis. Preços de pergunta/prioridade são ilustrativos (exemplo do baseline), indicados no checkout como tal.

## Dados e integrações

A sessão demonstrativa utiliza `sessionStorage` e é apagada ao sair; o painel de gestão também reinicia os exemplos para remover os dados introduzidos no cliente. As senhas do formulário demonstrativo do cliente não são armazenadas, transmitidas ou autenticadas; o login administrativo é separado e real. Não são enviados e-mails, dados ao WhatsApp/Notion, cobranças ou solicitações administrativas reais. Conteúdo de consulta real não deve ser colocado nessa demonstração.

A API NestJS implementa autenticação administrativa e adaptadores de comunicações desativados. Identidade do cliente, persistência comercial, concorrência, gateway, ligação das comunicações ao domínio, expansão RBAC e retenção continuam obrigatórios; sequenciamento e desenho estão em `docs/product/gap-analysis-interface.md`. Não foram excluídos do produto.

## Jurídico e publicação

Os arquivos obrigatórios foram encontrados e lidos. O repositório contém o inventário dos três documentos v1.0 e o baseline, mas não seus textos integrais. Novas versões publicáveis e identificação completa do prestador seguem necessárias conforme §36 do baseline. Os resumos de UI não se passam por esses documentos históricos nem os substituem.

O frontend pode ser configurado na Vercel com Root Directory `apps/web`, instalação via npm/workspaces e build do Next.js. Não há projeto vinculado nem autenticação Vercel disponível nesta máquina no momento desta entrega; nenhuma publicação foi efetuada. A prévia local permanece acessível na porta 3008.

## Validação

- Lint, TypeScript e build do frontend.
- Testes de domínio do checkout: limites 24h/48h, consumo de reagendamento, prioridade e precedência legal, revisão manual, hold, versões jurídicas e timezone.
- Navegador: checkout, recusa de gravação, pagamento simulado, solicitação/retomada/consumo de reagendamento, cancelamento/protocolo/revisão, correção de dados, privacidade, prioridade, notas, persistência e logout.
- Verificação visual e ausência de overflow em 375, 768 e 1024 pixels, além de desktop de 1440 pixels.

## Evolução: área do prestador

O painel `/gestao`, protegido por login administrativo, compartilha pedidos, eventos e disponibilidade com a área do cliente na mesma aba. Consulte [preview-gestao.md](./preview-gestao.md) para recursos, roteiro de teste e limites das integrações demonstrativas.
