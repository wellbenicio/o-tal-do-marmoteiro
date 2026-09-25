"use client";
import Link from "next/link";
import {
  CalendarDays,
  ArrowUpRight,
  ArrowRight,
  Wallet,
  MessageCircle,
  Clock3,
  Users,
  AlertCircle,
  Check,
  Sun,
} from "lucide-react";
import { useManagement } from "./ManagementProvider";
import {
  customerStats,
  financialMetrics,
  queueOrders,
  inPeriod,
} from "@/lib/management";
import {
  DEMO_DURATION,
  localDate,
  money,
  shiftedDate,
} from "@/lib/demo-bookings";
import { Avatar, FlowChart, Kpi, MgBadge, SectionTitle } from "./Shared";
export function Overview() {
  const s = useManagement();
  const today = localDate();
  const from = today.slice(0, 7) + "-01";
  const finances = financialMetrics(s, from, today);
  const appointments = s.orders
    .filter(
      (o) =>
        o.booking.modality === "APPOINTMENT" &&
        o.booking.date === today &&
        o.booking.status === "BOOKED",
    )
    .sort((a, b) => a.booking.time.localeCompare(b.booking.time));
  const queue = queueOrders(s.orders);
  const cancellations = s.orders.filter(
    (o) => o.booking.orderStatus === "CANCELLATION_REQUESTED",
  );
  const followups = s.customers
    .map((c) => ({ customer: c, ...customerStats(s, c, s.now) }))
    .filter((c) => c.needsFollowup)
    .sort((a, b) => (b.days || 0) - (a.days || 0));
  const bars = Array.from({ length: 7 }, (_, i) => {
    const day = shiftedDate(i - 6);
    return {
      label: new Date(day + "T12:00:00-03:00")
        .toLocaleDateString("pt-BR", { weekday: "short" })
        .replace(".", ""),
      value: s.orders
        .filter(
          (o) =>
            inPeriod(o.booking.paidAt, day, day) &&
            o.booking.paymentStatus !== "PENDING",
        )
        .reduce((sum, o) => sum + o.booking.amount, 0),
    };
  });
  return (
    <>
      <div className="mg-page-heading">
        <div>
          <span className="mg-eyebrow">
            <Sun size={14} /> UM BOM DIA COMEÇA COM CLAREZA
          </span>
          <h1>
            Seu dia, em perspectiva<span>.</span>
          </h1>
          <p>
            Cuide de cada encontro. A gente organiza o que vem antes e depois.
          </p>
        </div>
        <Link className="product-button" href="/gestao/agenda">
          <CalendarDays size={17} /> Abrir minha agenda
        </Link>
      </div>
      <div className="mg-date-line">
        {new Date(today + "T12:00:00-03:00").toLocaleDateString("pt-BR", {
          dateStyle: "full",
        })}
        <span>Visão de hoje e do mês atual</span>
      </div>
      <div className="mg-kpis">
        <Kpi
          icon={Wallet}
          label="Recebido no mês"
          value={money(finances.gross)}
          detail={`${finances.count} pagamentos aprovados · exemplo`}
          accent
        />
        <Kpi
          icon={CalendarDays}
          label="Consultas hoje"
          value={String(appointments.length).padStart(2, "0")}
          detail="Horários confirmados na agenda"
        />
        <Kpi
          icon={MessageCircle}
          label="Perguntas na fila"
          value={String(queue.length).padStart(2, "0")}
          detail={`${queue.filter((o) => o.booking.priority).length} prioritárias aguardando início`}
        />
        <Kpi
          icon={Users}
          label="Hora de retomar contato"
          value={String(followups.length).padStart(2, "0")}
          detail={`Sem retorno há ${s.settings.returnDays}+ dias`}
        />
      </div>
      <div className="mg-overview-grid">
        <section className="mg-card mg-day">
          <SectionTitle
            title="Seus encontros de hoje"
            detail="Espaço para atender com presença."
            action={
              <Link href="/gestao/agenda">
                Ver agenda <ArrowUpRight size={15} />
              </Link>
            }
          />
          <div className="mg-agenda-list">
            {appointments.map((o) => {
              const c = s.customers.find((c) => c.id === o.customerId)!;
              return (
                <Link
                  key={o.booking.id}
                  href={"/gestao/pedidos?pedido=" + o.booking.id}
                  className="mg-agenda-row"
                >
                  <div className="mg-time">
                    <strong>{o.booking.time}</strong>
                    <small>{DEMO_DURATION} min</small>
                  </div>
                  <div className="mg-agenda-line" />
                  <Avatar name={c.name} />
                  <div className="mg-agenda-person">
                    <strong>{c.name}</strong>
                    <span>Consulta de Baralho Cigano</span>
                  </div>
                  <MgBadge tone="green">Confirmada</MgBadge>
                  <ArrowUpRight size={16} />
                </Link>
              );
            })}
            {!appointments.length && (
              <div className="mg-soft-empty">
                Sua agenda está livre para hoje.
              </div>
            )}
          </div>
          <div className="mg-calendar-connect">
            <span className="mg-google-icon">G</span>
            <div>
              <strong>Sua agenda, onde você já está.</strong>
              <p>Veja como acompanhar os encontros no Google Agenda.</p>
            </div>
            <Link href="/gestao/integracoes">
              <ArrowRight size={19} />
            </Link>
          </div>
        </section>
        <section className="mg-card mg-attention">
          <SectionTitle
            title="Pedem o seu olhar"
            detail="O que merece atenção agora."
          />
          <Link href="/gestao/pedidos?filtro=cancelamentos" className="mg-task">
            <span className="mg-task-icon orange">
              <AlertCircle size={20} />
            </span>
            <div>
              <strong>
                {cancellations.length} cancelamento
                {cancellations.length !== 1 ? "s" : ""} em análise
              </strong>
              <p>Revise o contexto e registre sua decisão.</p>
            </div>
            <ArrowUpRight size={15} />
          </Link>
          <Link href="/gestao/perguntas" className="mg-task">
            <span className="mg-task-icon">
              <MessageCircle size={20} />
            </span>
            <div>
              <strong>{queue.length} perguntas esperando por você</strong>
              <p>Prioridade primeiro; início registrado por você.</p>
            </div>
            <ArrowUpRight size={15} />
          </Link>
          <Link href="/gestao/financeiro" className="mg-task">
            <span className="mg-task-icon">
              <Wallet size={20} />
            </span>
            <div>
              <strong>{money(finances.refundPending)} a devolver</strong>
              <p>Reembolsos aprovados, ainda em processamento.</p>
            </div>
            <ArrowUpRight size={15} />
          </Link>
          <div className="mg-attention-foot">
            <Check size={15} /> Cada ação mantém um histórico no painel.
          </div>
        </section>
        <section className="mg-card">
          <SectionTitle
            title="O movimento do seu negócio"
            detail="Recebimentos nos últimos 7 dias · dados de exemplo"
            action={
              <Link href="/gestao/financeiro">
                Financeiro <ArrowUpRight size={15} />
              </Link>
            }
          />
          <FlowChart
            values={bars.map((b) => b.value)}
            labels={bars.map((b) => b.label)}
          />
        </section>
        <section className="mg-card mg-relationships">
          <SectionTitle
            title="Manter o vínculo"
            detail="Um lembrete para quem você quer ouvir de novo."
            action={
              <Link href="/gestao/consulentes?filtro=retorno">
                <ArrowUpRight size={17} />
              </Link>
            }
          />
          {followups.slice(0, 3).map((c) => (
            <div className="mg-return-row" key={c.customer.id}>
              <Avatar name={c.customer.name} small />
              <div>
                <strong>{c.customer.name}</strong>
                <span>Último atendimento há {c.days} dias</span>
              </div>
              <Link
                href="/gestao/consulentes?filtro=retorno"
                aria-label={`Ver lembrete de ${c.customer.name}`}
              >
                <ArrowUpRight size={17} />
              </Link>
            </div>
          ))}
          {!followups.length && (
            <p className="mg-soft-empty">
              Nenhum retorno pendente neste momento.
            </p>
          )}
          <p className="mg-relationship-note">
            <Clock3 size={14} /> Lembretes internos. Você escolhe quando
            conversar.
          </p>
        </section>
      </div>
    </>
  );
}
