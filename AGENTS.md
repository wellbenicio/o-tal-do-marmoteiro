# AGENTS.md — O Tal do Marmoteiro

Este arquivo define a ordem obrigatória de leitura para agentes de IA e desenvolvedores que atuem neste repositório.

## Fonte de verdade

Antes de propor arquitetura, banco, API, UI, backlog ou código, leia nesta ordem:

1. `/docs/product/README.md`
2. `/o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`
3. `/docs/product/fluxos-operacionais.md`
4. `/docs/product/regras-de-negocio-e-invariantes.md`
5. `/docs/product/regulatorio-privacidade-e-auditoria.md`
6. `/docs/product/decisoes-e-premissas.md`
7. `/docs/legal/README.md`
8. ADRs em `/docs/adr/`

## Regra de precedência

Em caso de conflito:

1. legislação obrigatória aplicável;
2. baseline funcional/regulatório;
3. regras de negócio e fluxos documentados;
4. ADRs técnicos;
5. implementação existente.

A implementação existente NÃO é fonte de verdade quando divergir do baseline funcional.

## Restrições para agentes

- Não transformar o produto em MVP.
- Não remover requisitos sob justificativa de simplicidade.
- Não inventar regra de negócio ausente.
- Não alterar percentuais, prazos, estados ou condições regulatórias.
- Não tratar status de pedido, pagamento e atendimento como um único ciclo.
- Não tornar `IN_PROGRESS` sinônimo de perda de direito de arrependimento.
- Não considerar prioridade como serviço financeiro independente.
- Não tratar dados de consulta como dados administrativos comuns.
- Não substituir decisões manuais previstas por automatismos sem autorização.
- Não hardcodar calendário de horas úteis.
- Quando uma decisão técnica puder mudar o comportamento funcional, registrar a dúvida e preservar o baseline.

## Estado técnico atual

O repositório já contém scaffold de monorepo com Next.js, NestJS, Prisma e módulos de domínio. Antes de implementar novas funcionalidades, faça gap analysis entre o código atual e a documentação acima.

## Versionamento obrigatório — Git Flow

- Consulte `docs/architecture/git-flow.md` antes de criar branch, integrar ou publicar alterações.
- `dev` é a integração; `main` recebe releases. Não implementar diretamente nessas branches.
- Novas funcionalidades, ajustes de UI, documentação e infraestrutura partem de `dev` em `feature/<descricao>` (singular).
- Use `release/<versao>` para preparar uma versão e `hotfix/<descricao>` para correções da versão estável; reintegre em `dev`.
- Atualize referências com `git fetch origin --prune`; sincronize branches permanentes com `--ff-only`. Nunca sobrescreva trabalho local para sincronizar.
- Integre por PR e merge commit, depois das verificações. Não fazer force push em branches compartilhadas.
- Exclua branches concluídas apenas depois de verificar a integração. Trabalho abandonado deve continuar recuperável por referência arquivada; PR em rascunho não significa trabalho concluído.
- Segredos, bancos, sessões, arquivos de ambiente reais e credenciais não entram no Git.
- Publicação de código no GitHub não significa deploy nem homologação comercial.
