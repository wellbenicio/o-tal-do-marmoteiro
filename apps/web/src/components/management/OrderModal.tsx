"use client";
import { PrivateQuestion } from "./PrivateQuestion";
import { useState } from "react";
import { Modal } from "@/components/portal/Modal";
import { BookingDetails } from "@/components/portal/BookingDetails";
import { useManagement } from "./ManagementProvider";
import {
  DEMO_DURATION,
  appointmentTimestamp,
  money,
} from "@/lib/demo-bookings";
import { Avatar, MgBadge } from "./Shared";
export function OrderModal({
  id,
  onClose,
}: Readonly<{
  id: string;
  onClose: () => void;
}>) {
  const s = useManagement();
  const order = s.orders.find((o) => o.booking.id === id);
  const [amount, setAmount] = useState(
    order ? String(order.booking.amount / 100) : "",
  );
  const [reason, setReason] = useState("");
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const [agendaAction, setAgendaAction] = useState<
    "reschedule" | "cancel" | null
  >(null);
  if (!order) return null;
  const b = order.booking;
  const customer = s.customers.find((c) => c.id === order.customerId)!;
  return (
    <Modal title="Pedido e atendimento" onClose={onClose}>
      <div className="mg-order-customer">
        <Avatar name={customer.name} />
        <div>
          <strong>{customer.name}</strong>
          <p>{customer.email}</p>
        </div>
        <MgBadge>Exemplo</MgBadge>
      </div>
      {b.modality === "QUESTION" && (
        <PrivateQuestion
          booking={b}
          customerName={customer.name}
          phone={customer.phone}
        />
      )}
      <BookingDetails booking={b} onAction={() => {}} readOnly />
      {b.modality === "APPOINTMENT" &&
        b.status === "BOOKED" &&
        b.orderStatus === "CONFIRMED" &&
        appointmentTimestamp(b.date, b.time) + DEMO_DURATION * 60000 <=
          s.now && (
          <section className="mg-review-box">
            <h3>Registrar atendimento realizado</h3>
            <p>
              Confirme somente após realizar a consulta. Este registro atualiza
              o histórico e a frequência do consulente na demonstração.
            </p>
            <button
              className="product-button full"
              onClick={() => s.completeService(id)}
            >
              Marcar consulta como realizada
            </button>
          </section>
        )}
      {b.modality === "APPOINTMENT" &&
        b.status === "BOOKED" &&
        b.orderStatus === "CONFIRMED" &&
        appointmentTimestamp(b.date, b.time) > s.now && (
          <section className="mg-review-box">
            <h3>Ajustar minha agenda</h3>
            <p>
              Uma mudança por sua iniciativa preserva o direito de reagendamento
              do consulente. Se o serviço não puder ser prestado, a restituição
              é integral.
            </p>
            {b.rescheduleRequest?.status === "OPEN" && (
              <p>
                Opções de reagendamento aguardando escolha. O horário atual
                permanece reservado.
              </p>
            )}
            {!agendaAction ? (
              <div className="modal-buttons">
                <button
                  className="product-button secondary"
                  disabled={b.rescheduleRequest?.status === "OPEN"}
                  onClick={() => {
                    setAgendaAction("reschedule");
                    setReason("");
                  }}
                >
                  Oferecer reagendamento
                </button>
                <button
                  className="product-button secondary"
                  onClick={() => {
                    setAgendaAction("cancel");
                    setReason("");
                  }}
                >
                  Cancelar por indisponibilidade
                </button>
              </div>
            ) : (
              <form
                className="portal-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (s.changeAgenda(id, agendaAction, reason)) {
                    setAgendaAction(null);
                    setError("");
                  } else
                    setError(
                      "Verifique a situação do atendimento e informe uma justificativa.",
                    );
                }}
              >
                <label>
                  Motivo da alteração pelo prestador{" "}
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    minLength={10}
                    required
                    rows={3}
                  />
                </label>
                <p className="field-hint">
                  {agendaAction === "reschedule"
                    ? "O consulente terá 48 horas para escolher entre os horários disponíveis. O uso por sua própria iniciativa permanece preservado."
                    : "A consulta será cancelada na demonstração, com restituição integral pendente de processamento."}
                </p>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="product-button full" type="submit">
                  {agendaAction === "reschedule"
                    ? "Disponibilizar opções na demonstração"
                    : "Confirmar cancelamento pelo prestador"}
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setAgendaAction(null)}
                >
                  Voltar
                </button>
              </form>
            )}
          </section>
        )}
      {b.orderStatus === "CANCELLATION_REQUESTED" && (
        <section className="mg-review-box">
          <h3>Uma decisão com contexto</h3>
          <p>
            Avalie o direito aplicável antes de definir retenções. Situações
            excepcionais e atendimentos já entregues exigem análise individual.
            O início não elimina direitos.
          </p>
          {!review ? (
            <button
              className="product-button full"
              onClick={() => setReview(true)}
            >
              Analisar restituição de exemplo
            </button>
          ) : (
            <form
              className="portal-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (
                  s.approveRefund(
                    id,
                    Math.round(Number(amount.replace(",", ".")) * 100),
                    reason,
                  )
                ) {
                  setReview(false);
                  setError("");
                } else
                  setError(
                    "Confira o valor e registre uma justificativa com pelo menos 10 caracteres.",
                  );
              }}
            >
              <label>
                Valor a restituir (até {money(b.amount)})
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  max={b.amount / 100}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>
              <label>
                Fundamentação da decisão{" "}
                <textarea
                  minLength={10}
                  required
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Registre o enquadramento, a avaliação e a razão da decisão simulada."
                />
              </label>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              <button className="product-button full" type="submit">
                Aprovar cancelamento e restituição simulados
              </button>
              <p className="field-hint">
                A decisão será registrada no histórico. Nenhum dinheiro será
                movimentado.
              </p>
            </form>
          )}
        </section>
      )}
      {b.paymentStatus === "REFUND_PENDING" && (
        <section className="mg-review-box">
          <h3>Devolução em processamento</h3>
          <p>
            Valor aprovado: {money(b.cancellation?.result.amount || 0)}. O
            status real será confirmado pelo provedor de pagamento.
          </p>
          <button
            className="product-button secondary full"
            onClick={() => s.finishRefund(id)}
          >
            Simular confirmação do reembolso
          </button>
        </section>
      )}
      <details className="order-documents">
        <summary>Histórico administrativo</summary>
        {s.audit
          .filter((a) => a.reference === id)
          .map((a) => (
            <div key={a.id}>
              <strong>{a.action}</strong>
              <p>
                {a.actor} · {new Date(a.at).toLocaleString("pt-BR")}
              </p>
              {a.reason && <p>{a.reason}</p>}
            </div>
          ))}
      </details>
    </Modal>
  );
}
