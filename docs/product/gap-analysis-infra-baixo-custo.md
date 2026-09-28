# Lacunas para publicação e infraestrutura de baixo custo

Data: 22/09/2026. Demanda: publicar a prévia existente, adotar Firebase para identidade/perfis e preparar operação comercial com cerca de 50 consulentes e um administrador. O baseline completo permanece obrigatório.

## Código e ambiente encontrados

- Next.js 16/React 19, NestJS, Prisma 7/PostgreSQL, monorepo npm; admin e sessões reais no banco local. Cadastro de cliente, pedidos e financeiro ainda usam demonstração no navegador.
- Firebase ainda não está integrado. Não há projeto remoto vinculado, CLI de hospedagem autenticada ou banco remoto configurado neste ambiente. Credenciais administrativas locais não implicam conta criada em produção.
- Não há Dockerfiles de produção, configuração de build remoto nem CI. A prévia não foi publicada durante esta análise.
- BullMQ/Redis constam da composição NestJS, mas nenhuma fila os utiliza. A outbox atual está no PostgreSQL.
- O worker usa timer a cada 15 segundos quando habilitado. CPU alocada só durante requisições não garante execução desse timer; consultas constantes também podem impedir o banco de pausar.
- A verificação administrativa no navegador consulta a sessão a cada 30 segundos mesmo com a aba oculta. O pool PostgreSQL não tem limite explícito por instância.
- Integrações de Calendar/Meet e WhatsApp têm adaptadores e testes, mas não estão conectadas ao checkout confiável nem habilitadas. O provedor de e-mail comercial ainda precisa ser escolhido/configurado.

## Direção técnica

1. Preparar builds portáveis de web/API e configuração de Firebase App Hosting; não publicar apenas arquivos estáticos, pois `/gestao` depende de verificação no servidor.
2. Manter monólito modular e PostgreSQL/Prisma. Firebase Authentication será a fonte de identidade; perfil cadastral protegido, contratos e transações permanecem no banco relacional. UID fará a ligação futura. Nenhum papel administrativo virá de campos editáveis pelo cliente.
3. Retirar Redis da execução obrigatória enquanto não há consumidores. Preservar outbox durável, deduplicação, revalidação e auditoria; não substituir jobs por tarefas que podem morrer depois da resposta HTTP.
4. Oferecer execução da outbox por requisição interna autenticada e aguardar sua conclusão antes da resposta. Timer será opção explícita apenas para processo persistente. Não habilitar envios neste deploy de prévia.
5. Limitar conexões e instâncias, permitir pausa em zero, evitar verificação periódica em aba oculta e versionar infraestrutura sem segredos.
6. Documentar custo, componentes atuais/propostos, fluxos, contratos, dependências, passos de deploy/rollback e sequência de ativação comercial.

## Limites desta etapa

Não migrar silenciosamente contas locais para Firebase; não habilitar checkout real ou mensagens com dados fictícios; não criar faturamento ou contratar plano pago sem a escolha do responsável. O deploy exige autenticação do proprietário, destino remoto e banco. Retenção, termos publicáveis, concorrência de agenda, webhooks e demais lacunas do baseline continuam no mapa de implementação.
