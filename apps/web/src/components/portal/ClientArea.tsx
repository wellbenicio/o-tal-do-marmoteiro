"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  CreditCard,
  CircleHelp,
  ArrowUpRight,
  ArrowRight,
  Plus,
  LogOut,
  Clock3,
  Video,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  RefreshCcw,
  ExternalLink,
  Info,
  Menu,
  X,
  ShieldCheck,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useDemo } from "./DemoProvider";
import { AccountPanels } from "./AccountPanels";
import { BookingDetails, RefundDetails } from "./BookingDetails";
import { Modal } from "./Modal";
import { BookingCalendar } from "./BookingCalendar";
import {
  bookingLabels,
  paymentLabels,
  methodLabels,
  money,
  prettyDate,
  appointmentTimestamp,
  rescheduleEligibility,
  prettyTimestamp,
  orderLabels,
  type DemoBooking,
} from "@/lib/demo-bookings";
type View =
  | "overview"
  | "bookings"
  | "notes"
  | "payments"
  | "help"
  | "questions"
  | "account"
  | "privacy";
type ModalState = {
  type: "details" | "cancel" | "reschedule" | "notes" | "refund" | "join";
  id: string;
} | null;
const nav = [
  {
    id: "questions",
    href: "/minha-conta/perguntas",
    label: "Minhas perguntas",
    icon: MessageCircle,
  },
  {
    id: "account",
    href: "/minha-conta/dados",
    label: "Meus dados",
    icon: UserRound,
  },
  {
    id: "privacy",
    href: "/minha-conta/privacidade",
    label: "Privacidade",
    icon: ShieldCheck,
  },
  {
    id: "overview",
    href: "/minha-conta",
    label: "Visão geral",
    icon: LayoutDashboard,
  },
  {
    id: "bookings",
    href: "/minha-conta/consultas",
    label: "Minhas consultas",
    icon: CalendarDays,
  },
  {
    id: "notes",
    href: "/minha-conta/anotacoes",
    label: "Anotações",
    icon: FileText,
  },
  {
    id: "payments",
    href: "/minha-conta/pagamentos",
    label: "Pagamentos",
    icon: CreditCard,
  },
];
nav.sort(
  (a, b) =>
    [
      "overview",
      "bookings",
      "questions",
      "notes",
      "payments",
      "account",
      "privacy",
    ].indexOf(a.id) -
    [
      "overview",
      "bookings",
      "questions",
      "notes",
      "payments",
      "account",
      "privacy",
    ].indexOf(b.id),
);
const titles: Record<View, string> = {
  questions: "Minhas perguntas",
  account: "Meus dados",
  privacy: "Privacidade",
  overview: "Visão geral",
  bookings: "Minhas consultas",
  notes: "Minhas anotações",
  payments: "Pagamentos e reembolsos",
  help: "Como podemos ajudar?",
};
function Status({ booking }: Readonly<{ booking: DemoBooking }>) {
  return (
    <span className={`status-badge status-${booking.status.toLowerCase()}`}>
      <span />
      {booking.orderStatus === "CANCELLATION_REQUESTED" ||
      booking.orderStatus === "AWAITING_PAYMENT" ||
      booking.orderStatus === "EXPIRED"
        ? orderLabels[booking.orderStatus]
        : bookingLabels[booking.status]}
    </span>
  );
}
function DateTile({ date }: Readonly<{ date: string }>) {
  const d = new Date(date + "T12:00:00");
  return (
    <div className="date-tile">
      <span>
        {d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
      </span>
      <strong>{d.getDate()}</strong>
    </div>
  );
}
export function ClientArea({ view }: Readonly<{ view: View }>) {
  const {
    profile,
    bookings,
    ready,
    now,
    enterDemo,
    signOut,
    cancelBooking,
    rescheduleBooking,
    requestReschedule,
  } = useDemo();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => {
    if (!mobileMenu) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const sidebar = document.querySelector<HTMLElement>(".portal-sidebar");
    const focusables = sidebar?.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled])",
    );
    focusables?.[0]?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileMenu(false);
      if (event.key !== "Tab" || !focusables?.length) return;
      const first = focusables[0],
        last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previousFocus?.focus();
    };
  }, [mobileMenu]);
  const [modal, setModal] = useState<ModalState>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [cancelAck, setCancelAck] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [exceptional, setExceptional] = useState(false);
  const selected = modal ? bookings.find((b) => b.id === modal.id) : undefined;
  const upcoming = bookings
    .filter(
      (b) =>
        b.modality === "APPOINTMENT" &&
        ["CONFIRMED", "AWAITING_PAYMENT"].includes(b.orderStatus) &&
        !b.cancellation &&
        appointmentTimestamp(b.date, b.time) > now,
    )
    .sort(
      (a, b) =>
        appointmentTimestamp(a.date, a.time) -
        appointmentTimestamp(b.date, b.time),
    );
  const completed = bookings.filter(
    (b) => b.modality === "APPOINTMENT" && b.status === "COMPLETED",
  );
  const notes = completed.filter((b) => b.note);
  const next = upcoming[0];
  function open(type: NonNullable<ModalState>["type"], booking: DemoBooking) {
    if (type === "reschedule" && !requestReschedule(booking.id)) return;
    setModal({ type, id: booking.id });
    setCancelReason("");
    setExceptional(false);
    setCancelAck(false);
    setNewDate(booking.date);
    setNewTime("");
  }
  function bookingCard(b: DemoBooking) {
    return (
      <article className="consultation-row" key={b.id}>
        <DateTile date={b.date} />
        <div className="consultation-row-main">
          <Status booking={b} />
          <h3>Consulta de Baralho Cigano</h3>
          <p>
            <Clock3 size={13} />
            {b.time} · 30 minutos<span>Online</span>
          </p>
          {b.previousDate && (
            <small>
              Reagendada de {prettyDate(b.previousDate, true)} ·{" "}
              {b.previousTime}
            </small>
          )}
        </div>
        <div className="consultation-row-actions">
          {b.orderStatus === "AWAITING_PAYMENT" ? (
            <Link
              href={`/agendar?retomar=${b.id}`}
              className="product-button small"
            >
              Continuar pagamento
            </Link>
          ) : b.note ? (
            <button
              className="product-button secondary small"
              onClick={() => open("notes", b)}
            >
              <FileText size={14} /> Ver anotações
            </button>
          ) : null}
          <button
            className="icon-button"
            aria-label={`Ver detalhes da consulta ${b.id}`}
            onClick={() => open("details", b)}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </article>
    );
  }
  if (!ready)
    return (
      <main className="portal-loading">
        <Sparkles size={28} />
        <p>Preparando seu espaço…</p>
      </main>
    );
  if (!profile)
    return (
      <main className="portal-empty-access">
        <Link href="/">
          <Image
            src="/assets/Group 289458.png"
            width={150}
            height={72}
            alt="O Tal do Marmoteiro"
          />
        </Link>
        <span className="result-icon">
          <Sparkles size={35} />
        </span>
        <h1>Conheça seu novo espaço.</h1>
        <p>
          Explore uma conta fictícia com consultas, anotações e pagamentos para
          testar a experiência.
        </p>
        <button className="product-button" onClick={() => enterDemo()}>
          Entrar na demonstração <ArrowRight size={17} />
        </button>
        <Link className="text-link" href="/login">
          Ir para login ou cadastro
        </Link>
        <small>Prévia visual. Nenhuma conta ou pagamento real.</small>
      </main>
    );
  return (
    <div className="portal-app">
      <aside className={`portal-sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <Link href="/" className="sidebar-logo">
          <Image
            src="/assets/Group 289458.png"
            width={149}
            height={72}
            alt="O Tal do Marmoteiro"
          />
        </Link>
        <button
          className="sidebar-close"
          aria-label="Fechar navegação"
          onClick={() => setMobileMenu(false)}
        >
          <X />
        </button>
        <p className="sidebar-label">SEU ESPAÇO</p>
        <nav aria-label="Área do cliente">
          {nav.map(({ id, href, label, icon: Icon }) => (
            <Link key={id} href={href} className={view === id ? "active" : ""}>
              <Icon size={18} />
              {label}
              {id === "notes" && notes.length > 0 && (
                <span>{notes.length}</span>
              )}
            </Link>
          ))}
          <div className="sidebar-divider" />
          <Link href="/agendar">
            <Plus size={18} /> Agendar consulta
          </Link>
          <Link
            href="/minha-conta/ajuda"
            className={view === "help" ? "active" : ""}
          >
            <CircleHelp size={18} /> Preciso de ajuda
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <Sparkles size={19} />
            <p>
              Um momento de pausa.
              <br />
              Um novo olhar para você.
            </p>
          </div>
          <div className="sidebar-profile">
            <span className="profile-avatar">
              {profile.name.slice(0, 1).toUpperCase()}
            </span>
            <span>
              <strong>{profile.name}</strong>
              <small>Modo demonstração</small>
            </span>
            <button
              aria-label="Sair da conta"
              title="Sair e apagar os dados desta demonstração"
              onClick={() => {
                signOut();
                router.push("/login");
              }}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <div className="portal-main">
        <header className="portal-topbar">
          <div>
            <button
              className="portal-menu-button"
              aria-label="Abrir navegação"
              aria-expanded={mobileMenu}
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Sua área</span>
            <ChevronRight size={13} />
            <strong>{titles[view]}</strong>
          </div>
          <Link href="/">
            Voltar para o site <ArrowUpRight size={15} />
          </Link>
        </header>
        <div className="portal-content">
          <div className="portal-page-heading">
            <div>
              <span className="portal-eyebrow">
                {view === "overview" ? "UM MOMENTO SÓ SEU" : "ÁREA DO CLIENTE"}
              </span>
              <h1>
                {view === "overview" ? (
                  <>
                    Olá, {profile.name.split(" ")[0]}
                    <span className="greeting-dot">.</span>
                  </>
                ) : (
                  titles[view]
                )}
              </h1>
              <p>
                {view === "overview"
                  ? "Que bom ter você por aqui. Vamos cuidar dos seus próximos passos?"
                  : view === "account"
                    ? "Seus dados, contatos e solicitações de correção."
                    : view === "privacy"
                      ? "Acompanhe suas solicitações e conheça seus direitos."
                      : view === "questions"
                        ? "Sua pergunta, o andamento e cada próximo passo."
                        : view === "bookings"
                          ? "Sua história de encontros, organizada em um só lugar."
                          : view === "notes"
                            ? "Reflexões para revisitar, sempre que fizer sentido."
                            : view === "payments"
                              ? "Acompanhe cada pagamento, cancelamento e reembolso."
                              : "Encontre orientações para aproveitar sua experiência."}
              </p>
            </div>
            <Link href="/agendar" className="product-button">
              <Plus size={17} /> Nova consulta
            </Link>
          </div>
          <div className="demo-banner compact">
            <Sparkles size={15} />
            <span>
              Conta de demonstração · dados fictícios e ações simuladas, sem
              cobranças reais.{" "}
              <Link
                href="/gestao"
                style={{ textDecoration: "underline", textUnderlineOffset: 3 }}
              >
                Acesso administrativo
              </Link>
            </span>
          </div>
          {view === "overview" && (
            <>
              <div className="dashboard-stats">
                <div>
                  <span className="stat-icon">
                    <CalendarDays size={21} />
                  </span>
                  <span>
                    Próximas consultas
                    <strong>
                      {upcoming.length.toString().padStart(2, "0")}
                    </strong>
                  </span>
                </div>
                <div>
                  <span className="stat-icon">
                    <CheckCircle2 size={21} />
                  </span>
                  <span>
                    Consultas realizadas
                    <strong>
                      {completed.length.toString().padStart(2, "0")}
                    </strong>
                  </span>
                </div>
                <div>
                  <span className="stat-icon">
                    <FileText size={21} />
                  </span>
                  <span>
                    Perguntas pendentes
                    <strong>
                      {bookings
                        .filter(
                          (b) =>
                            b.modality === "QUESTION" &&
                            ["QUEUED", "IN_PROGRESS", "SUSPENDED"].includes(
                              b.status,
                            ),
                        )
                        .length.toString()
                        .padStart(2, "0")}
                    </strong>
                  </span>
                </div>
              </div>
              <div className="dashboard-columns">
                <div>
                  <div className="subsection-heading">
                    <h2>Seu próximo encontro</h2>
                    <Link href="/minha-conta/consultas">
                      Ver todas <ArrowRight size={14} />
                    </Link>
                  </div>
                  {next ? (
                    <article className="next-consultation portal-card">
                      <div className="next-consultation-top">
                        <span className="portal-eyebrow">
                          {next.orderStatus === "AWAITING_PAYMENT"
                            ? "AGUARDANDO SEU PAGAMENTO"
                            : "TEMOS UM ENCONTRO MARCADO"}
                        </span>
                        <Status booking={next} />
                      </div>
                      <h2>
                        Um momento para
                        <br />
                        <em>olhar para você.</em>
                      </h2>
                      <div className="next-date">
                        <DateTile date={next.date} />
                        <div>
                          <strong>{prettyDate(next.date)}</strong>
                          <p>{next.time} · 30 minutos · Horário de Brasília</p>
                          <span>
                            <Video size={14} /> Atendimento online e individual
                          </span>
                        </div>
                      </div>
                      <div className="next-actions">
                        {next.orderStatus === "AWAITING_PAYMENT" ? (
                          <Link
                            className="product-button"
                            href={`/agendar?retomar=${next.id}`}
                          >
                            Continuar pagamento <ArrowRight size={16} />
                          </Link>
                        ) : (
                          <button
                            className="product-button"
                            onClick={() => open("join", next)}
                          >
                            <Video size={16} /> Acessar consulta
                          </button>
                        )}
                        <button
                          className="product-button secondary"
                          onClick={() => open("details", next)}
                        >
                          Ver detalhes
                        </button>
                      </div>
                      <p className="next-footnote">
                        <Info size={13} /> O acesso à chamada será
                        disponibilizado na versão integrada.
                      </p>
                    </article>
                  ) : (
                    <div className="portal-card empty-state">
                      <CalendarDays size={34} />
                      <h3>Um espaço na sua agenda.</h3>
                      <p>Escolha um horário para sua próxima conversa.</p>
                      <Link href="/agendar" className="product-button">
                        Agendar uma consulta
                      </Link>
                    </div>
                  )}
                  <div className="subsection-heading">
                    <h2>Últimas consultas</h2>
                    <Link href="/minha-conta/consultas">
                      Ver histórico <ArrowRight size={14} />
                    </Link>
                  </div>
                  <div className="portal-card consultation-list">
                    {completed.length ? (
                      completed.slice(0, 2).map(bookingCard)
                    ) : (
                      <div className="empty-state">
                        <p>Suas consultas realizadas aparecerão aqui.</p>
                      </div>
                    )}
                  </div>
                </div>
                <aside className="dashboard-aside">
                  <div className="notes-promo portal-card">
                    <span className="notion-mark">N</span>
                    <span className="portal-eyebrow">PARA LEVAR COM VOCÊ</span>
                    <h2>
                      A conversa continua
                      <br />
                      nas suas anotações.
                    </h2>
                    <p>
                      Revisite os temas e reflexões compartilhados na consulta.
                    </p>
                    <Link href="/minha-conta/anotacoes">
                      Explorar minhas anotações <ArrowUpRight size={17} />
                    </Link>
                  </div>
                  <div className="care-card portal-card">
                    <HeartIcon />
                    <h3>Chegue como você é.</h3>
                    <p>
                      Reserve um lugar tranquilo, prepare suas perguntas e
                      permita-se essa pausa.
                    </p>
                    <span>O resto, a gente conversa.</span>
                  </div>
                  {bookings.some(
                    (b) =>
                      b.paymentStatus === "REFUND_PENDING" ||
                      b.orderStatus === "CANCELLATION_REQUESTED",
                  ) && (
                    <Link
                      className="refund-callout"
                      href="/minha-conta/pagamentos"
                    >
                      <RefreshCcw size={19} />
                      <span>
                        Você tem solicitações para acompanhar.
                        <strong>
                          Acompanhar solicitação <ArrowRight size={13} />
                        </strong>
                      </span>
                    </Link>
                  )}
                </aside>
              </div>
            </>
          )}
          {view === "bookings" && (
            <>
              <fieldset
                className="portal-filters"
                aria-label="Filtrar consultas"
              >
                {[
                  { id: "all", label: "Todas" },
                  { id: "upcoming", label: "Próximas" },
                  { id: "completed", label: "Realizadas" },
                  { id: "canceled", label: "Canceladas" },
                ].map((f) => (
                  <button
                    key={f.id}
                    className={filter === f.id ? "active" : ""}
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </fieldset>
              <div className="portal-card consultation-list">
                {bookings
                  .filter((b) => b.modality === "APPOINTMENT")
                  .filter(
                    (b) =>
                      filter === "all" ||
                      (filter === "upcoming" && upcoming.includes(b)) ||
                      (filter === "completed" && b.status === "COMPLETED") ||
                      (filter === "canceled" &&
                        ["CANCELED", "EXPIRED"].includes(b.orderStatus)),
                  )
                  .sort(
                    (a, b) =>
                      appointmentTimestamp(b.date, b.time) -
                      appointmentTimestamp(a.date, a.time),
                  )
                  .map(bookingCard)}
                {!bookings
                  .filter((b) => b.modality === "APPOINTMENT")
                  .some(
                    (b) =>
                      filter === "all" ||
                      (filter === "upcoming" && upcoming.includes(b)) ||
                      (filter === "completed" && b.status === "COMPLETED") ||
                      (filter === "canceled" &&
                        ["CANCELED", "EXPIRED"].includes(b.orderStatus)),
                  ) && (
                  <div className="empty-state">
                    <CalendarDays size={32} />
                    <h3>Nenhuma consulta por aqui ainda.</h3>
                    <p>
                      Quando houver consultas nesta categoria, elas aparecerão
                      aqui.
                    </p>
                  </div>
                )}
              </div>
              <p className="table-caption">
                Datas e horários de Brasília · Selecione uma consulta para ver
                os detalhes.
              </p>
            </>
          )}
          {view === "notes" && (
            <>
              <div className="notes-intro">
                <span className="notion-mark">N</span>
                <div>
                  <h2>Seu caderno de reflexões</h2>
                  <p>
                    Aqui ficam os materiais e os links do Notion compartilhados
                    após cada consulta.
                  </p>
                </div>
                <span className="status-badge status-completed">
                  {notes.length} disponíveis
                </span>
              </div>
              <div className="note-grid">
                {notes.map((b) => (
                  <article className="note-card portal-card" key={b.id}>
                    <div>
                      <span className="note-icon">
                        <FileText size={23} />
                      </span>
                      <span>{prettyDate(b.date, true)}</span>
                    </div>
                    <h2>{b.note?.title}</h2>
                    <p>Consulta de Baralho Cigano · {b.time}</p>
                    <div className="note-tags">
                      {b.note?.topics.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <button onClick={() => open("notes", b)}>
                      Visualizar anotações de exemplo <ArrowUpRight size={17} />
                    </button>
                  </article>
                ))}
              </div>
              {!notes.length && (
                <div className="portal-card empty-state">
                  <FileText size={34} />
                  <h3>Suas reflexões vão encontrar um lugar aqui.</h3>
                  <p>
                    Os materiais compartilhados após a consulta aparecerão nesta
                    página.
                  </p>
                </div>
              )}
              <div className="inline-info">
                <ShieldCheck size={19} />
                <p>
                  Os exemplos desta prévia são fictícios. Os links reais do
                  Notion serão vinculados a cada consulta na integração, com
                  acesso restrito ao cliente.
                </p>
              </div>
            </>
          )}
          {view === "payments" && (
            <>
              <div className="payments-summary">
                <div>
                  <span>Pagamentos aprovados</span>
                  <strong>
                    {money(
                      bookings
                        .filter((b) => b.paymentStatus === "APPROVED")
                        .reduce((sum, b) => sum + b.amount, 0),
                    )}
                  </strong>
                </div>
                <div>
                  <span>Reembolso em processamento</span>
                  <strong>
                    {money(
                      bookings
                        .filter((b) => b.paymentStatus === "REFUND_PENDING")
                        .reduce(
                          (sum, b) =>
                            sum + (b.cancellation?.result.amount ?? 0),
                          0,
                        ),
                    )}
                  </strong>
                </div>
                <div>
                  <span>Reembolsos concluídos</span>
                  <strong>
                    {money(
                      bookings
                        .filter((b) =>
                          ["REFUNDED", "PARTIALLY_REFUNDED"].includes(
                            b.paymentStatus,
                          ),
                        )
                        .reduce(
                          (sum, b) =>
                            sum + (b.cancellation?.result.amount ?? 0),
                          0,
                        ),
                    )}
                  </strong>
                </div>
              </div>
              <div className="portal-card payment-table-wrap">
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Atendimento</th>
                      <th>Forma</th>
                      <th>Valor</th>
                      <th>Situação</th>
                      <th>
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <strong>
                            {b.modality === "QUESTION"
                              ? "Pergunta avulsa"
                              : prettyDate(b.date, true)}
                          </strong>
                          <small>{b.id}</small>
                        </td>
                        <td>{methodLabels[b.method]}</td>
                        <td>{money(b.amount)}</td>
                        <td>
                          <span
                            className={`payment-status payment-${b.paymentStatus.toLowerCase()}`}
                          >
                            {paymentLabels[b.paymentStatus]}
                          </span>
                          {b.orderStatus === "CANCELLATION_REQUESTED" && (
                            <small>Cancelamento em análise</small>
                          )}
                        </td>
                        <td>
                          <button
                            className="icon-button"
                            aria-label={`Ver pagamento ${b.id}`}
                            onClick={() =>
                              open(b.cancellation ? "refund" : "details", b)
                            }
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!bookings.length && (
                  <div className="empty-state">
                    <p>Os pagamentos das suas consultas aparecerão aqui.</p>
                  </div>
                )}
              </div>
              <div className="inline-info">
                <Info size={18} />
                <p>
                  Valores de demonstração. A solicitação de cancelamento não
                  representa aprovação automática de reembolso. O resultado
                  considera o direito aplicável, o momento da solicitação e
                  eventuais exceções. Cada protocolo tem acompanhamento próprio.
                </p>
              </div>
            </>
          )}
          {view === "help" && (
            <>
              <div className="help-grid">
                <Link className="portal-card" href="/minha-conta/consultas">
                  <CalendarDays />
                  <h2>Gerenciar uma consulta</h2>
                  <p>
                    Veja os detalhes e encontre as opções de reagendamento e
                    cancelamento.
                  </p>
                  <span>
                    Abrir minhas consultas <ArrowRight size={16} />
                  </span>
                </Link>
                <Link className="portal-card" href="/minha-conta/pagamentos">
                  <CreditCard />
                  <h2>Acompanhar um pagamento</h2>
                  <p>
                    Confira pagamentos pendentes e a situação dos reembolsos.
                  </p>
                  <span>
                    Ver meus pagamentos <ArrowRight size={16} />
                  </span>
                </Link>
              </div>
              <div className="portal-card help-faq">
                <h2>Antes do seu encontro</h2>
                {[
                  {
                    q: "Como acesso a consulta?",
                    a: "Na versão integrada, o link ficará nos detalhes da consulta confirmada. Nesta prévia, a chamada é apenas demonstrada e nenhum atendimento real é realizado.",
                  },
                  {
                    q: "Como remarco ou cancelo?",
                    a: "Abra os detalhes do atendimento. Há um reagendamento por sua iniciativa, solicitado com pelo menos 24h de antecedência, e 48h para escolher. Cancelamento e arrependimento geram protocolo, com avaliação do direito aplicável e das exceções.",
                  },
                  {
                    q: "Onde encontro minhas anotações?",
                    a: "Na página Minhas anotações, cada consulta realizada pode reunir um resumo e o link do Notion compartilhado pelo Marmoteiro. Os exemplos atuais são fictícios.",
                  },
                  {
                    q: "Posso testar sem usar meus dados reais?",
                    a: "Sim. Esta conta é uma demonstração. Use dados fictícios; ao sair, os dados da prévia são apagados deste navegador.",
                  },
                ].map((item) => (
                  <details key={item.q}>
                    <summary>
                      {item.q}
                      <Plus size={16} />
                    </summary>
                    <p>{item.a}</p>
                  </details>
                ))}
                <Link className="text-link" href="/termos">
                  Ler documentos e condições <ExternalLink size={14} />
                </Link>
              </div>
            </>
          )}
          {(view === "account" || view === "privacy") && (
            <AccountPanels view={view} />
          )}
          {view === "questions" && (
            <>
              <div className="question-overview portal-card">
                <MessageCircle size={30} />
                <div>
                  <h2>Uma pergunta pode abrir caminhos.</h2>
                  <p>
                    Resposta pelo WhatsApp com identificação da pergunta, foto
                    do jogo e áudio. Até 48 horas úteis desde a confirmação do
                    pagamento.
                  </p>
                </div>
                <Link
                  className="product-button"
                  href="/agendar?modalidade=pergunta"
                >
                  Nova pergunta <Plus size={16} />
                </Link>
              </div>
              <div className="question-list">
                {bookings
                  .filter((b) => b.modality === "QUESTION")
                  .map((b) => (
                    <article className="portal-card question-card" key={b.id}>
                      <div className="subsection-heading">
                        <span className="portal-eyebrow">{b.id}</span>
                        <Status booking={b} />
                      </div>
                      <h2>Pergunta avulsa</h2>
                      <p>
                        {b.priority ? "Fila prioritária" : "Fila regular"} ·
                        WhatsApp · {money(b.amount)}
                      </p>
                      <p className="field-hint">
                        {b.status === "QUEUED"
                          ? "Aguardando início pelo prestador. A prioridade não interrompe atendimentos já iniciados."
                          : "Acompanhe os eventos e as solicitações nos detalhes."}
                      </p>
                      <button
                        className="product-button secondary"
                        onClick={() => open("details", b)}
                      >
                        Ver atendimento <ArrowRight size={16} />
                      </button>
                    </article>
                  ))}
              </div>
              {!bookings.some((b) => b.modality === "QUESTION") && (
                <div className="portal-card empty-state">
                  <MessageCircle size={32} />
                  <h3>Suas perguntas vão aparecer aqui.</h3>
                  <p>Escolha a modalidade para conhecer a contratação.</p>
                </div>
              )}
              <p className="inline-info">
                O calendário operacional ainda não está configurado na
                demonstração. Por isso não exibimos uma data limite fictícia
                como prazo real.
              </p>
            </>
          )}
          <footer className="portal-footer">
            <span>O Tal do Marmoteiro · Seu espaço de cuidado.</span>
            <Link href="/termos">
              Orientações e condições <ArrowUpRight size={12} />
            </Link>
          </footer>
        </div>
      </div>
      {modal && selected && (
        <Modal
          title={
            modal.type === "cancel"
              ? "Solicitar cancelamento"
              : modal.type === "reschedule"
                ? "Um novo momento para você"
                : modal.type === "notes"
                  ? "Anotações da consulta"
                  : modal.type === "refund"
                    ? "Acompanhar reembolso"
                    : modal.type === "join"
                      ? "Seu encontro online"
                      : "Detalhes do atendimento"
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "details" && (
            <BookingDetails
              booking={selected}
              onAction={(action) => open(action, selected)}
            />
          )}
          {modal.type === "join" && (
            <>
              <div className="join-preview">
                <Video size={38} />
                <h3>Seu link ficará aqui.</h3>
                <p>
                  {prettyDate(selected.date)} · {selected.time}
                </p>
              </div>
              <p className="modal-description">
                O acesso ao atendimento aparecerá nesta tela na versão
                integrada. Nenhuma chamada real está vinculada a esta consulta
                de demonstração.
              </p>
              <button
                className="product-button secondary full"
                onClick={() => setModal(null)}
              >
                Entendi
              </button>
            </>
          )}
          {modal.type === "cancel" && (
            <>
              <p className="modal-description">
                Solicite cancelamento ou exerça o direito de arrependimento de{" "}
                <strong>{selected.id}</strong>. O protocolo será registrado
                imediatamente nesta área.
              </p>
              <div className="policy-summary">
                <p>
                  O direito legal aplicável prevalece sobre retenções. Quando
                  aplicável, cancelamento com menos de 24h: 30% retido e 70%
                  restituído. No-show caracterizado: 50% / 50%.
                </p>
                <p>
                  Pedidos já entregues ou situações excepcionais são
                  encaminhados para análise. O início do atendimento, sozinho,
                  não retira direitos.
                </p>
              </div>
              <div className="portal-form">
                <label>
                  Motivo <small>(opcional)</small>
                  <textarea
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Conte o que aconteceu, sem informações sensíveis desnecessárias."
                  />
                </label>
              </div>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={exceptional}
                  onChange={(e) => setExceptional(e.target.checked)}
                />
                <span>
                  Há uma situação excepcional que gostaria que fosse avaliada.
                </span>
              </label>
              <p className="pending-policy">
                {selected.paymentStatus === "APPROVED"
                  ? "Nesta prévia, a solicitação fica em análise para apurar o direito aplicável e o valor. Não há aprovação automática de reembolso nem envio real de e-mail."
                  : "A reserva de exemplo será cancelada, sem cobrança."}
              </p>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={cancelAck}
                  onChange={(e) => setCancelAck(e.target.checked)}
                />
                <span>Quero registrar esta solicitação na demonstração.</span>
              </label>
              <div className="modal-buttons">
                <button
                  className="product-button secondary"
                  onClick={() => setModal(null)}
                >
                  Voltar
                </button>
                <button
                  className="product-button danger"
                  disabled={!cancelAck}
                  onClick={() => {
                    cancelBooking(selected.id, cancelReason, exceptional);
                    setModal({ type: "refund", id: selected.id });
                  }}
                >
                  Confirmar solicitação
                </button>
              </div>
            </>
          )}
          {modal.type === "reschedule" && (
            <>
              <p className="modal-description">
                Horário atual: {prettyDate(selected.date, true)} ·{" "}
                {selected.time}. Escolha seu novo horário abaixo.
              </p>
              <BookingCalendar
                date={newDate}
                time={newTime}
                onDate={setNewDate}
                onTime={setNewTime}
                bookings={bookings}
                except={selected.id}
              />
              <p className="pending-policy">
                {selected.rescheduleRequest
                  ? `Opções disponíveis até ${prettyTimestamp(selected.rescheduleRequest.expiresAt)} (Brasília). Seu horário original fica preservado até confirmar. O reagendamento só será consumido na confirmação.`
                  : rescheduleEligibility(selected).reason}
              </p>
              <button
                className="product-button full"
                disabled={
                  !rescheduleEligibility(selected).allowed ||
                  !newDate ||
                  !newTime ||
                  (newDate === selected.date && newTime === selected.time)
                }
                onClick={() => {
                  if (rescheduleBooking(selected.id, newDate, newTime))
                    setModal(null);
                }}
              >
                Confirmar novo horário <CheckCircle2 size={17} />
              </button>
            </>
          )}
          {modal.type === "notes" && selected.note && (
            <>
              <span className="note-preview-tag">
                <span className="notion-mark small">N</span>NOTION · EXEMPLO DE
                MATERIAL
              </span>
              <h3 className="modal-note-title">{selected.note.title}</h3>
              <p className="note-preview-date">
                Consulta de {prettyDate(selected.date)} · {selected.time}
              </p>
              <div className="note-tags">
                {selected.note.topics.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
              <div className="note-preview-body">
                <h4>Para revisitar com calma</h4>
                <p>{selected.note.text}</p>
                <h4>Um convite à reflexão</h4>
                <p>
                  O que fez sentido para você nesta conversa? Que pergunta
                  gostaria de levar para o seu próximo encontro?
                </p>
              </div>
              <button className="product-button secondary full" disabled>
                <ExternalLink size={16} /> Link do Notion ainda não vinculado
              </button>
              <p className="modal-footnote">
                Os links reais serão adicionados por consulta. Nenhuma anotação
                privada foi usada nesta prévia.
              </p>
            </>
          )}
          {modal.type === "refund" && <RefundDetails booking={selected} />}
        </Modal>
      )}
    </div>
  );
}
function HeartIcon() {
  return (
    <span className="care-icon">
      <Sparkles size={23} />
    </span>
  );
}
