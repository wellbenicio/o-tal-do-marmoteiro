# Acesso administrativo, pergunta e comunicações de consulta

Demanda de 21/09/2026; continuidade da prévia. Baseline §§5,7,11,14–20,24–29 permanece integral.

## Lacunas observadas

`/gestao` e seus componentes eram públicos. `AdminUser` existia apenas no schema; não havia sessões, verificação de senha, autorização ou provisionamento. O texto da pergunta não era coletado. Google/WhatsApp/e-mails eram experiências locais, sem provedor ou confirmação confiável de pagamento. Não se pode disparar mensagem real a partir do botão de pagamento fictício.

## Decisão e implementação

- Login em `/gestao/login`; todas as páginas da gestão verificam sessão no servidor. API administrativa exige autenticação independente e permissão ativa. Não aceitar flags em localStorage nem conta de cliente como administrador.
- Contas administrativas criadas/resetadas/desativadas somente por comando local com acesso ao banco. Senha oculta, hash scrypt, sem senha padrão, seed administrativo ou inscrição pública. Sessões opacas revogáveis no Postgres, cookie HttpOnly, Secure em produção, SameSite, expiração, origem validada e limitação de tentativas persistida.
- Separar o provider/estado demonstrativo administrativo do site público. A ponte da prévia contém somente ações do próprio cliente e disponibilidade genérica, sem autorizar acesso administrativo ou integrações reais.
- Coletar pergunta antes do pagamento; mostrar conteúdo no contexto restrito de pergunta avulsa/WhatsApp. Consultas por Google Meet têm agenda própria, sem serem misturadas à fila de perguntas.
- Confirmação de consulta deve criar evento Calendar com convidado e Meet exclusivo. Só pagamento confiável no servidor pode disparar integração real. Reagendamento atualiza evento e lembretes; cancelamento efetivo remove lembretes/evento. Solicitação em análise não apaga evento.
- Lembrete WhatsApp separado da entrega da pergunta e de marketing: opt-in específico opcional, versão/data/número; sem opt-in não enviar. Usar API oficial e template aprovado, sem automação de WhatsApp Web.
- Sem credenciais externas, telas e prévias mostram pendência de conexão. Não inventar links Meet nem alegar e-mail enviado. Jobs reais devem revalidar status, versão de agenda e opt-in antes do envio; outbox idempotente e recuperação de falhas.

## Dependências externas

Google Cloud/OAuth, conta/calendário que permita Google Meet, provedor de e-mail/domínio, WhatsApp Business Platform com número e template aprovado; backend de pedidos/pagamento autenticado para fonte de eventos confiáveis. Dados da prévia continuam fictícios. Autenticação administrativa real não transforma o checkout demonstrativo em operação comercial real.
