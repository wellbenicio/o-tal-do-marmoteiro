"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { formString } from "@/lib/form";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  Clock3,
  LockKeyhole,
  Trash2,
  ArrowUpRight,
} from "lucide-react";
import { useManagement } from "./ManagementProvider";
import { Modal } from "@/components/portal/Modal";
import { OrderModal } from "./OrderModal";
import { localDate, prettyDate } from "@/lib/demo-bookings";
import { addMinutes } from "@/lib/management";
import { MgBadge, SectionTitle } from "./Shared";
function shift(date: string, days: number) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function Agenda() {
  const s = useManagement();
  const today = localDate();
  const dayOfWeek = new Date(today + "T12:00:00Z").getUTCDay();
  const [start, setStart] = useState(shift(today, -((dayOfWeek + 6) % 7)));
  const [selected, setSelected] = useState(today);
  const [mode, setMode] = useState<"week" | "day">("week");
  const [blockOpen, setBlockOpen] = useState(false);
  const [order, setOrder] = useState<string | null>(null);
  const [error, setError] = useState("");
  const days = Array.from({ length: 7 }, (_, i) => shift(start, i));
  const events = s.orders.filter(
    (o) =>
      o.booking.modality === "APPOINTMENT" &&
      ["BOOKED", "COMPLETED", "NOT_STARTED"].includes(o.booking.status) &&
      !["CANCELED", "EXPIRED"].includes(o.booking.orderStatus),
  );
  function block(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    if (
      s.addBlock({
        date: formString(d, "date"),
        start: formString(d, "start"),
        end: formString(d, "end"),
        label: formString(d, "label").trim() || "Indisponível",
        source: "MANUAL",
      })
    ) {
      setBlockOpen(false);
      setError("");
    } else
      setError(
        "O intervalo precisa ser válido e estar livre de consultas e outros bloqueios.",
      );
  }
  function dayEvents(date: string) {
    return (
      <>
        {events
          .filter((o) => o.booking.date === date)
          .sort((a, b) => a.booking.time.localeCompare(b.booking.time))
          .map((o) => {
            const c = s.customers.find((c) => c.id === o.customerId)!;
            return (
              <button
                key={o.booking.id}
                className={`mg-calendar-event ${o.booking.paymentStatus === "PENDING" ? "hold" : ""} ${o.booking.status === "COMPLETED" ? "completed" : ""}`}
                onClick={() => setOrder(o.booking.id)}
              >
                <span>
                  {o.booking.time} – {addMinutes(o.booking.time, 30)}
                  <ArrowUpRight size={12} />
                </span>
                <strong>{c.name}</strong>
                <small>
                  {o.booking.paymentStatus === "PENDING"
                    ? "Reserva temporária"
                    : o.booking.status === "COMPLETED"
                      ? "Consulta realizada"
                      : "Videochamada · Google Meet"}
                </small>
              </button>
            );
          })}
        {s.blocks
          .filter((b) => b.date === date)
          .map((b) => (
            <div key={b.id} className="mg-calendar-event personal">
              <span>
                {b.start} – {b.end}
                <LockKeyhole size={12} />
              </span>
              <strong>{b.label}</strong>
              <small>
                {b.source === "PERSONAL"
                  ? "Pessoal · exemplo"
                  : "Bloqueio manual"}
              </small>
            </div>
          ))}
      </>
    );
  }
  return (
    <>
      <div className="mg-page-heading">
        <div>
          <span className="mg-eyebrow">
            TEMPO PARA ATENDER. TEMPO PARA VOCÊ.
          </span>
          <h1>
            Minha agenda<span>.</span>
          </h1>
          <p>
            Consultas por videochamada, com dia e hora marcados. Perguntas
            avulsas ficam na fila de WhatsApp.
          </p>
        </div>
        <button className="product-button" onClick={() => setBlockOpen(true)}>
          <Plus size={17} /> Bloquear horário
        </button>
      </div>
      <div className="mg-agenda-status">
        <div>
          <span className="mg-google-icon">G</span>
          <span>
            <strong>Google Agenda</strong>
            <small>
              {s.settings.googleDemo
                ? "Espelho em demonstração · nenhuma conta conectada"
                : "Demonstração da integração · não conectada"}
            </small>
          </span>
        </div>
        <Link href="/gestao/integracoes">
          {s.settings.googleDemo ? "Ver simulação" : "Configurar integração"}{" "}
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <section className="mg-card mg-calendar-card">
        <div className="mg-calendar-toolbar">
          <div className="mg-calendar-controls">
            <button
              aria-label="Semana anterior"
              onClick={() => {
                setStart(shift(start, -7));
                setSelected(shift(selected, -7));
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Próxima semana"
              onClick={() => {
                setStart(shift(start, 7));
                setSelected(shift(selected, 7));
              }}
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => {
                setStart(shift(today, -((dayOfWeek + 6) % 7)));
                setSelected(today);
              }}
            >
              Hoje
            </button>
            <h2>
              {prettyDate(start, true)} — {prettyDate(shift(start, 6), true)}
            </h2>
          </div>
          <div className="mg-tabs">
            <button
              className={mode === "week" ? "active" : ""}
              onClick={() => setMode("week")}
            >
              Semana
            </button>
            <button
              className={mode === "day" ? "active" : ""}
              onClick={() => setMode("day")}
            >
              Dia
            </button>
          </div>
        </div>
        {mode === "week" ? (
          <div className="mg-calendar-scroll">
            <div className="mg-week-grid">
              {days.map((date) => (
                <div
                  key={date}
                  className={`mg-week-day ${date === today ? "today" : ""}`}
                >
                  <button
                    className="mg-day-heading"
                    onClick={() => {
                      setSelected(date);
                      setMode("day");
                    }}
                  >
                    <span>
                      {new Date(date + "T12:00:00Z")
                        .toLocaleDateString("pt-BR", { weekday: "short" })
                        .replace(".", "")}
                    </span>
                    <strong>{Number(date.slice(8))}</strong>
                  </button>
                  <div className="mg-day-events">
                    {dayEvents(date)}
                    {!events.some((o) => o.booking.date === date) &&
                      !s.blocks.some((b) => b.date === date) && (
                        <span className="mg-day-free">Sem compromissos</span>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mg-day-view">
            <label>
              Dia
              <input
                type="date"
                value={selected}
                onChange={(e) => e.target.value && setSelected(e.target.value)}
              />
            </label>
            <h3>{prettyDate(selected)}</h3>
            <div className="mg-day-cards">{dayEvents(selected)}</div>
            {!events.some((o) => o.booking.date === selected) &&
              !s.blocks.some((b) => b.date === selected) && (
                <p className="mg-soft-empty">Nenhum compromisso neste dia.</p>
              )}
          </div>
        )}
        <div className="mg-calendar-legend">
          <span>
            <i />
            Consulta confirmada
          </span>
          <span>
            <i className="personal" />
            Bloqueio / pessoal
          </span>
          <span>
            <i className="pending" />
            Pagamento pendente
          </span>
          <span>America/Sao_Paulo</span>
        </div>
      </section>
      <div className="mg-two-columns">
        <section className="mg-card">
          <SectionTitle
            title="Seus bloqueios"
            detail="Impedem novas reservas no intervalo escolhido."
          />
          {s.blocks.length ? (
            s.blocks.map((b) => (
              <div key={b.id} className="mg-block-row">
                <LockKeyhole size={18} />
                <div>
                  <strong>{b.label}</strong>
                  <small>
                    {prettyDate(b.date, true)} · {b.start} às {b.end}
                  </small>
                </div>
                <button
                  className="mg-icon-button"
                  aria-label={`Remover bloqueio ${b.label}`}
                  onClick={() => s.removeBlock(b.id)}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          ) : (
            <p className="mg-soft-empty">Nenhum bloqueio cadastrado.</p>
          )}
        </section>
        <section className="mg-card mg-calendar-note">
          <CalendarDays size={26} />
          <h2>Uma agenda que acompanha você.</h2>
          <p>
            O espelho previsto no Google recebe consultas confirmadas,
            reagendamentos e cancelamentos efetivados. Pedidos de cancelamento
            em análise preservam o horário até a decisão.
          </p>
          <p>
            Horários pessoais podem bloquear a disponibilidade sem expor o
            conteúdo do compromisso.
          </p>
          <MgBadge tone="blue">Integração externa ainda não ativa</MgBadge>
        </section>
      </div>
      {blockOpen && (
        <Modal
          title="Reserve um tempo para você"
          onClose={() => setBlockOpen(false)}
        >
          <p className="modal-description">
            O bloqueio retira o horário das opções disponíveis no agendamento de
            demonstração.
          </p>
          <form className="portal-form" onSubmit={block}>
            <label>
              Identificação do bloqueio
              <input
                name="label"
                placeholder="Ex.: pausa, compromisso pessoal"
                required
                maxLength={80}
              />
            </label>
            <label>
              Data
              <input
                name="date"
                type="date"
                defaultValue={today}
                min={today}
                required
              />
            </label>
            <div className="form-two-columns">
              <label>
                Início
                <input name="start" type="time" defaultValue="13:00" required />
              </label>
              <label>
                Fim
                <input name="end" type="time" defaultValue="14:00" required />
              </label>
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <button className="product-button full" type="submit">
              <Clock3 size={16} /> Confirmar bloqueio
            </button>
          </form>
        </Modal>
      )}
      {order && <OrderModal id={order} onClose={() => setOrder(null)} />}
    </>
  );
}
