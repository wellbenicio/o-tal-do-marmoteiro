export function formatCurrency(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date));
}

export function toDateInputValue(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING_PAYMENT: "Aguardando pagamento",
    CONFIRMED: "Confirmado",
    PAYMENT_REJECTED: "Pagamento recusado",
    EXPIRED: "Reserva expirada",
    CANCELED: "Cancelado",
    REFUNDED: "Reembolsado",
    NO_SHOW: "Não compareceu",
  };

  return labels[status] ?? status;
}
