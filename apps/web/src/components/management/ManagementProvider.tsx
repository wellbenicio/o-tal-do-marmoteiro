"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useDemo } from "@/components/portal/DemoProvider";
import { normalizeBookings, type DemoBooking } from "@/lib/demo-bookings";
import {
  applyClientEvent,
  availabilityFor,
  canAddBlock,
  customerFromProfile,
  managementSeed,
  queueOrders,
  providerAgendaChange,
  withCommunication,
  type Expense,
  type ManagementSettings,
  type ManagementState,
  type ManagedOrder,
} from "@/lib/management";
import {
  AVAILABILITY_EVENT,
  CLIENT_EVENT,
  CLIENT_EVENTS_KEY,
  PUBLIC_AVAILABILITY_KEY,
  MANAGEMENT_KEY,
  MANAGEMENT_RESET_EVENT,
  type AvailabilityBlock,
  type ClientEvent,
} from "@/lib/preview-events";
type ManagementContextValue = ManagementState & {
  ready: boolean;
  now: number;
  markRead: (id?: string) => void;
  updateSettings: (patch: Partial<ManagementSettings>) => void;
  addBlock: (block: Omit<AvailabilityBlock, "id">) => boolean;
  removeBlock: (id: string) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  relationship: (
    id: string,
    action: "contacted" | "snooze" | "dismiss" | "allow" | "disallow",
  ) => void;
  startQuestion: (id: string) => boolean;
  changeAgenda: (
    id: string,
    action: "reschedule" | "cancel",
    reason: string,
  ) => boolean;
  deliverQuestion: (id: string, checks: boolean[]) => boolean;
  completeService: (id: string) => boolean;
  approveRefund: (id: string, amount: number, reason: string) => boolean;
  finishRefund: (id: string) => boolean;
  simulateEmail: (id: string, fail?: boolean) => void;
  dailyDigest: () => void;
};
const Context = createContext<ManagementContextValue | null>(null);
export function ManagementProvider({ children }: { children: ReactNode }) {
  const demo = useDemo();
  const [state, setState] = useState<ManagementState>(() => managementSeed());
  const [ready, setReady] = useState(false);
  // Read the demonstration's browser storage once after hydration; no credentials or live data.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const saved = JSON.parse(
        sessionStorage.getItem(MANAGEMENT_KEY) || "null",
      );
      let initial: ManagementState =
        saved?.version === 1 &&
        Array.isArray(saved.orders) &&
        Array.isArray(saved.customers) &&
        Array.isArray(saved.audit) &&
        saved.settings
          ? saved
          : managementSeed();
      const events = JSON.parse(
        sessionStorage.getItem(CLIENT_EVENTS_KEY) || "[]",
      ) as ClientEvent[];
      for (const event of events) initial = applyClientEvent(initial, event);
      setState(initial);
    } catch {}
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (ready)
      try {
        sessionStorage.setItem(MANAGEMENT_KEY, JSON.stringify(state));
        // Acknowledge only after the projection is saved. React may replay
        // hydration effects; clearing the queue there would lose notifications.
        const buffered = JSON.parse(
          sessionStorage.getItem(CLIENT_EVENTS_KEY) || "[]",
        ) as ClientEvent[];
        const pending = buffered.filter(
          (event) => !state.processedEvents.includes(event.id),
        );
        if (pending.length)
          sessionStorage.setItem(CLIENT_EVENTS_KEY, JSON.stringify(pending));
        else sessionStorage.removeItem(CLIENT_EVENTS_KEY);
      } catch {}
  }, [state, ready]);
  useEffect(() => {
    function handle(event: Event) {
      const detail = (event as CustomEvent<ClientEvent>).detail;
      setState((s) => applyClientEvent(s, detail));
    }
    const reset = () => setState(managementSeed());
    window.addEventListener(CLIENT_EVENT, handle);
    window.addEventListener(MANAGEMENT_RESET_EVENT, reset);
    return () => {
      window.removeEventListener(CLIENT_EVENT, handle);
      window.removeEventListener(MANAGEMENT_RESET_EVENT, reset);
    };
  }, []);
  // Import this tab's client history without pretending that historical actions sent messages.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready || !demo.ready || !demo.profile) return;
    const profile = demo.profile;
    setState((s) => {
      const customer = customerFromProfile(profile);
      const known = s.customers.find((c) => c.id === customer.id);
      return {
        ...s,
        customers: [
          {
            ...customer,
            relationshipAllowed: known?.relationshipAllowed ?? false,
            lastContactAt: known?.lastContactAt,
            snoozedUntil: known?.snoozedUntil,
            dismissed: known?.dismissed,
          },
          ...s.customers.filter((c) => c.id !== customer.id),
        ],
        orders: [
          ...demo.bookings.map((booking) => {
            const old = s.orders.find((o) => o.booking.id === booking.id);
            return {
              booking,
              customerId: customer.id,
              fee: old?.fee ?? 0,
              feeAt: old?.feeAt,
              refundedAt: old?.refundedAt,
            };
          }),
          ...s.orders.filter(
            (o) => !demo.bookings.some((b) => b.id === o.booking.id),
          ),
        ],
      };
    });
  }, [ready, demo.ready, demo.profile, demo.bookings]);
  /* eslint-enable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!ready) return;
    const availability = availabilityFor(state).map((b) => ({
      ...b,
      label: "Horário indisponível",
    }));
    try {
      sessionStorage.setItem(
        PUBLIC_AVAILABILITY_KEY,
        JSON.stringify(availability),
      );
    } catch {}
    window.dispatchEvent(
      new CustomEvent(AVAILABILITY_EVENT, { detail: availability }),
    );
  }, [ready, state]);
  useEffect(() => {
    const timer = setInterval(
      () =>
        setState((s) => ({
          ...s,
          orders: s.orders.map((o) => ({
            ...o,
            booking: normalizeBookings([o.booking])[0],
          })),
        })),
      15000,
    );
    return () => clearInterval(timer);
  }, []);
  function markRead(id?: string) {
    setState((s) => ({
      ...s,
      notices: s.notices.map((n) =>
        !id || n.id === id ? { ...n, read: true } : n,
      ),
    }));
  }
  function updateSettings(patch: Partial<ManagementSettings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    demo.notify(
      "Preferências salvas na demonstração. Nenhuma conexão externa foi alterada.",
    );
  }
  function addBlock(block: Omit<AvailabilityBlock, "id">) {
    const full = { ...block, id: "BLK-" + crypto.randomUUID().slice(0, 8) };
    if (!canAddBlock(state, full)) {
      demo.notify(
        "Esse intervalo coincide com uma reserva ou bloqueio. Escolha outro horário.",
      );
      return false;
    }
    const at = new Date().toISOString();
    setState((s) => ({
      ...s,
      blocks: [...s.blocks, full],
      audit: [
        {
          id: crypto.randomUUID(),
          at,
          actor: "Marmoteiro · demonstração",
          action: "Horário bloqueado",
          reference: full.id,
          reason: full.label,
        },
        ...s.audit,
      ],
    }));
    demo.notify(
      "Horário bloqueado nesta demonstração; a disponibilidade do checkout foi atualizada.",
    );
    return true;
  }
  function removeBlock(id: string) {
    setState((s) => ({ ...s, blocks: s.blocks.filter((b) => b.id !== id) }));
    demo.notify("Bloqueio removido na demonstração.");
  }
  function addExpense(expense: Omit<Expense, "id">) {
    if (!Number.isInteger(expense.amount) || expense.amount <= 0) return;
    setState((s) => ({
      ...s,
      expenses: [
        { ...expense, id: "DES-" + crypto.randomUUID().slice(0, 8) },
        ...s.expenses,
      ],
    }));
    demo.notify("Despesa de exemplo registrada.");
  }
  function relationship(
    id: string,
    action: "contacted" | "snooze" | "dismiss" | "allow" | "disallow",
  ) {
    const at = new Date().toISOString();
    setState((s) => ({
      ...s,
      customers: s.customers.map((c) =>
        c.id !== id
          ? c
          : action === "contacted"
            ? { ...c, lastContactAt: at }
            : action === "snooze"
              ? {
                  ...c,
                  snoozedUntil: new Date(
                    Date.now() + 7 * 86400000,
                  ).toISOString(),
                }
              : action === "dismiss"
                ? { ...c, dismissed: true }
                : {
                    ...c,
                    relationshipAllowed: action === "allow",
                    dismissed: false,
                  },
      ),
      audit: [
        {
          id: crypto.randomUUID(),
          at,
          actor: "Marmoteiro · demonstração",
          action: "Relacionamento: " + action,
          reference: id,
        },
        ...s.audit,
      ],
    }));
    demo.notify(
      action === "contacted"
        ? "Contato registrado como exemplo. Nenhuma mensagem enviada."
        : "Lembrete de relacionamento atualizado.",
    );
  }
  function changeOrder(
    order: ManagedOrder,
    booking: DemoBooking,
    title: string,
    reason: string,
    extra?: Partial<ManagedOrder>,
  ) {
    const at = new Date().toISOString();
    const b = { ...booking, timeline: [...booking.timeline, { at, title }] };
    const customer = state.customers.find((c) => c.id === order.customerId)!;
    let updated = {
      ...state,
      orders: state.orders.map((o) =>
        o.booking.id === booking.id ? { ...o, ...extra, booking: b } : o,
      ),
      audit: [
        {
          id: crypto.randomUUID(),
          at,
          actor: "Marmoteiro · demonstração",
          action: title,
          reference: booking.id,
          reason,
        },
        ...state.audit,
      ],
    };
    updated = withCommunication(updated, {
      id: crypto.randomUUID(),
      at,
      title,
      customerTitle: title,
      type: booking.modality === "QUESTION" ? "question" : "agenda",
      customer,
      orderId: booking.id,
      description:
        title +
        ". " +
        (booking.paymentStatus === "REFUND_PENDING"
          ? "A devolução ainda depende de processamento."
          : "Consulte o andamento na sua área."),
    });
    setState(updated);
    demo.applyAdminBooking(b);
    demo.notify(title + " na demonstração. E-mails disponíveis para prévia.");
  }
  function changeAgenda(
    id: string,
    action: "reschedule" | "cancel",
    reason: string,
  ) {
    const order = state.orders.find((o) => o.booking.id === id);
    if (!order) return false;
    const booking = providerAgendaChange(order.booking, action, reason);
    if (!booking) return false;
    changeOrder(
      order,
      booking,
      action === "reschedule"
        ? "Prestador disponibilizou opções de reagendamento"
        : "Cancelamento pelo prestador; restituição integral pendente",
      reason.trim(),
    );
    return true;
  }
  function startQuestion(id: string) {
    const order = state.orders.find((o) => o.booking.id === id);
    if (
      !order ||
      !order.booking.question?.text ||
      queueOrders(state.orders)[0]?.booking.id !== id
    ) {
      demo.notify(
        "Siga a fila: prioritárias primeiro, depois ordem de pagamento.",
      );
      return false;
    }
    changeOrder(
      order,
      { ...order.booking, status: "IN_PROGRESS" },
      "Atendimento iniciado",
      "Ação administrativa explícita.",
    );
    return true;
  }
  function deliverQuestion(id: string, checks: boolean[]) {
    const order = state.orders.find((o) => o.booking.id === id);
    if (
      !order ||
      order.booking.status !== "IN_PROGRESS" ||
      checks.length !== 3 ||
      !checks.every(Boolean)
    )
      return false;
    changeOrder(
      order,
      { ...order.booking, status: "DELIVERED" },
      "Resposta entregue pelo WhatsApp",
      "Administrador confirmou identificação da pergunta, foto do jogo e áudio.",
    );
    return true;
  }
  function completeService(id: string) {
    const order = state.orders.find((o) => o.booking.id === id);
    if (!order) return false;
    const b = order.booking;
    const eligible =
      b.orderStatus === "CONFIRMED" &&
      (b.modality === "QUESTION"
        ? b.status === "DELIVERED"
        : b.status === "BOOKED" &&
          Date.parse(`${b.date}T${b.time}:00-03:00`) + 30 * 60000 <=
            Date.now());
    if (!eligible) return false;
    changeOrder(
      order,
      { ...b, status: "COMPLETED", completedAt: new Date().toISOString() },
      "Atendimento concluído",
      "Conclusão registrada manualmente.",
    );
    return true;
  }
  function approveRefund(id: string, amount: number, reason: string) {
    const order = state.orders.find((o) => o.booking.id === id);
    if (
      !order ||
      order.booking.orderStatus !== "CANCELLATION_REQUESTED" ||
      !order.booking.cancellation ||
      !Number.isInteger(amount) ||
      amount <= 0 ||
      amount > order.booking.amount ||
      reason.trim().length < 10
    )
      return false;
    const b = order.booking;
    changeOrder(
      order,
      {
        ...b,
        orderStatus: "CANCELED",
        status: "CANCELED",
        paymentStatus: "REFUND_PENDING",
        canceledAt: new Date().toISOString(),
        cancellation: {
          ...b.cancellation!,
          result: {
            decision: amount === b.amount ? "FULL_REFUND" : "PARTIAL_REFUND",
            amount,
            retained: b.amount - amount,
            reason: reason.trim(),
          },
        },
      },
      "Cancelamento aprovado; reembolso pendente",
      `Decisão anterior: ${b.cancellation!.result.decision}. Nova decisão: ${amount}/${b.amount} centavos. ${reason.trim()}`,
    );
    return true;
  }
  function finishRefund(id: string) {
    const order = state.orders.find((o) => o.booking.id === id);
    if (
      !order ||
      order.booking.paymentStatus !== "REFUND_PENDING" ||
      !order.booking.cancellation?.result.amount
    )
      return false;
    const b = order.booking;
    changeOrder(
      order,
      {
        ...b,
        paymentStatus:
          b.cancellation!.result.amount === b.amount
            ? "REFUNDED"
            : "PARTIALLY_REFUNDED",
      },
      "Reembolso concluído",
      "Simulação de confirmação financeira do provedor, sem transferência real.",
      { refundedAt: new Date().toISOString() },
    );
    return true;
  }
  function simulateEmail(id: string, fail = false) {
    setState((s) => ({
      ...s,
      emails: s.emails.map((e) =>
        e.id === id && e.status !== "SIMULATED"
          ? {
              ...e,
              status: fail ? "FAILED" : "SIMULATED",
              attempts: e.attempts + 1,
            }
          : e,
      ),
    }));
    demo.notify(
      fail
        ? "Falha demonstrativa registrada. Você pode simular uma nova tentativa."
        : "Processamento simulado. Nenhum e-mail real foi enviado.",
    );
  }
  function dailyDigest() {
    const at = new Date().toISOString();
    setState((s) => ({
      ...s,
      emails: [
        {
          id: crypto.randomUUID(),
          eventId: crypto.randomUUID(),
          recipient: s.settings.ownerEmail,
          audience: "OWNER",
          subject: "Seu resumo do dia · O Tal do Marmoteiro",
          body: `Olá, Marmoteiro.\n\nHá ${s.orders.filter((o) => o.booking.status === "BOOKED" && o.booking.date === new Date().toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" })).length} consultas na agenda de hoje, ${queueOrders(s.orders).length} perguntas na fila e ${s.orders.filter((o) => o.booking.orderStatus === "CANCELLATION_REQUESTED").length} cancelamentos para analisar.\n\nConsulte seu painel para os detalhes.\n\n[Prévia: nenhum e-mail foi enviado.]`,
          at,
          status: "PREVIEW",
          attempts: 0,
        },
        ...s.emails,
      ],
    }));
    demo.notify("Resumo diário criado na caixa de e-mails de demonstração.");
  }
  return (
    <Context.Provider
      value={{
        ...state,
        ready,
        now: demo.now,
        markRead,
        updateSettings,
        addBlock,
        removeBlock,
        addExpense,
        relationship,
        startQuestion,
        changeAgenda,
        deliverQuestion,
        completeService,
        approveRefund,
        finishRefund,
        simulateEmail,
        dailyDigest,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useManagement() {
  const context = useContext(Context);
  if (!context) throw new Error("ManagementProvider required");
  return context;
}
