import assert from "node:assert/strict";
import { test } from "node:test";
import {
  appointmentTimestamp,
  canManage,
  demoBookings,
  normalizeBookings,
  rescheduleEligibility,
  type DemoBooking,
} from "./demo-bookings";
import { decideRefund, type RefundContext } from "./refund-policy";
import { previewAcceptances } from "./preview-legal";
const now = Date.parse("2026-09-21T12:00:00Z");
const pending: DemoBooking = {
  id: "test",
  modality: "APPOINTMENT",
  date: "2026-09-22",
  time: "09:00",
  orderStatus: "AWAITING_PAYMENT",
  status: "NOT_STARTED",
  paymentStatus: "PENDING",
  method: "PIX",
  amount: 7000,
  createdAt: new Date(now).toISOString(),
  lockExpiresAt: new Date(now + 60000).toISOString(),
  rescheduleUsed: false,
  acceptances: [],
  timeline: [],
};
const booked: DemoBooking = {
  ...pending,
  orderStatus: "CONFIRMED",
  status: "BOOKED",
  paymentStatus: "APPROVED",
};
const refund: RefundContext = {
  modality: "APPOINTMENT",
  totalPaid: 7000,
  contractedAt: "2026-09-01T12:00:00Z",
  requestedAt: new Date(now).toISOString(),
  execution: "BOOKED",
  startsAt: now + 3600000,
  withdrawal: "NOT_APPLICABLE",
};
test("expiration releases only unpaid holds and leaves paid appointments intact", () => {
  const [a, b] = normalizeBookings([pending, booked], now + 60000);
  assert.equal(a.orderStatus, "EXPIRED");
  assert.equal(a.paymentStatus, "CANCELLED");
  assert.equal(b.status, "BOOKED");
  assert.equal(b.paymentStatus, "APPROVED");
  assert.equal(pending.orderStatus, "AWAITING_PAYMENT");
});
test("24 hours is inclusive for requesting a reschedule", () => {
  assert.equal(rescheduleEligibility(booked, now).allowed, true);
  assert.equal(rescheduleEligibility(booked, now + 1).allowed, false);
});
test("consumed reschedule is rejected even far in advance", () => {
  assert.equal(
    rescheduleEligibility(
      { ...booked, date: "2099-01-01", rescheduleUsed: true },
      now,
    ).allowed,
    false,
  );
});
test("requested reschedule remains eligible during 48-hour choice window, not requiring 24h again", () => {
  const r: DemoBooking = {
    ...booked,
    rescheduleRequest: {
      id: "r",
      requestedAt: new Date(now).toISOString(),
      optionsPresentedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 48 * 3600000).toISOString(),
      originalDate: booked.date,
      originalTime: booked.time,
      causedByProvider: false,
      status: "OPEN",
    },
  };
  assert.equal(rescheduleEligibility(r, now + 25 * 3600000).allowed, true);
  assert.equal(rescheduleEligibility(r, now + 48 * 3600000).allowed, false);
  const normalized = normalizeBookings([r], now + 48 * 3600000)[0];
  assert.equal(normalized.rescheduleUsed, false);
  assert.equal(normalized.date, booked.date);
  assert.equal(normalized.rescheduleRequest?.status, "EXPIRED");
});
test("provider reschedule request preserves an already-used customer right", () => {
  const r: DemoBooking = {
    ...booked,
    rescheduleUsed: true,
    rescheduleRequest: {
      id: "provider",
      requestedAt: new Date(now).toISOString(),
      optionsPresentedAt: new Date(now).toISOString(),
      expiresAt: new Date(now + 48 * 3600000).toISOString(),
      originalDate: booked.date,
      originalTime: booked.time,
      causedByProvider: true,
      status: "OPEN",
    },
  };
  assert.equal(rescheduleEligibility(r, now).allowed, true);
});
test("delivered service still exposes cancellation request instead of automatic denial", () => {
  assert.equal(canManage({ ...booked, status: "COMPLETED" }), true);
});
test("a cancellation request cannot be submitted twice", () => {
  assert.equal(
    canManage({ ...booked, orderStatus: "CANCELLATION_REQUESTED" }),
    false,
  );
});
test("late cancellation uses 70% and no-show uses 50% without mixing the triggers", () => {
  assert.deepEqual(
    [decideRefund(refund).amount, decideRefund(refund).retained],
    [4900, 2100],
  );
  assert.equal(
    decideRefund({ ...refund, execution: "NO_SHOW", noShowConfirmed: true })
      .amount,
    3500,
  );
});
test("mandatory withdrawal right precedes late and no-show retention", () => {
  assert.equal(
    decideRefund({ ...refund, withdrawal: "APPLICABLE", noShowConfirmed: true })
      .amount,
    7000,
  );
});
test("priority is included in full refunds and IN_PROGRESS does not remove withdrawal rights", () => {
  assert.equal(
    decideRefund({
      ...refund,
      modality: "QUESTION",
      execution: "IN_PROGRESS",
      withdrawal: "APPLICABLE",
      totalPaid: 9000,
    }).amount,
    9000,
  );
});
test("delivered service, unknown legal context and exceptions require review", () => {
  for (const change of [
    { execution: "DELIVERED", withdrawal: "APPLICABLE" as const },
    { withdrawal: "UNDETERMINED" as const },
    { exceptional: true },
  ]) {
    const result = decideRefund({ ...refund, ...change });
    assert.equal(result.decision, "MANUAL_REVIEW_REQUIRED");
    assert.equal(result.amount, null);
  }
});
test("provider failure refunds unperformed service in full", () => {
  assert.equal(
    decideRefund({ ...refund, providerResponsible: true }).amount,
    7000,
  );
});
test("no invented automatic percentage at 24h or for regular queued questions", () => {
  assert.equal(
    decideRefund({ ...refund, startsAt: now + 24 * 3600000 }).decision,
    "MANUAL_REVIEW_REQUIRED",
  );
  assert.equal(
    decideRefund({ ...refund, modality: "QUESTION", execution: "QUEUED" })
      .decision,
    "MANUAL_REVIEW_REQUIRED",
  );
});
test("unpaid cancellation has no refund, not an approved transfer", () => {
  assert.equal(decideRefund({ ...refund, totalPaid: 0 }).amount, 0);
  assert.equal(decideRefund({ ...refund, totalPaid: 0 }).decision, "NO_REFUND");
});
test("each document has its own immutable version snapshot and timestamp", () => {
  const a = previewAcceptances(
    ["terms", "privacy", "confidentiality"],
    new Date(now).toISOString(),
  );
  assert.equal(a.length, 3);
  assert.equal(new Set(a.map((d) => d.documentId)).size, 3);
  assert.ok(
    a.every(
      (d) =>
        d.version === "PREVIA-BASELINE-2026-09-21" &&
        d.acceptedAt === new Date(now).toISOString(),
    ),
  );
});
test("appointment timestamps use Brasília and example notes are fictitious without fabricated Notion links", () => {
  assert.equal(
    appointmentTimestamp("2026-09-21", "14:00"),
    Date.parse("2026-09-21T17:00:00Z"),
  );
  for (const b of demoBookings().filter((b) => b.note)) {
    assert.equal(b.status, "COMPLETED");
    assert.equal(Object.hasOwn(b.note!, "url"), false);
  }
});
