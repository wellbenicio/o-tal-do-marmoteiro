import assert from "node:assert/strict";
import { test } from "node:test";
import {
  managementSeed,
  financialMetrics,
  queueOrders,
  availabilityFor,
  canAddBlock,
  customerStats,
  applyClientEvent,
  financeCsv,
  csvCell,
  type ManagementState,
  type ManagedOrder,
} from "./management";
import {
  defaultProfile,
  demoBookings,
  type DemoBooking,
} from "./demo-bookings";
import { overlapsBlock, type ClientEvent } from "./preview-events";
const now = Date.parse("2026-09-21T15:00:00Z");
function empty(): ManagementState {
  return {
    ...managementSeed(),
    orders: [],
    expenses: [],
    blocks: [],
    notices: [],
    emails: [],
    audit: [],
    processedEvents: [],
  };
}
function order(
  id: string,
  patch: Partial<DemoBooking> = {},
  extra: Partial<ManagedOrder> = {},
): ManagedOrder {
  return {
    booking: {
      id,
      modality: "APPOINTMENT",
      date: "2026-09-25",
      time: "14:00",
      status: "BOOKED",
      orderStatus: "CONFIRMED",
      paymentStatus: "APPROVED",
      method: "PIX",
      amount: 7000,
      createdAt: "2026-09-01T12:00:00Z",
      paidAt: "2026-09-02T12:00:00Z",
      acceptances: [],
      timeline: [],
      rescheduleUsed: false,
      ...patch,
    },
    fee: 0,
    customerId: defaultProfile.email.toLowerCase(),
    ...extra,
  };
}
const cancellation = {
  protocol: "CAN-1",
  requestedAt: "2026-09-05T12:00:00Z",
  executionAtRequest: "BOOKED" as const,
  reason: "Exemplo",
  result: {
    decision: "FULL_REFUND" as const,
    amount: 7000,
    retained: 0,
    reason: "Exemplo",
  },
};
test("cash metrics recognize original payment and actual refund on their own dates", () => {
  const s = empty();
  s.orders = [
    order("paid", {}, { fee: 200, feeAt: "2026-09-02T12:00:00Z" }),
    order(
      "refunded",
      {
        status: "CANCELED",
        orderStatus: "CANCELED",
        paymentStatus: "REFUNDED",
        paidAt: "2026-08-29T12:00:00Z",
        cancellation,
      },
      { refundedAt: "2026-09-04T12:00:00Z" },
    ),
    order("refundPending", {
      status: "CANCELED",
      paymentStatus: "REFUND_PENDING",
      cancellation,
    }),
    order("unpaid", {
      status: "NOT_STARTED",
      orderStatus: "AWAITING_PAYMENT",
      paymentStatus: "PENDING",
      paidAt: undefined,
    }),
  ];
  s.expenses = [
    {
      id: "expense",
      title: "Material",
      category: "Operação",
      date: "2026-09-05",
      amount: 1000,
    },
  ];
  const m = financialMetrics(s, "2026-09-01", "2026-09-30");
  assert.equal(m.gross, 14000);
  assert.equal(m.refunds, 7000);
  assert.equal(m.refundPending, 7000);
  assert.equal(m.pending, 7000);
  assert.equal(m.fees, 200);
  assert.equal(m.net, 5800);
  assert.equal(m.ticket, 7000);
  assert.equal(m.conversion, 75);
  assert.equal(financialMetrics(s, "2026-08-01", "2026-08-31").gross, 7000);
  assert.equal(financialMetrics(s, "2026-08-01", "2026-08-31").refunds, 0);
});
test("financial day boundaries use Brasília and empty periods have zero ratios", () => {
  const s = empty();
  s.orders = [order("late", { paidAt: "2026-09-02T01:00:00Z" })];
  assert.equal(financialMetrics(s, "2026-09-01", "2026-09-01").gross, 7000);
  assert.equal(financialMetrics(s, "2026-09-02", "2026-09-02").gross, 0);
  assert.equal(financialMetrics(s, "2020-01-01", "2020-01-31").conversion, 0);
});
test("question queue is paid only, priority first then payment FIFO, never includes already started or suspended", () => {
  const q = (
    id: string,
    priority: boolean,
    paidAt: string,
    status: DemoBooking["status"] = "QUEUED",
  ) => order(id, { modality: "QUESTION", status, priority, paidAt });
  const rows = [
    q("regular", false, "2026-09-01T12:00:00Z"),
    q("priority-later", true, "2026-09-03T12:00:00Z"),
    q("priority-first", true, "2026-09-02T12:00:00Z"),
    q("started", true, "2026-09-01T12:00:00Z", "IN_PROGRESS"),
    q("suspended", true, "2026-09-01T12:00:00Z", "SUSPENDED"),
    order("unpaid", {
      modality: "QUESTION",
      status: "QUEUED",
      paymentStatus: "PENDING",
      paidAt: undefined,
    }),
  ];
  assert.deepEqual(
    queueOrders(rows).map((o) => o.booking.id),
    ["priority-first", "priority-later", "regular"],
  );
  assert.equal(rows[0].booking.id, "regular");
});
test("availability includes cancellation under review and live holds, releases expired holds and canceled consultations", () => {
  const s = empty();
  s.orders = [
    order("confirmed"),
    order("review", { orderStatus: "CANCELLATION_REQUESTED" }),
    order("canceled", { orderStatus: "CANCELED", status: "CANCELED" }),
    order("hold", {
      status: "NOT_STARTED",
      orderStatus: "AWAITING_PAYMENT",
      paymentStatus: "PENDING",
      lockExpiresAt: new Date(now + 1000).toISOString(),
    }),
    order("expired", {
      status: "NOT_STARTED",
      orderStatus: "AWAITING_PAYMENT",
      paymentStatus: "PENDING",
      lockExpiresAt: new Date(now - 1).toISOString(),
    }),
  ];
  assert.deepEqual(
    availabilityFor(s, now).map((b) => b.id),
    ["confirmed", "review", "hold"],
  );
});
test("blocks prevent any overlap, allow boundary adjacency, and honor the rescheduled order exception", () => {
  const s = empty();
  s.orders = [order("existing")];
  assert.equal(overlapsBlock(availabilityFor(s), "2026-09-25", "13:45"), true);
  assert.equal(overlapsBlock(availabilityFor(s), "2026-09-25", "14:30"), true);
  assert.equal(
    overlapsBlock(availabilityFor(s), "2026-09-25", "14:00", 60, "existing"),
    false,
  );
  const block = {
    id: "block",
    date: "2026-09-25",
    start: "14:15",
    end: "15:00",
    label: "Pausa",
    source: "MANUAL" as const,
  };
  assert.equal(canAddBlock(s, block), false);
  assert.equal(
    canAddBlock(s, { ...block, start: "15:00", end: "16:00" }),
    true,
  );
  assert.equal(canAddBlock(s, { ...block, end: "14:00" }), false);
});
test("personal availability can be excluded without excluding manual blocks", () => {
  const s = empty();
  s.settings.includePersonalBusy = false;
  s.blocks = [
    {
      id: "personal",
      date: "2026-09-25",
      start: "10:00",
      end: "11:00",
      label: "Privado",
      source: "PERSONAL",
    },
    {
      id: "manual",
      date: "2026-09-25",
      start: "11:00",
      end: "12:00",
      label: "Pausa",
      source: "MANUAL",
    },
  ];
  assert.deepEqual(
    availabilityFor(s).map((b) => b.id),
    ["manual"],
  );
});
test("followups use completed services and exclude upcoming appointments, contact refusal, snoozes and recent contact", () => {
  const s = empty();
  const c = {
    ...s.customers[0],
    id: defaultProfile.email.toLowerCase(),
    relationshipAllowed: true,
  };
  s.orders = [
    order("completed", { date: "2026-08-01", status: "COMPLETED" }),
    order("cancelled-recent", {
      date: "2026-09-20",
      status: "CANCELED",
      orderStatus: "CANCELED",
    }),
  ];
  assert.equal(customerStats(s, c, now).needsFollowup, true);
  assert.equal(customerStats(s, c, now).completed, 1);
  for (const patch of [
    { relationshipAllowed: false },
    { dismissed: true },
    { lastContactAt: "2026-09-20T12:00:00Z" },
    { snoozedUntil: "2026-09-25T12:00:00Z" },
  ])
    assert.equal(
      customerStats(s, { ...c, ...patch }, now).needsFollowup,
      false,
    );
  s.orders.push(order("future"));
  assert.equal(customerStats(s, c, now).needsFollowup, false);
  s.orders = [order("never-completed", { status: "CANCELED" })];
  assert.equal(customerStats(s, c, now).needsFollowup, false);
});
test("client events update projections once and generate minimal owner/customer email previews without intimate content", () => {
  const s = empty();
  const b = order("new", {
    note: {
      title: "Intimate title",
      topics: ["secret"],
      text: "private reading content",
    },
  }).booking;
  const event: ClientEvent = {
    id: "event",
    at: new Date(now).toISOString(),
    kind: "PAYMENT_APPROVED",
    profile: defaultProfile,
    booking: b,
  };
  const next = applyClientEvent(s, event);
  assert.equal(next.orders.length, 1);
  assert.equal(next.notices.length, 1);
  assert.equal(next.notices[0].orderId, "new");
  assert.equal(next.emails.length, 2);
  assert.ok(
    next.emails.every(
      (e) =>
        e.status === "PREVIEW" &&
        !e.body.includes("private reading content") &&
        !e.body.includes("Intimate title"),
    ),
  );
  assert.equal(applyClientEvent(next, event), next);
  const quiet = applyClientEvent(
    { ...s, settings: { ...s.settings, ownerAlerts: false } },
    event,
  );
  assert.equal(quiet.emails.length, 1);
  assert.equal(quiet.emails[0].audience, "CUSTOMER");
});
test("communication text preserves greetings, service details and protocols", () => {
  const cases: { booking?: DemoBooking; description: string }[] = [
    { description: "Recebemos seu pedido.  Protocolo: PROTO-1." },
    {
      booking: order("appointment").booking,
      description:
        "Recebemos seu pedido. Atendimento: 2026-09-25 às 14:00 (Brasília). Protocolo: PROTO-1.",
    },
    {
      booking: order("question", { modality: "QUESTION" }).booking,
      description:
        "Recebemos seu pedido. Modalidade: pergunta avulsa. Protocolo: PROTO-1.",
    },
  ];
  for (const scenario of cases) {
    const next = applyClientEvent(empty(), {
      id: "communication",
      kind: "ORDER_CREATED",
      at: new Date(now).toISOString(),
      profile: defaultProfile,
      reference: "PROTO-1",
      booking: scenario.booking,
    });
    assert.equal(next.notices[0].description, scenario.description);
    assert.ok(next.emails[0].body.startsWith("Olá, Marmoteiro.\n\n"));
    assert.ok(
      next.emails[1].body.startsWith(
        `Olá, ${defaultProfile.name.split(" ")[0]}.\n\n`,
      ),
    );
    assert.equal(
      next.emails[1].body.includes("Referência:"),
      !!scenario.booking,
    );
    assert.equal(next.emails[1].body.includes("Google Meet"), false);
  }
});
test("CSV matches cash ledger, excludes unpaid fees, escapes textual formulas and preserves numeric negative amounts", () => {
  const s = empty();
  s.orders = [
    order("paid", {}, { fee: 200, feeAt: "2026-09-02T12:00:00Z" }),
    order(
      "pending",
      { paymentStatus: "PENDING", paidAt: undefined },
      { fee: 999, feeAt: "2026-09-02T12:00:00Z" },
    ),
  ];
  s.expenses = [
    {
      id: "1",
      date: "2026-09-03",
      category: "Other",
      title: '=HYPERLINK("malicious")',
      amount: 1000,
    },
  ];
  const csv = financeCsv(s, "2026-09-01", "2026-09-30");
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(!csv.includes("pending"));
  assert.ok(csv.includes('"-10"'));
  assert.ok(csv.includes("'=HYPERLINK"));
  assert.equal(csvCell("-unsafe"), '"\'-unsafe"');
  assert.equal(csvCell(-10), '"-10"');
});
test("question return reminder uses actual completion instead of request date", () => {
  const s = empty();
  const c = {
    ...s.customers[0],
    id: defaultProfile.email.toLowerCase(),
    relationshipAllowed: true,
  };
  s.orders = [
    order("q", {
      modality: "QUESTION",
      status: "COMPLETED",
      date: "2026-08-01",
      completedAt: "2026-09-20T12:00:00Z",
    }),
  ];
  const result = customerStats(s, c, now);
  assert.equal(result.days, 1);
  assert.equal(result.needsFollowup, false);
});
test("provider agenda changes preserve rescheduling rights and fully refund unperformed services", async () => {
  const { providerAgendaChange } = await import("./management");
  const b = order("provider", { rescheduleUsed: true }).booking;
  const moved = providerAgendaChange(
    b,
    "reschedule",
    "Indisponibilidade pessoal",
    now,
  )!;
  assert.equal(moved.rescheduleUsed, true);
  assert.equal(moved.date, b.date);
  assert.equal(moved.rescheduleRequest?.causedByProvider, true);
  assert.equal(
    Date.parse(moved.rescheduleRequest!.expiresAt) - now,
    48 * 3600000,
  );
  assert.equal(
    providerAgendaChange(moved, "reschedule", "Outra alteração", now),
    null,
  );
  const canceled = providerAgendaChange(
    b,
    "cancel",
    "Indisponibilidade pessoal",
    now,
  )!;
  assert.equal(canceled.paymentStatus, "REFUND_PENDING");
  assert.equal(canceled.cancellation!.result.amount, b.amount);
  assert.equal(canceled.cancellation!.result.retained, 0);
  assert.equal(
    providerAgendaChange(
      { ...b, status: "COMPLETED" },
      "cancel",
      "Atendimento já realizado",
      now,
    ),
    null,
  );
  assert.equal(providerAgendaChange(b, "cancel", "", now), null);
});

test("client and management examples use approved prices and refund the full original amount", () => {
  const bookings = [
    ...demoBookings(),
    ...managementSeed().orders.map((order) => order.booking),
  ];
  assert.ok(bookings.some((b) => b.modality === "QUESTION" && !b.priority));
  for (const booking of bookings) {
    const expected =
      booking.modality === "APPOINTMENT"
        ? 5000
        : 1000 + (booking.priority ? 2000 : 0);
    assert.equal(booking.amount, expected, booking.id);
    if (booking.cancellation?.result.decision === "FULL_REFUND")
      assert.equal(booking.cancellation.result.amount, booking.amount);
  }
});
