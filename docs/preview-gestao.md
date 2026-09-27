# Painel do prestador — prévia estrutural

Acesse `http://localhost:3008/gestao` com API, banco e frontend em execução. A rota exige login administrativo; veja [criação do primeiro acesso](./acesso-administrativo.md). Há atalhos em `/login` e na faixa de demonstração da área do consulente. A interface preserva a identidade escura, laranja e creme da referência existente.

## O que pode ser explorado

| Rota                   | Recursos nesta prévia                                                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/gestao`              | Indicadores do mês, agenda de hoje, pendências, recebimentos e lembretes de retorno.                                                                               |
| `/gestao/agenda`       | Semana/dia, bloqueios, detecção de conflito, consultas e reservas temporárias; bloqueios afetam o checkout na mesma aba.                                           |
| `/gestao/perguntas`    | Texto e contexto da pergunta, canal WhatsApp, prioridade/FIFO por pagamento, início manual e entrega por pergunta/foto/áudio.                                               |
| `/gestao/pedidos`      | Busca e filtros, eixos de pedido/pagamento/execução, documentos, motivo e protocolo de cancelamento, decisão fundamentada, restituição e histórico administrativo. |
| `/gestao/financeiro`   | Períodos, recebimentos, devoluções, taxas, despesas, resultado estimado, ticket, conversão, modalidades/meios, lançamento de despesa e CSV.                        |
| `/gestao/consulentes`  | Histórico administrativo, ranking de frequência e lembretes configuráveis; registrar contato, adiar 7 dias, dispensar e simular preferências.                      |
| `/gestao/notificacoes` | Lidas/não lidas, pedidos relacionados, caixa de saída com modelos para prestador/cliente, resumo diário manual, simulação de falha e nova tentativa.               |
| `/gestao/integracoes`  | Estado real da configuração Calendar/Meet e WhatsApp; fluxo de convite/lembrete, simulação de agenda, matriz de eventos e `.ics`.                                    |

Nos detalhes de uma consulta futura confirmada, o prestador pode disponibilizar opções de reagendamento sem consumir o direito do consulente, ou simular cancelamento por indisponibilidade com restituição integral pendente. A escolha do novo horário acontece na área do consulente. O horário original permanece até a confirmação; a janela de escolha é de 48 horas. Após o horário de término, o prestador pode registrar manualmente a realização da consulta.

Cancelamentos solicitados por clientes conservam o contexto para análise; decidir valor e justificativa não simula confirmação bancária. Confirmar o reembolso é outra ação demonstrativa. Perguntas iniciadas não perdem automaticamente direitos. Sem calendário operacional homologado, não se inventa uma data final de 48 horas úteis.

## Roteiro de validação entre as áreas

1. Em `/login`, use **Explorar uma conta de demonstração**.
2. Crie um atendimento em `/agendar`, percorra os resumos jurídicos, escolha horário/consentimento e simule pagamento.
3. Na mesma aba, entre com a conta administrativa e abra `/gestao/pedidos` e `/gestao/notificacoes`. Pedido e pagamento produzem eventos e prévias para as duas pessoas.
4. Na área do cliente, solicite reagendamento ou cancelamento. Confira a atualização na gestão.
5. Analise a restituição na gestão, registre uma razão e simule a conclusão do reembolso. Volte ao cliente para verificar o resultado.
6. Bloqueie um intervalo futuro na agenda e verifique que os slots correspondentes ficam indisponíveis no checkout. Horários adjacentes continuam disponíveis; conflitos são rejeitados.
7. Explore o financeiro, baixe CSV, registre despesa e teste os lembretes de retorno. Nenhuma ação de relacionamento envia mensagens.
8. Nas integrações, ative o espelho demonstrativo e baixe `.ics`, se desejar. O arquivo é uma exportação de eventos fictícios; importar manualmente no Google não cria sincronização contínua.

## Dados e limites deliberados

- Estado demonstrativo por aba em `sessionStorage`: `marmoteiro-management-preview-v1`, ligado à sessão `marmoteiro-baseline-preview-v3` do cliente. Recarregar preserva a simulação; outras abas/dispositivos não sincronizam.
- A sessão administrativa é real, independente da conta de cliente, com autorização no servidor. O estado demonstrativo só monta após login; sair do painel limpa sua cópia local e revoga a sessão. Sair da conta do cliente limpa seus dados fictícios e reinicia a gestão. Nenhum desses dados comerciais da prévia deve ser real.
- Adaptadores Calendar/Meet e WhatsApp, outbox e worker estão implementados no backend, mas desativados e sem ligação com o pagamento fictício. OAuth pelo painel, leitura da agenda pessoal, servidor de e-mails comerciais e gateway ainda não estão conectados. As opções de resumo diário/lembrete persistem como preferências ilustrativas; não há envio agendado.
- E-mails são gerados por eventos da sessão; importação de histórico não inventa envios retroativos. O status “processado na simulação” não significa entrega. Templates não incluem pergunta, interpretação, áudio ou fotografia.
- Exportação de agenda usa UID estável, horário de Brasília convertido a UTC, eventos privados e títulos genéricos. Não inclui nome de consulente ou conteúdo de consulta.
- Financeiro segue caixa: entrada na data do pagamento, saída na data de restituição efetivada. Reembolso pendente é separado. Resultado é estimado, antes de tributos e dados não lançados. Não representa banco ou lucro líquido.
- Lembretes usam a última execução concluída (timestamp real de conclusão nas novas ações). Excluem atendimento pendente, preferência contrária, contato recente, adiamento e dispensa. O padrão demonstrativo é 30 dias, configurável, sem obrigação de retorno ou campanha automática.

## Validação técnica

Lint, TypeScript e build do Next.js; testes de domínio do checkout e da gestão; navegação e ações no Chrome, incluindo larguras 375/768/1024/1440 px. Cobertura adicional: caixa por data, devoluções, exclusão de pendências, fila, limites de bloqueio, deduplicação de eventos, preferências/retorno, CSV, mudanças pelo prestador e preservação do direito do consulente.

O levantamento original está em [gap-analysis-gestao.md](./product/gap-analysis-gestao.md). A evolução de login e canais está em [gap-analysis-acesso-e-canais.md](./product/gap-analysis-acesso-e-canais.md) e [configuração administrativa](./acesso-administrativo.md). O restante do baseline permanece obrigatório; esta entrega valida a estrutura navegável antes dessas integrações reais.
