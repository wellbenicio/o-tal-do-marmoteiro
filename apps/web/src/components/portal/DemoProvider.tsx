"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  appointmentTimestamp,
  canManage,
  defaultProfile,
  demoBookings,
  normalizeBookings,
  rescheduleEligibility,
  type DemoBooking,
  type DemoProfile,
  type DemoRequest,
} from "@/lib/demo-bookings";
import { decideRefund } from "@/lib/refund-policy";
import { previewConfig } from "@/lib/preview-config";
import {
  AVAILABILITY_EVENT,
  CLIENT_EVENTS_KEY,
  PUBLIC_AVAILABILITY_KEY,
  clearAdminPreview,
  MANAGEMENT_RESET_EVENT,
  overlapsBlock,
  publishClientEvent,
  type AvailabilityBlock,
} from "@/lib/preview-events";
const KEY = "marmoteiro-baseline-preview-v3";
type DemoState = {
  profile: DemoProfile | null;
  bookings: DemoBooking[];
  requests: DemoRequest[];
};
type DemoContextValue = DemoState & {
  busyBlocks: AvailabilityBlock[];
  applyAdminBooking: (booking: DemoBooking) => void;
  ready: boolean;
  now: number;
  enterDemo: (profile?: DemoProfile, examples?: boolean) => void;
  signOut: () => void;
  updateContact: (email: string, phone: string) => void;
  addBooking: (booking: DemoBooking) => boolean;
  payBooking: (id: string) => boolean;
  cancelBooking: (id: string, reason?: string, exceptional?: boolean) => void;
  requestReschedule: (id: string) => boolean;
  rescheduleBooking: (id: string, date: string, time: string) => boolean;
  addRequest: (
    request: Omit<DemoRequest, "id" | "requestedAt" | "status">,
  ) => void;
  notify: (message: string) => void;
};
const DemoContext = createContext<DemoContextValue | null>(null);
const empty: DemoState = { profile: null, bookings: [], requests: [] };
function validStoredState(value: unknown): value is DemoState {
  if (!value || typeof value !== "object") return false;
  const v = value as DemoState;
  return (
    !!v.profile &&
    [
      "name",
      "legalName",
      "socialName",
      "birthDate",
      "motherName",
      "genderIdentity",
      "pronouns",
      "email",
      "phone",
    ].every((k) => typeof v.profile?.[k as keyof DemoProfile] === "string") &&
    Array.isArray(v.requests) &&
    Array.isArray(v.bookings) &&
    v.bookings.every(
      (b) =>
        b &&
        typeof b.id === "string" &&
        typeof b.amount === "number" &&
        ["APPOINTMENT", "QUESTION"].includes(b.modality) &&
        [
          "AWAITING_PAYMENT",
          "CONFIRMED",
          "CANCELLATION_REQUESTED",
          "CANCELED",
          "EXPIRED",
        ].includes(b.orderStatus) &&
        [
          "NOT_STARTED",
          "BOOKED",
          "COMPLETED",
          "CANCELED",
          "QUEUED",
          "IN_PROGRESS",
          "DELIVERED",
          "NO_SHOW",
          "SUSPENDED",
        ].includes(b.status) &&
        [
          "APPROVED",
          "PENDING",
          "REFUND_PENDING",
          "REFUNDED",
          "PARTIALLY_REFUNDED",
          "CANCELLED",
          "REJECTED",
        ].includes(b.paymentStatus) &&
        /^\d{4}-\d{2}-\d{2}$/.test(b.date) &&
        /^\d{2}:\d{2}$/.test(b.time) &&
        Array.isArray(b.timeline) &&
        Array.isArray(b.acceptances),
    )
  );
}
export function DemoProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<DemoState>(empty);
  const [busyBlocks, setBusyBlocks] = useState<AvailabilityBlock[]>([]);
  useEffect(() => {
    const receive = (event: Event) =>
      setBusyBlocks((event as CustomEvent<AvailabilityBlock[]>).detail);
    window.addEventListener(AVAILABILITY_EVENT, receive);
    return () => window.removeEventListener(AVAILABILITY_EVENT, receive);
  }, []);
  function applyAdminBooking(booking: DemoBooking) {
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === booking.id ? booking : b)),
    }));
  }
  const [ready, setReady] = useState(false);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState("");
  const notify = useCallback((text: string) => setMessage(text), []);
  // This one-time hydration synchronizes the preview with browser-only sessionStorage.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      localStorage.removeItem("marmoteiro-preview-v2");
      const availability = JSON.parse(
        sessionStorage.getItem(PUBLIC_AVAILABILITY_KEY) || "[]",
      );
      if (Array.isArray(availability)) setBusyBlocks(availability);
      const stored = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (validStoredState(stored))
        setState({ ...stored, bookings: normalizeBookings(stored.bookings) });
    } catch {
      /* Preview remains usable without storage. */
    }
    setNow(Date.now());
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready) return;
    try {
      if (state.profile) sessionStorage.setItem(KEY, JSON.stringify(state));
      else sessionStorage.removeItem(KEY);
    } catch {
      /* In-memory fallback. */
    }
  }, [state, ready]);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6500);
    return () => clearTimeout(timer);
  }, [message]);
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
      setState((s) => ({ ...s, bookings: normalizeBookings(s.bookings) }));
    }, 15000);
    return () => clearInterval(timer);
  }, []);
  function slotOccupied(date: string, time: string, except?: string) {
    return (
      overlapsBlock(busyBlocks, date, time, 30, except) ||
      normalizeBookings(state.bookings).some(
        (b) =>
          b.id !== except &&
          b.modality === "APPOINTMENT" &&
          b.date === date &&
          b.time === time &&
          (b.status === "BOOKED" ||
            b.orderStatus === "AWAITING_PAYMENT" ||
            b.orderStatus === "CANCELLATION_REQUESTED"),
      )
    );
  }
  function enterDemo(profile = defaultProfile, examples = true) {
    if (!examples) publishClientEvent("ACCOUNT_CREATED", profile);
    setState((s) =>
      s.profile?.email === profile.email
        ? { ...s, profile }
        : { profile, bookings: examples ? demoBookings() : [], requests: [] },
    );
  }
  function updateContact(email: string, phone: string) {
    publishClientEvent(
      "CONTACT_UPDATED",
      state.profile ? { ...state.profile, email, phone } : null,
    );
    setState((s) => ({
      ...s,
      profile: s.profile ? { ...s.profile, email, phone } : null,
    }));
    notify(
      "Contato atualizado nesta demonstração. Na versão integrada, a mudança exigirá validação.",
    );
  }
  function signOut() {
    setState(empty);
    clearAdminPreview();
    sessionStorage.removeItem(CLIENT_EVENTS_KEY);
    window.dispatchEvent(new Event(MANAGEMENT_RESET_EVENT));
  }
  function addBooking(booking: DemoBooking) {
    if (!state.profile || booking.acceptances.length !== 3) return false;
    if (
      booking.modality === "QUESTION" &&
      (!booking.question ||
        booking.question.text.trim().length < 10 ||
        booking.question.text.length > 1500)
    )
      return false;
    if (
      booking.modality === "APPOINTMENT" &&
      (slotOccupied(booking.date, booking.time) ||
        !previewConfig.calendar.slots.includes(booking.time) ||
        appointmentTimestamp(booking.date, booking.time) <= Date.now())
    )
      return false;
    setState((s) => ({
      ...s,
      bookings: [booking, ...normalizeBookings(s.bookings)],
    }));
    publishClientEvent("ORDER_CREATED", state.profile, booking);
    return true;
  }
  function payBooking(id: string) {
    const found = normalizeBookings(state.bookings).find((b) => b.id === id);
    if (!found || found.orderStatus !== "AWAITING_PAYMENT") {
      notify("Essa reserva expirou. Inicie uma nova contratação de teste.");
      return false;
    }
    const at = new Date().toISOString();
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              orderStatus: "CONFIRMED",
              status: b.modality === "QUESTION" ? "QUEUED" : "BOOKED",
              paymentStatus: "APPROVED",
              paidAt: at,
              timeline: [
                ...b.timeline,
                { at, title: "Pagamento simulado aprovado" },
                {
                  at,
                  title:
                    b.modality === "QUESTION"
                      ? "Entrada na fila; execução ainda não iniciada"
                      : "Horário confirmado na demonstração",
                },
              ],
            }
          : b,
      ),
    }));
    publishClientEvent("PAYMENT_APPROVED", state.profile, {
      ...found,
      orderStatus: "CONFIRMED",
      status: found.modality === "QUESTION" ? "QUEUED" : "BOOKED",
      paymentStatus: "APPROVED",
      paidAt: at,
    });
    notify(
      "Pagamento aprovado na simulação. Nenhum valor cobrado ou e-mail enviado.",
    );
    return true;
  }
  function cancelBooking(id: string, reason = "", exceptional = false) {
    const found = normalizeBookings(state.bookings).find((b) => b.id === id);
    if (!found || !canManage(found)) return;
    const at = new Date().toISOString();
    const result = decideRefund({
      modality: found.modality,
      totalPaid: found.paymentStatus === "APPROVED" ? found.amount : 0,
      contractedAt: found.createdAt,
      requestedAt: at,
      execution: found.status,
      startsAt:
        found.modality === "APPOINTMENT"
          ? appointmentTimestamp(found.date, found.time)
          : undefined,
      withdrawal: "UNDETERMINED",
      exceptional,
    });
    const manual = result.decision === "MANUAL_REVIEW_REQUIRED";
    const protocol = "CAN-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const updated: DemoBooking = {
      ...found,
      orderStatus: manual ? "CANCELLATION_REQUESTED" : "CANCELED",
      status: manual
        ? ["QUEUED", "IN_PROGRESS"].includes(found.status)
          ? "SUSPENDED"
          : found.status
        : "CANCELED",
      paymentStatus: manual
        ? found.paymentStatus
        : result.amount
          ? "REFUND_PENDING"
          : "CANCELLED",
      canceledAt: manual ? undefined : at,
      cancellation: {
        protocol,
        requestedAt: at,
        reason,
        executionAtRequest: found.status,
        result,
      },
      timeline: [
        ...found.timeline,
        { at, title: `Solicitação recebida · ${protocol}` },
        {
          at,
          title: manual
            ? "Encaminhada para análise; nenhum reembolso aprovado automaticamente"
            : "Reserva cancelada sem cobrança",
        },
      ],
    };
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? updated : b)),
    }));
    publishClientEvent(
      "CANCELLATION_REQUESTED",
      state.profile,
      updated,
      protocol,
    );
    notify(
      `Solicitação recebida · ${protocol}. Protocolo disponível nos detalhes. Nesta prévia, nenhum e-mail é enviado.`,
    );
  }
  function requestReschedule(id: string) {
    const b = normalizeBookings(state.bookings).find((b) => b.id === id);
    if (!b) return false;
    const eligibility = rescheduleEligibility(b);
    if (!eligibility.allowed) {
      notify(eligibility.reason);
      return false;
    }
    if (b.rescheduleRequest?.status === "OPEN") return true;
    const at = new Date().toISOString();
    const updated: DemoBooking = {
      ...b,
      rescheduleRequest: {
        id: "REA-" + crypto.randomUUID().slice(0, 8),
        requestedAt: at,
        optionsPresentedAt: at,
        expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(),
        originalDate: b.date,
        originalTime: b.time,
        causedByProvider: false,
        status: "OPEN",
      },
      timeline: [
        ...b.timeline,
        {
          at,
          title: "Reagendamento solicitado; opções disponíveis por 48 horas",
        },
      ],
    };
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((item) => (item.id === id ? updated : item)),
    }));
    publishClientEvent(
      "RESCHEDULE_REQUESTED",
      state.profile,
      updated,
      updated.rescheduleRequest?.id,
    );
    return true;
  }
  function rescheduleBooking(id: string, date: string, time: string) {
    const found = normalizeBookings(state.bookings).find((b) => b.id === id);
    if (
      !found ||
      !rescheduleEligibility(found).allowed ||
      found.rescheduleRequest?.status !== "OPEN" ||
      (found.date === date && found.time === time) ||
      !previewConfig.calendar.slots.includes(time) ||
      appointmentTimestamp(date, time) <= Date.now() ||
      slotOccupied(date, time, id)
    ) {
      notify(
        "Não foi possível confirmar. Confira o prazo e escolha outro horário disponível.",
      );
      return false;
    }
    const at = new Date().toISOString();
    const updated: DemoBooking = {
      ...found,
      previousDate: found.date,
      previousTime: found.time,
      date,
      time,
      rescheduleUsed: found.rescheduleRequest?.causedByProvider
        ? found.rescheduleUsed
        : true,
      rescheduleRequest: {
        ...found.rescheduleRequest!,
        status: "CONFIRMED",
        confirmedAt: at,
      },
      timeline: [
        ...found.timeline,
        { at, title: `Novo horário confirmado: ${date} às ${time}` },
      ],
    };
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? updated : b)),
    }));
    publishClientEvent("RESCHEDULE_CONFIRMED", state.profile, updated);
    notify(
      found.rescheduleRequest?.causedByProvider
        ? "Novo horário confirmado. A alteração pelo prestador não consumiu um novo uso do seu direito."
        : "Novo horário confirmado. Seu reagendamento foi utilizado nesta demonstração.",
    );
    return true;
  }
  function addRequest(
    request: Omit<DemoRequest, "id" | "requestedAt" | "status">,
  ) {
    const id =
      (request.type === "CORRECTION" ? "CAD-" : "PRV-") +
      crypto.randomUUID().slice(0, 8).toUpperCase();
    setState((s) => ({
      ...s,
      requests: [
        {
          ...request,
          id,
          requestedAt: new Date().toISOString(),
          status: "RECEIVED",
        },
        ...s.requests,
      ],
    }));
    publishClientEvent("CUSTOMER_REQUEST", state.profile, undefined, id);
    notify(`Solicitação simulada recebida · ${id}. Nenhum dado enviado.`);
  }
  return (
    <DemoContext.Provider
      value={{
        ...state,
        busyBlocks,
        applyAdminBooking,
        ready,
        now,
        enterDemo,
        updateContact,
        signOut,
        addBooking,
        payBooking,
        cancelBooking,
        requestReschedule,
        rescheduleBooking,
        addRequest,
        notify,
      }}
    >
      {children}
      {message && (
        <div className="portal-toast" role="status">
          <span />
          {message}
          <button aria-label="Fechar mensagem" onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}
    </DemoContext.Provider>
  );
}
export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("DemoProvider is required");
  return context;
}
