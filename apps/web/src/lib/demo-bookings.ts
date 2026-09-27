import type { PaymentStatus as CanonicalPaymentStatus } from "@marmoteiro/shared";
import { previewConfig } from "./preview-config";
import type { LegalAcceptance } from "./preview-legal";
import { previewAcceptances } from "./preview-legal";
import type { RefundResult } from "./refund-policy";
export const DEMO_PRICE = previewConfig.appointment.amount;
export const DEMO_DURATION = previewConfig.appointment.durationMinutes;
export type BookingStatus =
  | "NOT_STARTED"
  | "BOOKED"
  | "COMPLETED"
  | "CANCELED"
  | "QUEUED"
  | "IN_PROGRESS"
  | "DELIVERED"
  | "NO_SHOW"
  | "SUSPENDED";
export type OrderStatus =
  | "AWAITING_PAYMENT"
  | "CONFIRMED"
  | "CANCELLATION_REQUESTED"
  | "CANCELED"
  | "EXPIRED";
export type PaymentStatus = `${CanonicalPaymentStatus}`;
export type DemoProfile = {
  name: string;
  legalName: string;
  socialName: string;
  birthDate: string;
  motherName: string;
  genderIdentity: string;
  pronouns: string;
  email: string;
  phone: string;
};
export type DemoRequest = {
  id: string;
  type: "CORRECTION" | "PRIVACY";
  title: string;
  field?: string;
  currentValue?: string;
  requestedValue?: string;
  reason: string;
  requestedAt: string;
  status: "RECEIVED";
};
export type RescheduleRequest = {
  id: string;
  requestedAt: string;
  optionsPresentedAt: string;
  expiresAt: string;
  originalDate: string;
  originalTime: string;
  causedByProvider: boolean;
  status: "OPEN" | "CONFIRMED" | "EXPIRED";
  confirmedAt?: string;
};
export type DemoBooking = {
  id: string;
  modality: "APPOINTMENT" | "QUESTION";
  date: string;
  time: string;
  orderStatus: OrderStatus;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  method: "PIX" | "CARD" | "BOLETO";
  amount: number;
  createdAt: string;
  paidAt?: string;
  priority?: boolean;
  question?: { text: string; context?: string; receivedAt: string };
  whatsappReminderConsent?: {
    granted: boolean;
    decidedAt: string;
    phone: string;
    version: string;
  };
  lockExpiresAt?: string;
  canceledAt?: string;
  completedAt?: string;
  previousDate?: string;
  previousTime?: string;
  rescheduleUsed: boolean;
  rescheduleRequest?: RescheduleRequest;
  acceptances: LegalAcceptance[];
  recordingConsent?: { granted: boolean; decidedAt: string; version: string };
  cancellation?: {
    protocol: string;
    requestedAt: string;
    reason: string;
    executionAtRequest: BookingStatus;
    result: RefundResult;
  };
  timeline: { at: string; title: string }[];
  note?: { title: string; topics: string[]; text: string };
};
export const bookingLabels: Record<BookingStatus, string> = {
  BOOKED: "Agendada",
  COMPLETED: "Realizada",
  NOT_STARTED: "Não iniciado",
  CANCELED: "Cancelado",
  QUEUED: "Na fila",
  IN_PROGRESS: "Em atendimento",
  DELIVERED: "Entregue",
  NO_SHOW: "Não compareceu",
  SUSPENDED: "Execução suspensa",
};
export const orderLabels: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  CONFIRMED: "Confirmado",
  CANCELLATION_REQUESTED: "Cancelamento em análise",
  CANCELED: "Cancelado",
  EXPIRED: "Expirado",
};
export const paymentLabels: Record<PaymentStatus, string> = {
  APPROVED: "Pago",
  PENDING: "Pendente",
  REFUND_PENDING: "Reembolso pendente",
  REFUNDED: "Reembolsado",
  PARTIALLY_REFUNDED: "Reembolso parcial",
  CANCELLED: "Sem cobrança",
  REJECTED: "Não aprovado",
};
export const methodLabels = {
  PIX: "Pix",
  CARD: "Cartão de crédito",
  BOLETO: "Boleto",
};
export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(date);
}
export function shiftedDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localDate(d);
}
export function prettyDate(date: string, short = false) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: short ? "short" : "long",
    year: short ? undefined : "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(date + "T12:00:00-03:00"));
}
export function prettyTimestamp(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}
export function money(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100);
}
export function appointmentTimestamp(date: string, time: string) {
  return new Date(`${date}T${time}:00-03:00`).getTime();
}
export function appointmentsOverlap(
  b: DemoBooking,
  date: string,
  time: string,
) {
  return (
    Math.abs(
      appointmentTimestamp(b.date, b.time) - appointmentTimestamp(date, time),
    ) <
    DEMO_DURATION * 60000
  );
}
export function canManage(b: DemoBooking) {
  return (
    !b.cancellation && ["CONFIRMED", "AWAITING_PAYMENT"].includes(b.orderStatus)
  );
}
export function rescheduleEligibility(
  b: DemoBooking,
  now = Date.now(),
): { allowed: boolean; reason: string } {
  if (
    b.modality !== "APPOINTMENT" ||
    b.status !== "BOOKED" ||
    b.orderStatus !== "CONFIRMED"
  )
    return {
      allowed: false,
      reason: "Disponível para consulta agendada e confirmada.",
    };
  const r = b.rescheduleRequest;
  if (r?.status === "OPEN")
    return {
      allowed: Date.parse(r.expiresAt) > now,
      reason:
        Date.parse(r.expiresAt) > now
          ? "Escolha uma das opções no prazo de 48 horas."
          : "O prazo desta solicitação expirou. O horário original foi preservado; procure atendimento para avaliar o caso.",
    };
  if (r?.status === "EXPIRED")
    return {
      allowed: false,
      reason:
        "Solicitação expirada. O direito não foi consumido; procure atendimento para avaliar as condições de uma nova solicitação.",
    };
  if (b.rescheduleUsed)
    return {
      allowed: false,
      reason: "O único reagendamento por sua iniciativa já foi utilizado.",
    };
  if (appointmentTimestamp(b.date, b.time) - now < 24 * 3600000)
    return {
      allowed: false,
      reason:
        "O reagendamento deve ser solicitado com pelo menos 24 horas de antecedência.",
    };
  return {
    allowed: true,
    reason:
      "Um reagendamento sem custo; o uso só é consumido após confirmar o novo horário.",
  };
}
export function normalizeBookings(
  bookings: DemoBooking[],
  now = Date.now(),
): DemoBooking[] {
  return bookings.map((b) => {
    if (
      b.orderStatus === "AWAITING_PAYMENT" &&
      (!b.lockExpiresAt || Date.parse(b.lockExpiresAt) <= now)
    )
      return {
        ...b,
        orderStatus: "EXPIRED",
        status: "CANCELED",
        paymentStatus: "CANCELLED",
      };
    if (
      b.rescheduleRequest?.status === "OPEN" &&
      Date.parse(b.rescheduleRequest.expiresAt) <= now
    )
      return {
        ...b,
        rescheduleRequest: { ...b.rescheduleRequest, status: "EXPIRED" },
      };
    return b;
  });
}
export const defaultProfile: DemoProfile = {
  name: "Marina",
  legalName: "Marina Oliveira",
  socialName: "Marina",
  birthDate: "1994-06-15",
  motherName: "Ana Oliveira",
  genderIdentity: "Mulher",
  pronouns: "ela/dela",
  email: "marina@example.com",
  phone: "(85) 99999-0000",
};
export function demoBookings(): DemoBooking[] {
  const at = new Date().toISOString();
  const base = {
    modality: "APPOINTMENT" as const,
    method: "PIX" as const,
    amount: DEMO_PRICE,
    createdAt: at,
    paidAt: at,
    rescheduleUsed: false,
    acceptances: previewAcceptances(
      ["terms", "privacy", "confidentiality"],
      at,
    ),
    timeline: [
      { at, title: "Exemplo fictício carregado para explorar a interface" },
    ],
  };
  return [
    {
      ...base,
      id: "MRM-2401",
      date: shiftedDate(2),
      time: "14:00",
      orderStatus: "CONFIRMED",
      status: "BOOKED",
      paymentStatus: "APPROVED",
      recordingConsent: {
        granted: false,
        decidedAt: at,
        version: "PREVIA-BASELINE-2026-09-21",
      },
    },
    {
      ...base,
      id: "MRM-2386",
      date: shiftedDate(-7),
      time: "10:30",
      orderStatus: "CONFIRMED",
      status: "COMPLETED",
      paymentStatus: "APPROVED",
      note: {
        title: "Sobre caminhos e novos começos",
        topics: ["Momento atual", "Trabalho e escolhas", "Próximos passos"],
        text: "Exemplo fictício de anotações para a validação visual. Não representa o conteúdo de nenhuma consulta real.",
      },
    },
    {
      ...base,
      id: "MRM-2372",
      date: shiftedDate(-14),
      time: "16:00",
      orderStatus: "CONFIRMED",
      status: "COMPLETED",
      paymentStatus: "APPROVED",
      note: {
        title: "Um olhar para os relacionamentos",
        topics: ["Relacionamentos", "Autoconhecimento"],
        text: "Os materiais reais dependerão de compartilhamento autorizado e acesso restrito à pessoa atendida.",
      },
    },
    {
      ...base,
      id: "MRM-2360",
      date: shiftedDate(4),
      time: "11:00",
      orderStatus: "CANCELED",
      status: "CANCELED",
      paymentStatus: "REFUND_PENDING",
      canceledAt: at,
      cancellation: {
        protocol: "CAN-DEMO-2360",
        requestedAt: at,
        reason: "Exemplo de restituição integral já aprovada",
        executionAtRequest: "BOOKED",
        result: {
          decision: "FULL_REFUND",
          amount: DEMO_PRICE,
          retained: 0,
          reason:
            "Cenário fictício de direito aplicável reconhecido; devolução em processamento.",
        },
      },
    },
    {
      ...base,
      id: "MRM-2319",
      date: shiftedDate(-25),
      time: "15:30",
      orderStatus: "CANCELED",
      status: "CANCELED",
      paymentStatus: "REFUNDED",
      method: "CARD",
      canceledAt: at,
      cancellation: {
        protocol: "CAN-DEMO-2319",
        requestedAt: at,
        reason: "",
        executionAtRequest: "BOOKED",
        result: {
          decision: "FULL_REFUND",
          amount: DEMO_PRICE,
          retained: 0,
          reason: "Exemplo fictício de restituição concluída.",
        },
      },
    },
    {
      ...base,
      id: "MRM-P042",
      question: {
        text: "Qual postura pode me ajudar a dar o próximo passo na minha vida profissional?",
        context:
          "Exemplo fictício: estou avaliando novos caminhos de trabalho.",
        receivedAt: at,
      },
      modality: "QUESTION",
      date: localDate(),
      time: "09:00",
      priority: true,
      amount:
        previewConfig.question.amount + previewConfig.question.priorityAmount,
      orderStatus: "CONFIRMED",
      status: "QUEUED",
      paymentStatus: "APPROVED",
    },
  ];
}
