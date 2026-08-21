/**
 * Estados do horário de agenda (slot) da Consulta Online.
 *
 * Fonte: o-tal-do-marmoteiro-especificacao-funcional-regulatoria-v1.0.md, seção 14.2.
 * Garante que o mesmo horário não seja vendido definitivamente para dois pedidos
 * (regra invariante nº 8, seção 32).
 */
export enum AppointmentSlotStatus {
  AVAILABLE = 'AVAILABLE',
  HELD = 'HELD',
  BOOKED = 'BOOKED',
}
