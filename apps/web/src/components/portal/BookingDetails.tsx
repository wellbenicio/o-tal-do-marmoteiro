import Link from "next/link";
import {
  FileText,
  RefreshCcw,
  Video,
  ArrowRight,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import {
  bookingLabels,
  orderLabels,
  paymentLabels,
  methodLabels,
  money,
  prettyDate,
  prettyTimestamp,
  canManage,
  rescheduleEligibility,
  type DemoBooking,
} from "@/lib/demo-bookings";
export function BookingDetails({
  booking: b,
  onAction,
  readOnly = false,
}: {
  booking: DemoBooking;
  readOnly?: boolean;
  onAction: (
    action: "cancel" | "reschedule" | "notes" | "refund" | "join",
  ) => void;
}) {
  const eligibility = rescheduleEligibility(b);
  return (
    <>
      <h3 className="modal-service-title">
        {b.modality === "QUESTION"
          ? "Pergunta avulsa"
          : "Consulta de Baralho Cigano"}
      </h3>
      <p className="field-hint">{b.id}</p>
      <div className="state-triptych">
        <div>
          <span>Pedido</span>
          <strong>{orderLabels[b.orderStatus]}</strong>
        </div>
        <div>
          <span>Pagamento</span>
          <strong>{paymentLabels[b.paymentStatus]}</strong>
        </div>
        <div>
          <span>Atendimento</span>
          <strong>{bookingLabels[b.status]}</strong>
        </div>
      </div>
      <dl className="detail-list">
        <div>
          <dt>{b.modality === "QUESTION" ? "Modalidade" : "Data e horário"}</dt>
          <dd>
            {b.modality === "QUESTION"
              ? "WhatsApp · " +
                (b.priority ? "Fila prioritária" : "Fila regular")
              : `${prettyDate(b.date)} · ${b.time}`}
          </dd>
        </div>
        <div>
          <dt>{b.modality === "QUESTION" ? "Prazo máximo" : "Duração"}</dt>
          <dd>
            {b.modality === "QUESTION"
              ? "48 horas úteis após confirmação financeira"
              : "30 minutos · Online"}
          </dd>
        </div>
        <div>
          <dt>Total do pedido</dt>
          <dd>
            {money(b.amount)} · {methodLabels[b.method]}
          </dd>
        </div>
        {b.recordingConsent && (
          <div>
            <dt>Gravação</dt>
            <dd>
              {b.recordingConsent.granted
                ? "Autorizada separadamente"
                : "Não autorizada"}
            </dd>
          </div>
        )}
      </dl>
      {!readOnly && b.modality === "QUESTION" && b.question && (
        <section className="customer-question">
          <h3>Sua pergunta</h3>
          <blockquote>{b.question.text}</blockquote>
          {b.question.context && <p>{b.question.context}</p>}
        </section>
      )}
      {b.modality === "APPOINTMENT" && (
        <section className="appointment-channels">
          <Video size={22} />
          <div>
            <h3>Videochamada · Google Meet</h3>
            <p>
              Convite do Google Calendar e link da chamada por e-mail:
              aguardando integração.
            </p>
            <p>
              Lembrete WhatsApp:{" "}
              {b.whatsappReminderConsent?.granted
                ? "autorizado; envio ainda não conectado"
                : "não autorizado para esta consulta"}
              .
            </p>
          </div>
        </section>
      )}
      {b.modality === "QUESTION" && (
        <p className="inline-info">
          Calendário operacional não configurado nesta prévia; não há data
          limite calculada. Prioridade não altera o SLA nem interrompe
          atendimento iniciado.
        </p>
      )}
      {b.previousDate && (
        <p className="inline-info">
          Reagendada de {prettyDate(b.previousDate, true)} às {b.previousTime}.{" "}
          {b.rescheduleRequest?.causedByProvider
            ? "Alteração pelo prestador: nenhum novo uso do seu direito foi consumido."
            : "Reagendamento do consulente utilizado."}
        </p>
      )}
      {b.cancellation && (
        <section className="request-receipt">
          <span className="portal-eyebrow">SOLICITAÇÃO RECEBIDA</span>
          <h4>{b.cancellation.protocol}</h4>
          <p>
            {prettyTimestamp(b.cancellation.requestedAt)} · horário de Brasília
          </p>
          <p>{b.cancellation.reason || "Motivo não informado."}</p>
          <p>
            Execução na solicitação:{" "}
            {bookingLabels[b.cancellation.executionAtRequest]}.
          </p>
          <p>{b.cancellation.result.reason}</p>
          {!readOnly && (
            <button className="text-link" onClick={() => onAction("refund")}>
              Acompanhar cancelamento e reembolso <ArrowRight size={15} />
            </button>
          )}
        </section>
      )}
      {!readOnly &&
        b.orderStatus === "CONFIRMED" &&
        b.modality === "APPOINTMENT" &&
        b.status === "BOOKED" &&
        !b.cancellation && (
          <div className="modal-action-stack">
            <button
              className="product-button full"
              onClick={() => onAction("join")}
            >
              <Video size={16} />
              Acessar consulta
            </button>
            <button
              className="product-button secondary full"
              disabled={!eligibility.allowed}
              onClick={() => onAction("reschedule")}
            >
              <RefreshCcw size={16} />
              {b.rescheduleRequest?.status === "OPEN"
                ? "Continuar reagendamento"
                : "Reagendar consulta"}
            </button>
            <p className="field-hint">{eligibility.reason}</p>
          </div>
        )}
      {!readOnly && b.orderStatus === "AWAITING_PAYMENT" && (
        <Link className="product-button full" href={`/agendar?retomar=${b.id}`}>
          Continuar pagamento
        </Link>
      )}
      {!readOnly && canManage(b) && (
        <button className="danger-link full" onClick={() => onAction("cancel")}>
          Solicitar cancelamento / arrependimento
        </button>
      )}
      {!readOnly && b.note && (
        <button
          className="product-button secondary full"
          onClick={() => onAction("notes")}
        >
          <FileText size={16} />
          Ver anotações
        </button>
      )}
      <details className="order-documents">
        <summary>
          Documentos apresentados e leituras registradas <FileText size={16} />
        </summary>
        <p className="field-hint">
          Registros demonstrativos, sem aceite contratual real.
        </p>
        {b.acceptances.map((a) => (
          <div key={a.documentId}>
            <Link
              href={`/documentos/${a.documentId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {a.title}
            </Link>
            <small>{a.version}</small>
            <small>{prettyTimestamp(a.acceptedAt)}</small>
            <p>{a.manifestation}</p>
          </div>
        ))}
        {b.recordingConsent && (
          <p>
            Gravação: {b.recordingConsent.granted ? "autorizada" : "recusada"}{" "}
            em {prettyTimestamp(b.recordingConsent.decidedAt)}. Versão:{" "}
            {b.recordingConsent.version}.
          </p>
        )}
      </details>
      <details className="order-documents">
        <summary>
          Histórico do pedido <Clock3 size={16} />
        </summary>
        <ol className="order-timeline">
          {b.timeline.map((event) => (
            <li key={`${event.at}-${event.title}`}>
              <span>{prettyTimestamp(event.at)}</span>
              <p>{event.title}</p>
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}
export function RefundDetails({ booking: b }: { booking: DemoBooking }) {
  const result = b.cancellation?.result;
  const manual = result?.decision === "MANUAL_REVIEW_REQUIRED";
  const refunded = ["REFUNDED", "PARTIALLY_REFUNDED"].includes(b.paymentStatus);
  return (
    <>
      <div className="refund-value">
        <span>
          {manual ? "Solicitação em análise" : paymentLabels[b.paymentStatus]}
        </span>
        <strong>
          {result?.amount == null ? "A apurar" : money(result.amount)}
        </strong>
        <p>
          {b.id} · {methodLabels[b.method]}
        </p>
      </div>
      <dl className="detail-list">
        <div>
          <dt>Total pago</dt>
          <dd>{money(b.paymentStatus === "CANCELLED" ? 0 : b.amount)}</dd>
        </div>
        <div>
          <dt>Retenção</dt>
          <dd>
            {result?.retained == null
              ? "Ainda não definida"
              : money(result.retained)}
          </dd>
        </div>
        <div>
          <dt>Protocolo</dt>
          <dd>{b.cancellation?.protocol || "—"}</dd>
        </div>
        {b.cancellation && (
          <div>
            <dt>Recebido em</dt>
            <dd>{prettyTimestamp(b.cancellation.requestedAt)}</dd>
          </div>
        )}
      </dl>
      <p className="pending-policy">{result?.reason}</p>
      <ol className="refund-timeline">
        {[
          "Solicitação recebida",
          "Avaliação do caso",
          "Processamento da devolução",
        ].map((label, i) => (
          <li
            className={
              i === 0 || refunded || (i === 1 && !manual) ? "done" : "current"
            }
            key={label}
          >
            <span>
              {i === 0 || refunded ? (
                <CheckCircle2 size={17} />
              ) : (
                <Clock3 size={17} />
              )}
            </span>
            <div>
              <strong>{label}</strong>
              <p>
                {i === 0
                  ? "Protocolo registrado na sua área."
                  : i === 1
                    ? manual
                      ? "Aguardando decisão fundamentada. Nenhuma retenção foi aplicada automaticamente."
                      : "Decisão disponível no resumo acima."
                    : refunded
                      ? "Devolução concluída no exemplo fictício."
                      : "A conclusão e o prazo dependem da decisão e do provedor; não há transferência real nesta prévia."}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="modal-footnote">
        A simulação não envia e-mails nem movimenta valores. Solicitar não
        equivale a aprovar ou concluir um reembolso.
      </p>
    </>
  );
}
