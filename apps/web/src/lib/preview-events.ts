import {
  DEMO_DURATION,
  type DemoBooking,
  type DemoProfile,
} from "./demo-bookings";
export const MANAGEMENT_KEY = "marmoteiro-management-preview-v1";
export const MANAGEMENT_RESET_EVENT = "marmoteiro:management-reset";
export const CLIENT_EVENTS_KEY = "marmoteiro-client-events-v1";
export const PUBLIC_AVAILABILITY_KEY = "marmoteiro-availability-v1";
export function clearAdminPreview() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(MANAGEMENT_KEY);
    sessionStorage.removeItem(PUBLIC_AVAILABILITY_KEY);
  }
}
export const CLIENT_EVENT = "marmoteiro:client-event";
export const AVAILABILITY_EVENT = "marmoteiro:availability";
export type ClientEventKind =
  | "ACCOUNT_CREATED"
  | "CONTACT_UPDATED"
  | "ORDER_CREATED"
  | "PAYMENT_APPROVED"
  | "CANCELLATION_REQUESTED"
  | "RESCHEDULE_REQUESTED"
  | "RESCHEDULE_CONFIRMED"
  | "CUSTOMER_REQUEST";
export type ClientEvent = {
  id: string;
  kind: ClientEventKind;
  at: string;
  profile: DemoProfile;
  booking?: DemoBooking;
  reference?: string;
};
export type AvailabilityBlock = {
  id: string;
  date: string;
  start: string;
  end: string;
  label: string;
  source: "PERSONAL" | "MANUAL" | "APPOINTMENT";
};
export function publishClientEvent(
  kind: ClientEventKind,
  profile: DemoProfile | null,
  booking?: DemoBooking,
  reference?: string,
) {
  if (!profile || typeof window === "undefined") return;
  const detail: ClientEvent = {
    id: crypto.randomUUID(),
    kind,
    at: new Date().toISOString(),
    profile,
    booking,
    reference,
  };
  try {
    const previous = JSON.parse(
      sessionStorage.getItem(CLIENT_EVENTS_KEY) || "[]",
    ) as ClientEvent[];
    sessionStorage.setItem(
      CLIENT_EVENTS_KEY,
      JSON.stringify([...previous.slice(-99), detail]),
    );
  } catch {}
  window.dispatchEvent(new CustomEvent<ClientEvent>(CLIENT_EVENT, { detail }));
}
export function overlapsBlock(
  blocks: AvailabilityBlock[],
  date: string,
  time: string,
  duration = DEMO_DURATION,
  except?: string,
) {
  const minutes = (s: string) =>
    Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  const start = minutes(time);
  return blocks.some(
    (b) =>
      b.id !== except &&
      b.date === date &&
      start < minutes(b.end) &&
      start + duration > minutes(b.start),
  );
}
