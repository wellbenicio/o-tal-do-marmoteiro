# @marmoteiro/shared

Tipos, enums e contratos compartilhados entre `apps/api` e `apps/web`.

Cada arquivo neste pacote referencia a seção correspondente da especificação
funcional (`o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md`)
e transcreve literalmente os estados/nomes ali definidos — sem reinterpretar
ou simplificar regras de negócio (seção 38 do documento-fonte).

## Pendências arquiteturais conhecidas

A especificação **não** enumera exaustivamente todos os estados dos seguintes
domínios; isso é tratado como questão de arquitetura em aberto, e não deve ser
inventado sem revisão:

- **Pedido (Order):** a seção 10 mostra exemplos (`CONFIRMADO`, `CANCELADO`),
  mas não uma máquina de estados completa e independente do Pagamento/Atendimento.
- **Consulta/Agendamento (Appointment) como um todo:** a seção 14.2 define
  apenas o estado do *slot* de agenda (`AVAILABLE`/`HELD`/`BOOKED`); reagendamento,
  cancelamento tardio e no-show (seções 15–17) descrevem efeitos e regras
  financeiras, mas não um enum de status do agendamento em si.

Essas máquinas de estado devem ser definidas em um ADR específico antes da
implementação dos módulos `ordering` e `scheduling`.
