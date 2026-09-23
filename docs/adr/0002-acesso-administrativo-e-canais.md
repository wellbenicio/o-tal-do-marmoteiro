# ADR 0002 — Acesso administrativo restrito e canais de atendimento

Status: adotado nesta implementação, 21/09/2026. Complementa ADR 0001 e baseline; não altera regras comerciais/regulatórias.

Contas `AdminUser` são provisionadas por operador com acesso ao servidor/banco, via CLI, sem signup HTTP ou aprovação por link de e-mail. A CLI valida/normaliza e-mail, pede senha sem eco e registra auditoria. Não existe administrador padrão. Primeiro papel implementado: `OWNER`; papéis não reconhecidos negam acesso. A expansão RBAC do baseline permanece necessária.

Credenciais administrativas ficam na API NestJS. Next.js atua como BFF no mesmo domínio: recebe formulário, valida Origin, chama API por rede privada com segredo de serviço e grava somente token opaco em cookie HttpOnly/SameSite, Secure em produção. O banco mantém hash SHA-256 do token aleatório de 256 bits. Verificação de sessão checa usuário ativo/papel/expiração/revogação a cada acesso ao dado. Senhas usam scrypt N=32768,r=8,p=3, sal aleatório; parâmetros segundo orientação OWASP. Redefinir senha ou desativar conta revoga sessões. Limitação de tentativas no banco persiste entre processos. Sem API/banco disponível, acesso é negado.

Layout sozinho não basta: páginas e handlers verificam sessão. O estado de gestão demonstrativo só monta após autenticação; seu conteúdo continua fictício, separado do cadastro público. Ações transacionais da prévia não são APIs operacionais de pagamento/refund.

Perguntas são conteúdo privado; a listagem administrativa mostra modalidade/canal e abre conteúdo em contexto restrito. Na futura integração com a persistência real, o conteúdo deverá ser cifrado, com tabela separada e leitura auditável, sem cópia em e-mail, Calendar, métricas ou logs. Essa persistência ainda não está implementada. O checkout local não deve receber dados íntimos reais.

Consulta síncrona: Calendar + Meet exclusivo, convidado por e-mail, link gerado pelo provedor. Pergunta assíncrona: WhatsApp, reprodução da pergunta + foto + áudio. Lembretes de consulta via WhatsApp exigem manifestação específica; não habilitam contato comercial. Integrações reais não são acionadas por estado informado pelo navegador.

Fontes técnicas consultadas:
- https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- Documentação local do Next.js 16, Authentication (DAL, layouts e handlers).
- https://developers.google.com/workspace/calendar/api/guides/create-events
- https://whatsappbusiness.com/policy/
