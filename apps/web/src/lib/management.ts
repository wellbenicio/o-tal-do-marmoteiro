import {
  DEMO_DURATION,
  DEMO_PRICE,
  appointmentTimestamp,
  defaultProfile,
  localDate,
  shiftedDate,
  type DemoBooking,
  type DemoProfile,
} from "./demo-bookings";
import { previewConfig } from "./preview-config";
import { decideRefund } from "./refund-policy";
import { previewAcceptances } from "./preview-legal";
import {
  overlapsBlock,
  type AvailabilityBlock,
  type ClientEvent,
} from "./preview-events";
export type ManagedOrder = {
  booking: DemoBooking;
  customerId: string;
  fee: number;
  feeAt?: string;
  refundedAt?: string;
};
export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  pronouns: string;
  relationshipAllowed: boolean;
  lastContactAt?: string;
  snoozedUntil?: string;
  dismissed?: boolean;
};
export type Expense = {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
};
export type Notice = {
  id: string;
  at: string;
  type:
    "payment" | "agenda" | "question" | "cancellation" | "customer" | "system";
  title: string;
  description: string;
  orderId?: string;
  read: boolean;
};
export type EmailPreview = {
  id: string;
  eventId: string;
  recipient: string;
  audience: "OWNER" | "CUSTOMER";
  subject: string;
  body: string;
  at: string;
  status: "PREVIEW" | "SIMULATED" | "FAILED";
  orderId?: string;
  attempts: number;
};
export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  action: string;
  reference: string;
  reason?: string;
};
export type ManagementSettings = {
  ownerEmail: string;
  ownerAlerts: boolean;
  dailyDigest: boolean;
  consultationReminder: number;
  returnDays: number;
  googleDemo: boolean;
  googleCalendar: string;
  includePersonalBusy: boolean;
};
export type ManagementState = {
  version: 1;
  orders: ManagedOrder[];
  customers: Customer[];
  expenses: Expense[];
  blocks: AvailabilityBlock[];
  notices: Notice[];
  emails: EmailPreview[];
  audit: AuditEntry[];
  processedEvents: string[];
  settings: ManagementSettings;
};
const paidStatuses = new Set([
  "APPROVED",
  "REFUND_PENDING",
  "PARTIALLY_REFUNDED",
  "REFUNDED",
]);
export const isPaid = (b: DemoBooking) =>
  paidStatuses.has(b.paymentStatus) && !!b.paidAt;
export function dateAt(days: number, time = "10:00") {
  return `${shiftedDate(days)}T${time}:00-03:00`;
}
export function customerFromProfile(p: DemoProfile): Customer {
  return {
    id: p.email.toLowerCase(),
    name: p.name,
    email: p.email,
    phone: p.phone,
    pronouns: p.pronouns,
    relationshipAllowed: false,
  };
}
export function addMinutes(time: string, amount: number) {
  const m = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) + amount;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
export function managementSeed(): ManagementState {
  const names = [
    "Marina Oliveira",
    "Lucas Santos",
    "Camila Costa",
    "Rafael Lima",
    "Júlia Fernandes",
    "Pedro Almeida",
    "Ana Beatriz",
    "Gabriel Nunes",
    "Beatriz Rocha",
    "Diego Martins",
    "Lívia Souza",
    "Bruno Ribeiro",
  ];
  const customers: Customer[] = names.map((name, i) => ({
    id: i === 0 ? defaultProfile.email : `cliente${i}@example.com`,
    name,
    email: i === 0 ? defaultProfile.email : `cliente${i}@example.com`,
    phone: "(85) 99999-0000",
    pronouns: "",
    relationshipAllowed: i !== 7 && i !== 10,
  }));
  const orders: ManagedOrder[] = [];
  function add(
    index: number,
    customer: number,
    days: number,
    status: DemoBooking["status"],
    modality: DemoBooking["modality"],
    time = "14:00",
    options: Partial<DemoBooking> = {},
  ) {
    const paidAt = dateAt(Math.min(days - 1, -1));
    const priorityAmount = options.priority
      ? previewConfig.question.priorityAmount
      : 0;
    const amount =
      modality === "APPOINTMENT"
        ? DEMO_PRICE
        : previewConfig.question.amount + priorityAmount;
    const booking: DemoBooking = {
      id: `ORA-${3100 + index}`,
      modality,
      question:
        modality === "QUESTION"
          ? {
              text: [
                "O que posso observar para avançar na minha vida profissional?",
                "Como posso lidar melhor com as mudanças que estou vivendo?",
                "Qual atitude pode me ajudar a organizar meus próximos passos?",
              ][index % 3],
              context:
                "Pergunta fictícia para demonstrar o atendimento assíncrono pelo WhatsApp.",
              receivedAt: paidAt,
            }
          : undefined,
      date: shiftedDate(days),
      time,
      orderStatus: "CONFIRMED",
      status,
      paymentStatus: "APPROVED",
      method: index % 4 === 0 ? "CARD" : "PIX",
      amount,
      createdAt: dateAt(Math.min(days - 2, -2)),
      completedAt: status === "COMPLETED" ? dateAt(days, time) : undefined,
      paidAt,
      rescheduleUsed: false,
      acceptances: previewAcceptances(
        ["terms", "privacy", "confidentiality"],
        paidAt,
      ),
      timeline: [
        { at: paidAt, title: "Pagamento aprovado no exemplo fictício" },
      ],
      ...options,
    };
    orders.push({
      booking,
      customerId: customers[customer].id,
      fee: booking.method === "CARD" ? 210 : 0,
      feeAt: paidAt,
      refundedAt:
        booking.paymentStatus === "REFUNDED" ? dateAt(days + 1) : undefined,
    });
  }
  for (let i = 0; i < 42; i++) {
    const customer = i % 6;
    add(
      i,
      customer,
      -1 - Math.floor(i * 1.7),
      "COMPLETED",
      i % 3 === 0 ? "QUESTION" : "APPOINTMENT",
      i % 2 ? "10:00" : "15:00",
    );
  }
  add(42, 6, -34, "COMPLETED", "APPOINTMENT");
  add(43, 7, -48, "COMPLETED", "APPOINTMENT");
  add(44, 8, -38, "COMPLETED", "APPOINTMENT");
  add(45, 9, -61, "COMPLETED", "APPOINTMENT");
  add(46, 10, -45, "COMPLETED", "APPOINTMENT");
  add(47, 11, -32, "COMPLETED", "APPOINTMENT");
  add(50, 2, 0, "BOOKED", "APPOINTMENT", "10:00");
  add(51, 1, 0, "BOOKED", "APPOINTMENT", "14:00");
  add(52, 4, 0, "BOOKED", "APPOINTMENT", "16:30");
  add(53, 5, 1, "BOOKED", "APPOINTMENT", "11:00");
  add(54, 3, 2, "BOOKED", "APPOINTMENT", "15:00");
  add(55, 2, 3, "BOOKED", "APPOINTMENT", "09:30");
  add(56, 1, 4, "BOOKED", "APPOINTMENT", "16:00");
  add(60, 4, 0, "QUEUED", "QUESTION", "09:00", {
    priority: true,
    paidAt: dateAt(-1, "09:00"),
  });
  add(61, 1, 0, "QUEUED", "QUESTION", "09:00", {
    priority: true,
    paidAt: dateAt(-1, "10:00"),
  });
  add(62, 5, 0, "QUEUED", "QUESTION", "09:00", { paidAt: dateAt(-2, "09:00") });
  add(63, 3, 0, "IN_PROGRESS", "QUESTION");
  add(64, 2, -1, "DELIVERED", "QUESTION");
  const cancellation = {
    protocol: "CAN-DEMO-3170",
    requestedAt: dateAt(0, "09:00"),
    reason: "Cliente pediu avaliação do cancelamento.",
    executionAtRequest: "BOOKED" as const,
    result: {
      decision: "MANUAL_REVIEW_REQUIRED" as const,
      amount: null,
      retained: null,
      reason: "Enquadramento aguardando análise.",
    },
  };
  add(70, 5, 2, "BOOKED", "APPOINTMENT", "10:00", {
    orderStatus: "CANCELLATION_REQUESTED",
    cancellation,
  });
  add(71, 3, -3, "CANCELED", "APPOINTMENT", "15:00", {
    orderStatus: "CANCELED",
    paymentStatus: "REFUND_PENDING",
    canceledAt: dateAt(-2),
    cancellation: {
      ...cancellation,
      protocol: "CAN-DEMO-3171",
      result: {
        decision: "FULL_REFUND",
        amount: DEMO_PRICE,
        retained: 0,
        reason:
          "Exemplo de restituição aprovada por indisponibilidade do prestador.",
      },
    },
  });
  add(72, 1, -12, "CANCELED", "APPOINTMENT", "10:00", {
    orderStatus: "CANCELED",
    paymentStatus: "REFUNDED",
    cancellation: {
      ...cancellation,
      protocol: "CAN-DEMO-3172",
      result: {
        decision: "FULL_REFUND",
        amount: DEMO_PRICE,
        retained: 0,
        reason: "Exemplo de devolução concluída.",
      },
    },
  });
  add(73, 2, 1, "NOT_STARTED", "APPOINTMENT", "16:00", {
    orderStatus: "AWAITING_PAYMENT",
    paymentStatus: "PENDING",
    paidAt: undefined,
    lockExpiresAt: new Date(Date.now() + 15 * 60000).toISOString(),
  });
  const notices: Notice[] = [
    {
      id: "notice1",
      at: dateAt(0, "09:00"),
      type: "cancellation",
      title: "Cancelamento precisa de análise",
      description: "Revise a solicitação e registre uma decisão fundamentada.",
      orderId: "ORA-3170",
      read: false,
    },
    {
      id: "notice2",
      at: dateAt(0, "08:45"),
      type: "question",
      title: "Nova pergunta prioritária",
      description: "Pagamento confirmado. A pergunta aguarda início na fila.",
      orderId: "ORA-3160",
      read: false,
    },
    {
      id: "notice3",
      at: dateAt(0, "08:30"),
      type: "payment",
      title: "Pagamento aprovado",
      description: "Uma consulta foi confirmada e entrou na agenda.",
      orderId: "ORA-3153",
      read: false,
    },
    {
      id: "notice4",
      at: dateAt(-1, "17:00"),
      type: "agenda",
      title: "Sua agenda de hoje está pronta",
      description:
        "Consulte seus horários e reserve espaço entre os encontros.",
      read: true,
    },
  ];
  return {
    version: 1,
    orders,
    customers,
    expenses: [
      {
        id: "exp1",
        title: "Plataforma de atendimento",
        category: "Software",
        date: shiftedDate(-5),
        amount: 4900,
      },
      {
        id: "exp2",
        title: "Materiais de trabalho",
        category: "Materiais",
        date: shiftedDate(-12),
        amount: 8500,
      },
      {
        id: "exp3",
        title: "Divulgação",
        category: "Marketing",
        date: shiftedDate(-20),
        amount: 12000,
      },
    ],
    blocks: [
      {
        id: "personal1",
        date: localDate(),
        start: "12:00",
        end: "13:00",
        label: "Horário pessoal · exemplo",
        source: "PERSONAL",
      },
    ],
    notices,
    emails: [],
    audit: [],
    processedEvents: [],
    settings: {
      ownerEmail: "falecom@marmoteiro.com",
      ownerAlerts: true,
      dailyDigest: true,
      consultationReminder: 60,
      returnDays: 30,
      googleDemo: false,
      googleCalendar: "O Tal do Marmoteiro",
      includePersonalBusy: true,
    },
  };
}
export function queueOrders(orders: ManagedOrder[]) {
  return orders
    .filter(
      (o) =>
        o.booking.modality === "QUESTION" &&
        o.booking.status === "QUEUED" &&
        o.booking.orderStatus === "CONFIRMED" &&
        isPaid(o.booking),
    )
    .sort(
      (a, b) =>
        Number(!!b.booking.priority) - Number(!!a.booking.priority) ||
        Date.parse(a.booking.paidAt!) - Date.parse(b.booking.paidAt!),
    );
}
export function availabilityFor(
  state: ManagementState,
  now = Date.now(),
): AvailabilityBlock[] {
  return [
    ...state.blocks.filter(
      (b) => b.source !== "PERSONAL" || state.settings.includePersonalBusy,
    ),
    ...state.orders
      .filter(
        ({ booking: b }) =>
          b.modality === "APPOINTMENT" &&
          ((b.status === "BOOKED" && b.orderStatus !== "CANCELED") ||
            (b.orderStatus === "AWAITING_PAYMENT" &&
              Date.parse(b.lockExpiresAt || "") > now)),
      )
      .map(({ booking: b }) => ({
        id: b.id,
        date: b.date,
        start: b.time,
        end: addMinutes(b.time, DEMO_DURATION),
        label: "Horário indisponível",
        source: "APPOINTMENT" as const,
      })),
  ];
}
export function canAddBlock(state: ManagementState, block: AvailabilityBlock) {
  const length =
    (Date.parse(`2000-01-01T${block.end}:00Z`) -
      Date.parse(`2000-01-01T${block.start}:00Z`)) /
    60000;
  return (
    length > 0 &&
    !overlapsBlock(availabilityFor(state), block.date, block.start, length)
  );
}
export function inPeriod(value: string | undefined, from: string, to: string) {
  if (!value) return false;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : localDate(new Date(value));
  return date >= from && date <= to;
}
export function financialMetrics(
  state: Pick<ManagementState, "orders" | "expenses">,
  from: string,
  to: string,
) {
  const paid = state.orders.filter(
    (o) => isPaid(o.booking) && inPeriod(o.booking.paidAt, from, to),
  );
  const gross = paid.reduce((s, o) => s + o.booking.amount, 0);
  const refunds = state.orders
    .filter(
      (o) =>
        ["REFUNDED", "PARTIALLY_REFUNDED"].includes(o.booking.paymentStatus) &&
        inPeriod(o.refundedAt, from, to),
    )
    .reduce((s, o) => s + (o.booking.cancellation?.result.amount || 0), 0);
  const fees = state.orders
    .filter((o) => inPeriod(o.feeAt, from, to) && isPaid(o.booking))
    .reduce((s, o) => s + o.fee, 0);
  const expenses = state.expenses
    .filter((e) => inPeriod(e.date, from, to))
    .reduce((s, e) => s + e.amount, 0);
  const pending = state.orders
    .filter(
      (o) =>
        o.booking.paymentStatus === "PENDING" &&
        inPeriod(o.booking.createdAt, from, to),
    )
    .reduce((s, o) => s + o.booking.amount, 0);
  const refundPending = state.orders
    .filter((o) => o.booking.paymentStatus === "REFUND_PENDING")
    .reduce((s, o) => s + (o.booking.cancellation?.result.amount || 0), 0);
  const created = state.orders.filter((o) =>
    inPeriod(o.booking.createdAt, from, to),
  );
  return {
    gross,
    refunds,
    fees,
    expenses,
    pending,
    refundPending,
    net: gross - refunds - fees - expenses,
    count: paid.length,
    ticket: paid.length ? Math.round(gross / paid.length) : 0,
    conversion: created.length
      ? Math.round(
          (created.filter((o) => isPaid(o.booking)).length / created.length) *
            100,
        )
      : 0,
    paid,
  };
}
export function customerStats(
  state: ManagementState,
  customer: Customer,
  now = Date.now(),
) {
  const orders = state.orders.filter((o) => o.customerId === customer.id);
  const completed = orders.filter((o) => o.booking.status === "COMPLETED");
  const last = completed
    .map((o) =>
      o.booking.completedAt
        ? Date.parse(o.booking.completedAt)
        : appointmentTimestamp(o.booking.date, o.booking.time),
    )
    .sort((a, b) => b - a)[0];
  const days =
    last === undefined
      ? null
      : Math.max(0, Math.floor((now - last) / 86400000));
  const upcoming = orders.some(
    (o) =>
      ["CONFIRMED", "CANCELLATION_REQUESTED"].includes(o.booking.orderStatus) &&
      ((o.booking.modality === "QUESTION" &&
        ["QUEUED", "IN_PROGRESS", "SUSPENDED", "DELIVERED"].includes(
          o.booking.status,
        )) ||
        (o.booking.status === "BOOKED" &&
          appointmentTimestamp(o.booking.date, o.booking.time) > now)),
  );
  const recentContact =
    customer.lastContactAt &&
    now - Date.parse(customer.lastContactAt) <
      state.settings.returnDays * 86400000;
  return {
    orders,
    completed: completed.length,
    days,
    last,
    upcoming,
    total: orders
      .filter((o) => isPaid(o.booking))
      .reduce(
        (s, o) =>
          s +
          o.booking.amount -
          (o.refundedAt ? o.booking.cancellation?.result.amount || 0 : 0),
        0,
      ),
    needsFollowup:
      days !== null &&
      days >= state.settings.returnDays &&
      !upcoming &&
      !recentContact &&
      !customer.dismissed &&
      customer.relationshipAllowed &&
      (!customer.snoozedUntil || Date.parse(customer.snoozedUntil) <= now),
  };
}
export const eventCopy: Record<
  ClientEvent["kind"],
  { title: string; type: Notice["type"]; customer: string }
> = {
  ACCOUNT_CREATED: {
    title: "Novo cadastro recebido",
    type: "customer",
    customer: "Seu espaço está pronto",
  },
  CONTACT_UPDATED: {
    title: "Contato atualizado",
    type: "customer",
    customer: "Seus dados de contato foram atualizados",
  },
  ORDER_CREATED: {
    title: "Novo pedido aguardando pagamento",
    type: "payment",
    customer: "Recebemos seu pedido",
  },
  PAYMENT_APPROVED: {
    title: "Pagamento aprovado",
    type: "payment",
    customer: "Pagamento confirmado",
  },
  CANCELLATION_REQUESTED: {
    title: "Nova solicitação de cancelamento",
    type: "cancellation",
    customer: "Recebemos sua solicitação de cancelamento",
  },
  RESCHEDULE_REQUESTED: {
    title: "Reagendamento solicitado",
    type: "agenda",
    customer: "Suas opções de reagendamento estão disponíveis",
  },
  RESCHEDULE_CONFIRMED: {
    title: "Reagendamento confirmado",
    type: "agenda",
    customer: "Seu novo horário está confirmado",
  },
  CUSTOMER_REQUEST: {
    title: "Nova solicitação do consulente",
    type: "customer",
    customer: "Recebemos sua solicitação",
  },
};
export function withCommunication(
  state: ManagementState,
  event: {
    id: string;
    at: string;
    title: string;
    customerTitle: string;
    description: string;
    type: Notice["type"];
    customer: Customer;
    orderId?: string;
  },
): ManagementState {
  const notice: Notice = {
    id: event.id,
    at: event.at,
    type: event.type,
    title: event.title,
    description: event.description,
    orderId: event.orderId,
    read: false,
  };
  const audiences: EmailPreview["audience"][] = state.settings.ownerAlerts
    ? ["OWNER", "CUSTOMER"]
    : ["CUSTOMER"];
  const reference = event.orderId ? `Referência: ${event.orderId}.\n` : "";
  const emails = audiences.map((audience) => {
    const greeting =
      audience === "OWNER"
        ? "Olá, Marmoteiro."
        : `Olá, ${event.customer.name.split(" ")[0]}.`;
    return {
      id: `${event.id}:${audience}`,
      eventId: event.id,
      at: event.at,
      recipient:
        audience === "OWNER" ? state.settings.ownerEmail : event.customer.email,
      audience,
      subject: audience === "OWNER" ? event.title : event.customerTitle,
      body: `${greeting}\n\n${event.description}\n${reference}\nOs detalhes ficam na sua área. Por privacidade, não incluímos o conteúdo da consulta nesta mensagem.\n\nO Tal do Marmoteiro\nfalecom@marmoteiro.com\n\n[Prévia: nenhum e-mail foi enviado.]`,
      status: "PREVIEW" as const,
      orderId: event.orderId,
      attempts: 0,
    };
  });
  return {
    ...state,
    notices: [notice, ...state.notices],
    emails: [...emails, ...state.emails],
  };
}
function clientEventDescription(event: ClientEvent) {
  const booking = event.booking;
  let service = "";
  if (booking?.modality === "APPOINTMENT") {
    service = `Atendimento: ${booking.date} às ${booking.time} (Brasília).`;
  } else if (booking?.modality === "QUESTION") {
    service = "Modalidade: pergunta avulsa.";
  }
  const protocol = event.reference ? `Protocolo: ${event.reference}.` : "";
  let channels = "";
  if (
    booking?.modality === "APPOINTMENT" &&
    event.kind === "PAYMENT_APPROVED"
  ) {
    const reminders = booking.whatsappReminderConsent?.granted
      ? "autorizados para esta consulta; envio não conectado."
      : "não ativados pelo consulente.";
    channels = `\n\nConsulta por videochamada: o convite Google Calendar e o link Google Meet aguardam a conexão com o provedor. Nenhum link real foi gerado nesta demonstração.\nLembretes pelo WhatsApp: ${reminders}`;
  }
  return `${eventCopy[event.kind].customer}. ${service} ${protocol}${channels}`;
}
export function applyClientEvent(
  state: ManagementState,
  event: ClientEvent,
): ManagementState {
  if (state.processedEvents.includes(event.id)) return state;
  const p = customerFromProfile(event.profile);
  const known = state.customers.find((c) => c.id === p.id);
  const customer = {
    ...p,
    relationshipAllowed: known?.relationshipAllowed ?? false,
    ...(known
      ? {
          lastContactAt: known.lastContactAt,
          snoozedUntil: known.snoozedUntil,
          dismissed: known.dismissed,
        }
      : {}),
  };
  const found = state.orders.find((o) => o.booking.id === event.booking?.id);
  let next = {
    ...state,
    processedEvents: [...state.processedEvents, event.id],
    customers: [customer, ...state.customers.filter((c) => c.id !== p.id)],
    orders: event.booking
      ? [
          {
            booking: event.booking,
            customerId: p.id,
            fee: found?.fee ?? 0,
            feeAt: found?.feeAt,
            refundedAt: found?.refundedAt,
          },
          ...state.orders.filter((o) => o.booking.id !== event.booking!.id),
        ]
      : state.orders,
  };
  const copy = eventCopy[event.kind];
  next = withCommunication(next, {
    id: event.id,
    at: event.at,
    title: copy.title,
    customerTitle: copy.customer,
    type: copy.type,
    customer,
    orderId: event.booking?.id,
    description: clientEventDescription(event),
  });
  return next;
}
export function csvCell(value: string | number) {
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function financeCsv(state: ManagementState, from: string, to: string) {
  const rows: (string | number)[][] = [
    ["Data", "Tipo", "Referência", "Valor (BRL)"],
  ];
  for (const o of state.orders) {
    const b = o.booking;
    if (isPaid(b) && inPeriod(b.paidAt, from, to))
      rows.push([
        localDate(new Date(b.paidAt!)),
        "Recebimento",
        b.id,
        b.amount / 100,
      ]);
    if (o.refundedAt && inPeriod(o.refundedAt, from, to))
      rows.push([
        localDate(new Date(o.refundedAt)),
        "Reembolso",
        b.id,
        -(b.cancellation?.result.amount || 0) / 100,
      ]);
    if (o.fee && isPaid(b) && inPeriod(o.feeAt, from, to))
      rows.push([localDate(new Date(o.feeAt!)), "Taxa", b.id, -o.fee / 100]);
  }
  for (const e of state.expenses.filter((e) => inPeriod(e.date, from, to)))
    rows.push([e.date, "Despesa", e.title, -e.amount / 100]);
  return "\uFEFF" + rows.map((r) => r.map(csvCell).join(";")).join("\r\n");
}

// Provider-caused changes never consume the customer's own reschedule allowance.
export function providerAgendaChange(
  b: DemoBooking,
  action: "reschedule" | "cancel",
  reason: string,
  now = Date.now(),
): DemoBooking | null {
  if (
    b.modality !== "APPOINTMENT" ||
    b.status !== "BOOKED" ||
    b.orderStatus !== "CONFIRMED" ||
    b.paymentStatus !== "APPROVED" ||
    appointmentTimestamp(b.date, b.time) <= now ||
    reason.trim().length < 10
  )
    return null;
  const at = new Date(now).toISOString();
  if (action === "reschedule") {
    if (b.rescheduleRequest?.status === "OPEN") return null;
    return {
      ...b,
      rescheduleRequest: {
        id: `REA-${b.id}-${now}`,
        requestedAt: at,
        optionsPresentedAt: at,
        expiresAt: new Date(now + 48 * 3600000).toISOString(),
        originalDate: b.date,
        originalTime: b.time,
        causedByProvider: true,
        status: "OPEN",
      },
    };
  }
  return {
    ...b,
    orderStatus: "CANCELED",
    status: "CANCELED",
    paymentStatus: "REFUND_PENDING",
    canceledAt: at,
    cancellation: {
      protocol: `CAN-${b.id}-${now}`,
      requestedAt: at,
      executionAtRequest: b.status,
      reason: reason.trim(),
      result: decideRefund({
        modality: b.modality,
        totalPaid: b.amount,
        contractedAt: b.createdAt,
        requestedAt: at,
        execution: b.status,
        withdrawal: "UNDETERMINED",
        providerResponsible: true,
      }),
    },
  };
}
