# Baseline do Produto — O Tal do Marmoteiro

**Status:** canônico para levantamento técnico  
**Data de consolidação:** 21/09/2026

Este diretório reúne o contexto que antes existia espalhado entre documentos jurídicos, decisões de produto e discussões de fluxo.

## Documento principal

A especificação completa está em:

`/o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`

Ela define:

- escopo completo do produto;
- modalidades de serviço;
- cadastro e autenticação;
- checkout;
- pedido, pagamento e atendimento;
- pergunta avulsa;
- prioridade;
- consultas online;
- agenda;
- reagendamento;
- cancelamento;
- no-show;
- direito de arrependimento;
- refund policy;
- painel administrativo;
- área do consulente;
- privacidade;
- gravações;
- confidencialidade;
- auditoria;
- parâmetros;
- domínios conceituais.

## Documentos complementares

- `fluxos-operacionais.md`: jornadas e transições esperadas.
- `regras-de-negocio-e-invariantes.md`: regras que a implementação não pode quebrar.
- `regulatorio-privacidade-e-auditoria.md`: requisitos derivados de CDC, LGPD e documentos internos.
- `decisoes-e-premissas.md`: decisões tomadas durante a definição funcional e racional por trás delas.
- `/docs/legal/README.md`: inventário dos documentos jurídicos e ajustes acordados.

## Diretriz de produto

Este sistema NÃO será construído como MVP. Sequenciamento de entrega é permitido; redução permanente do escopo definido não é.

## Superfícies obrigatórias

1. Site público / landing page.
2. Fluxo de contratação e pagamento.
3. Área autenticada do consulente.
4. Painel administrativo / backoffice.

## Princípio de modelagem

Pedido, pagamento e atendimento possuem ciclos de vida próprios. A implementação deve preservar essa separação.

## Para agentes de IA

Comece por este arquivo e siga o `/AGENTS.md`. Não deduza regra de negócio a partir da estrutura do código existente quando houver documentação funcional explícita.
