"use client";
import { useState } from "react";
import {
  Bell,
  Mail,
  CheckCheck,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { useManagement } from "./ManagementProvider";
import { prettyTimestamp } from "@/lib/demo-bookings";
import { Empty, MgBadge } from "./Shared";
import { Modal } from "@/components/portal/Modal";
import { OrderModal } from "./OrderModal";
const noticeIcons = {
  cancellation: AlertCircle,
  payment: CheckCircle2,
  agenda: Bell,
  question: Bell,
  customer: Bell,
  system: Bell,
};
const emailStatus = {
  FAILED: { tone: "red", label: "Falha simulada" },
  SIMULATED: { tone: "green", label: "Processado na simulação" },
  PREVIEW: { tone: "neutral", label: "Prévia pronta" },
} as const;
export function Notifications() {
  const s = useManagement();
  const [tab, setTab] = useState("all");
  const [email, setEmail] = useState<string | null>(null);
  const [order, setOrder] = useState<string | null>(null);
  const [audience, setAudience] = useState("all");
  const current = s.emails.find((e) => e.id === email);
  const notices = s.notices.filter((n) => tab !== "unread" || !n.read);
  return (
    <>
      <div className="mg-page-heading">
        <div>
          <span className="mg-eyebrow">NADA IMPORTANTE PASSA DESPERCEBIDO</span>
          <h1>
            Seu centro de notificações<span>.</span>
          </h1>
          <p>
            Eventos do negócio e mensagens previstas para você e seus
            consulentes.
          </p>
        </div>
        <button
          className="product-button secondary"
          onClick={() => s.markRead()}
        >
          <CheckCheck size={17} /> Marcar todas como lidas
        </button>
      </div>
      <div className="mg-toolbar">
        <div className="mg-tabs">
          {[
            ["all", "Todas"],
            ["unread", "Não lidas"],
            ["email", "E-mails"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              {label}
              {id === "unread" && (
                <b>{s.notices.filter((n) => !n.read).length}</b>
              )}
            </button>
          ))}
        </div>
        {tab === "email" && (
          <select
            className="mg-select"
            aria-label="Destinatário dos e-mails"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
          >
            <option value="all">Todos os destinatários</option>
            <option value="OWNER">Para mim</option>
            <option value="CUSTOMER">Para o consulente</option>
          </select>
        )}
      </div>
      {tab !== "email" ? (
        <section className="mg-card mg-notice-list">
          {notices.map((n) => {
            const NoticeIcon = noticeIcons[n.type];
            return (
            <article key={n.id} className={!n.read ? "unread" : ""}>
              <span
                className={`mg-task-icon ${n.type === "cancellation" ? "orange" : ""}`}
              >
                <NoticeIcon size={20} />
              </span>
              <div>
                <div className="mg-notice-title">
                  <h2>{n.title}</h2>
                  {!n.read && <i />}
                </div>
                <p>{n.description}</p>
                <small>{prettyTimestamp(n.at)} · horário de Brasília</small>
                <div className="mg-notice-actions">
                  {n.orderId && (
                    <button
                      onClick={() => {
                        setOrder(n.orderId!);
                        s.markRead(n.id);
                      }}
                    >
                      Ver pedido <ArrowUpRight size={13} />
                    </button>
                  )}
                  {!n.read && (
                    <button onClick={() => s.markRead(n.id)}>
                      Marcar como lida
                    </button>
                  )}
                </div>
              </div>
            </article>
            );
          })}
          {!notices.length && (
            <Empty
              title="Tudo visto por aqui"
              text="Os próximos eventos aparecerão nesta central."
            />
          )}
        </section>
      ) : (
        <>
          <div className="mg-inline-note">
            <Mail size={20} />
            <p>
              Esta é uma caixa de saída demonstrativa. Você pode ler os modelos,
              simular uma falha e repetir a tentativa. Nenhum e-mail é enviado
              de verdade.
            </p>
            <button className="text-link" onClick={s.dailyDigest}>
              Gerar prévia do resumo diário
            </button>
          </div>
          <section className="mg-card mg-table-wrap">
            <table className="mg-table">
              <thead>
                <tr>
                  <th>Mensagem</th>
                  <th>Destinatário</th>
                  <th>Data</th>
                  <th>Situação</th>
                  <th>
                    <span className="sr-only">Ver e-mail</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {s.emails
                  .filter((e) => audience === "all" || e.audience === audience)
                  .map((e) => (
                    <tr key={e.id}>
                      <td>
                        <strong>{e.subject}</strong>
                        <small>
                          {e.orderId || "Comunicação de conta / gestão"}
                        </small>
                      </td>
                      <td>
                        <strong>
                          {e.audience === "OWNER"
                            ? "Você · prestador"
                            : "Consulente"}
                        </strong>
                        <small>{e.recipient}</small>
                      </td>
                      <td>{prettyTimestamp(e.at)}</td>
                      <td>
                        <MgBadge tone={emailStatus[e.status].tone}>
                          {emailStatus[e.status].label}
                        </MgBadge>
                      </td>
                      <td>
                        <button
                          className="mg-icon-button"
                          aria-label={`Visualizar e-mail ${e.id}`}
                          onClick={() => setEmail(e.id)}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!s.emails.length && (
              <Empty
                title="A caixa de e-mails começa aqui"
                text="Gere um resumo diário ou teste um pagamento na área do cliente, na mesma aba."
              />
            )}
          </section>
        </>
      )}
      {current && (
        <Modal title="Prévia de e-mail" onClose={() => setEmail(null)}>
          <div className="mg-email-envelope">
            <div>
              <span>Para</span>
              <strong>{current.recipient}</strong>
            </div>
            <div>
              <span>Assunto</span>
              <strong>{current.subject}</strong>
            </div>
            <div>
              <span>Situação</span>
              <strong>
                {emailStatus[current.status].label}{" "}
                · {current.attempts} tentativa(s)
              </strong>
            </div>
          </div>
          <div className="mg-email-body">
            <span className="mg-email-brand">O tal do Marmoteiro.</span>
            <pre>{current.body}</pre>
          </div>
          {current.status !== "SIMULATED" && (
            <div className="modal-buttons">
              <button
                className="product-button secondary"
                onClick={() => s.simulateEmail(current.id, true)}
              >
                <AlertCircle size={15} />
                Simular falha
              </button>
              <button
                className="product-button"
                onClick={() => s.simulateEmail(current.id)}
              >
                <RefreshCcw size={15} />
                {current.status === "FAILED"
                  ? "Simular nova tentativa"
                  : "Simular processamento"}
              </button>
            </div>
          )}
          <p className="modal-footnote">
            <Clock3 size={13} /> O provedor real distinguirá aceitação, entrega
            e falhas. Esta prévia não realiza envio.
          </p>
        </Modal>
      )}
      {order && <OrderModal id={order} onClose={() => setOrder(null)} />}
    </>
  );
}
