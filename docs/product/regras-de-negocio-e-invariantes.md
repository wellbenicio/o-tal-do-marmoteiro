# Regras de Negócio e Invariantes

Estas regras são obrigatórias para backend, frontend, banco, jobs, integrações e painel administrativo.

## 1. Cadastro

- Coletar: nome civil, nome social, data de nascimento, nome da mãe, identidade de gênero, pronomes quando informados, e-mail, telefone/WhatsApp e senha.
- E-mail e telefone podem ser alterados pelo cliente.
- Nome civil, nome social, data de nascimento, nome da mãe e identidade de gênero exigem solicitação de correção e trilha de auditoria.
- Nome social/pronomes devem ser usados na experiência quando disponíveis.

## 2. Separação de ciclos

Nunca fundir em um único status:

- pedido;
- pagamento;
- atendimento.

Cada agregado deve possuir ciclo próprio.

## 3. Pergunta avulsa

- SLA: 48 horas úteis desde a confirmação de pagamento.
- O início ocorre somente por ação explícita do admin.
- Estar na fila não significa serviço iniciado.
- Entrega exige os três elementos: identificação/pergunta + foto do jogo + áudio.
- O canal de entrega é WhatsApp.
- O admin deve marcar a entrega e o sistema deve registrar timestamp e ator.

## 4. Fila e prioridade

- `queueType` deve distinguir STANDARD e PRIORITY.
- Prioridade é atributo da fila/contratação, não status do atendimento.
- PRIORITY tem precedência sobre STANDARD aguardando.
- Um atendimento já em `IN_PROGRESS` não é interrompido.
- A prioridade não altera o prazo máximo.
- O adicional de prioridade compõe o total financeiro da contratação.
- Em reembolso integral, prioridade também é integralmente devolvida.

## 5. Calendário de horas úteis

- Deve ser configurável.
- Deve suportar dias de atendimento, janelas de expediente, feriados e exceções.
- A implementação deve calcular deadline a partir de `payment.confirmedAt`.
- Não usar simplesmente `confirmedAt + 48h`.

## 6. Agenda

- Um slot não pode ser definitivamente vendido para dois pedidos.
- Estados conceituais mínimos: AVAILABLE, HELD, BOOKED.
- Hold de checkout deve expirar.
- Pagamento aprovado converte hold em booking.
- Pagamento expirado/abandonado libera o slot.

## 7. Reagendamento

- Um único reagendamento contratual por iniciativa do consulente.
- Solicitação com antecedência mínima de 24h.
- Cliente possui 48h para escolher uma das opções apresentadas.
- Só a confirmação do novo horário consome o reagendamento.
- Reagendamento provocado pelo prestador não consome o direito.
- Segundo reagendamento do cliente não é direito contratual.

## 8. Cancelamento tardio

Quando juridicamente aplicável e fora de hipótese legal superior:

- menos de 24h: 30% retido, 70% restituído.

## 9. No-show

- tolerância de 15 minutos;
- no-show é diferente de cancelamento tardio;
- quando aplicável: 50% retido, 50% restituído;
- não concede reagendamento;
- nova consulta requer nova contratação;
- falha do prestador/plataforma ou circunstância excepcional pode impedir classificação automática.

## 10. Direito de arrependimento

- O cliente deve poder solicitar no próprio sistema.
- A solicitação gera protocolo e timestamp.
- Deve haver confirmação eletrônica.
- Regra legal obrigatória prevalece sobre retenções contratuais.
- `IN_PROGRESS` não é gatilho automático para negar arrependimento.
- Se já entregue e houver controvérsia juridicamente relevante, encaminhar a `MANUAL_REVIEW`.

## 11. Refund Policy Engine

A decisão de reembolso deve ser centralizada.

Entradas mínimas:

- modalidade;
- total pago;
- data da contratação;
- data da solicitação;
- status de execução;
- data/hora de consulta;
- reagendamentos;
- no-show;
- direito de arrependimento;
- exceções;
- decisão manual.

Saídas conceituais:

- FULL_REFUND;
- PARTIAL_REFUND;
- NO_REFUND;
- MANUAL_REVIEW_REQUIRED.

Não espalhar fórmulas de refund em controllers ou componentes de UI.

## 12. Documentos e aceite

- Documento jurídico tem versão.
- Aceite tem vínculo com versão específica.
- Contratação antiga não pode ser retroativamente vinculada a documento novo.
- Guardar evidências técnicas razoáveis de manifestação eletrônica.
- Consentimento de gravação é separado do aceite geral.

## 13. Conteúdo sensível

Conteúdo de consulta pode revelar religião, saúde, vida sexual, finanças, relacionamentos e terceiros.

- não expor como dado administrativo comum;
- aplicar controle de acesso;
- aplicar minimização;
- não armazenar por conveniência;
- acessos e operações sensíveis devem ser auditáveis.

## 14. Gravações

- nunca presumir autorização;
- consentimento específico;
- retenção operacional ordinária de até 90 dias;
- legal hold suspende exclusão;
- gravação autorizada não autoriza publicação.

## 15. Auditoria

Eventos relevantes devem registrar ator, timestamp, estado anterior, estado novo e justificativa quando aplicável.

Admin comum não deve poder apagar arbitrariamente trilha de auditoria.

## 16. Manual review e override

Automação não substitui análise nas exceções previstas.

Toda alteração manual de decisão deve preservar:

- decisão anterior;
- decisão nova;
- motivo;
- responsável;
- timestamp.

## 17. Pagamento

- provedor externo é fonte de verdade financeira por webhook/evento confiável;
- redirect do navegador não é confirmação suficiente;
- não armazenar cartão completo/CVV/credenciais bancárias.

## 18. Não-MVP

Nenhum agente pode remover requisitos deste baseline classificando-os como "V2", "nice to have" ou "fora do MVP". Priorização de entrega não equivale a exclusão de escopo.
