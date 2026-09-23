"use client";
import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  Receipt,
  AlertCircle,
  RefreshCcw,
  CheckCircle2,
} from "lucide-react";
import { useManagement } from "./ManagementProvider";
import { OrderModal } from "./OrderModal";
import {
  bookingLabels,
  paymentLabels,
  orderLabels,
  money,
  prettyDate,
} from "@/lib/demo-bookings";
import { Avatar, Empty, Kpi, MgBadge } from "./Shared";
export function Orders({
  initialQuery = "",
  initialFilter = "all",
  initialOrder,
}: {
  initialQuery?: string;
  initialFilter?: string;
  initialOrder?: string;
}) {
  const s = useManagement();
  const [query, setQuery] = useState(initialQuery);
  const [modality, setModality] = useState("all");
  const [filter, setFilter] = useState(initialFilter);
  const [selected, setSelected] = useState<string | null>(initialOrder || null);
  const filtered = s.orders
    .filter((o) => {
      const b = o.booking;
      const customer = s.customers.find((c) => c.id === o.customerId);
      return (
        `${b.id} ${customer?.name} ${customer?.email}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (modality === "all" || b.modality === modality) &&
        (filter === "all" ||
          (filter === "cancelamentos" &&
            b.orderStatus === "CANCELLATION_REQUESTED") ||
          (filter === "reembolsos" && b.paymentStatus === "REFUND_PENDING") ||
          (filter === "pendentes" && b.paymentStatus === "PENDING"))
      );
    })
    .sort((a, b) => b.booking.createdAt.localeCompare(a.booking.createdAt));
  return (
    <>
      <div className="mg-page-heading">
        <div>
          <span className="mg-eyebrow">CADA CONTRATAÇÃO, UM HISTÓRICO</span>
          <h1>
            Pedidos e solicitações<span>.</span>
          </h1>
          <p>
            Acompanhe o que foi contratado, pago e realizado, separadamente.
          </p>
        </div>
      </div>
      <div className="mg-kpis">
        <Kpi
          icon={Receipt}
          label="Pedidos registrados"
          value={String(s.orders.length)}
          detail="Todos os exemplos desta sessão"
        />
        <Kpi
          icon={AlertCircle}
          label="Cancelamentos em análise"
          value={String(
            s.orders.filter(
              (o) => o.booking.orderStatus === "CANCELLATION_REQUESTED",
            ).length,
          )}
          detail="Aguardam sua decisão"
          accent
        />
        <Kpi
          icon={RefreshCcw}
          label="Reembolsos pendentes"
          value={String(
            s.orders.filter((o) => o.booking.paymentStatus === "REFUND_PENDING")
              .length,
          )}
          detail="Aprovados, ainda não concluídos"
        />
        <Kpi
          icon={CheckCircle2}
          label="Atendimentos concluídos"
          value={String(
            s.orders.filter((o) => o.booking.status === "COMPLETED").length,
          )}
          detail="Execução finalizada"
        />
      </div>
      <div className="mg-toolbar">
        <div className="mg-tabs">
          {[
            ["all", "Todos"],
            ["cancelamentos", "Cancelamentos"],
            ["reembolsos", "Reembolsos"],
            ["pendentes", "Aguardando pagamento"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={filter === id ? "active" : ""}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          aria-label="Modalidade do atendimento"
          className="mg-select"
          value={modality}
          onChange={(e) => setModality(e.target.value)}
        >
          <option value="all">Todas as modalidades</option>
          <option value="APPOINTMENT">Videochamada · Google Meet</option>
          <option value="QUESTION">Pergunta avulsa · WhatsApp</option>
        </select>
        <label className="mg-search">
          <Search size={16} />
          <input
            aria-label="Filtrar pedidos"
            placeholder="Nome ou número do pedido"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="mg-card mg-table-wrap">
        <table className="mg-table">
          <thead>
            <tr>
              <th>Consulente / pedido</th>
              <th>Atendimento</th>
              <th>Pedido</th>
              <th>Pagamento</th>
              <th>Execução</th>
              <th>Valor</th>
              <th>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ booking: b, customerId }) => {
              const c = s.customers.find((c) => c.id === customerId)!;
              return (
                <tr key={b.id}>
                  <td>
                    <div className="mg-person-cell">
                      <Avatar name={c.name} small />
                      <div>
                        <strong>{c.name}</strong>
                        <small>{b.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>
                      {b.modality === "QUESTION"
                        ? "Pergunta avulsa · WhatsApp"
                        : "Videochamada · Google Meet"}
                    </strong>
                    <small>
                      {prettyDate(b.date, true)}
                      {b.modality === "APPOINTMENT"
                        ? " · " + b.time
                        : b.priority
                          ? " · Prioritária"
                          : ""}
                    </small>
                  </td>
                  <td>
                    <MgBadge
                      tone={
                        b.orderStatus === "CANCELLATION_REQUESTED"
                          ? "orange"
                          : "neutral"
                      }
                    >
                      {orderLabels[b.orderStatus]}
                    </MgBadge>
                  </td>
                  <td>
                    <span
                      className={
                        b.paymentStatus === "APPROVED" ? "mg-positive" : ""
                      }
                    >
                      {paymentLabels[b.paymentStatus]}
                    </span>
                  </td>
                  <td>{bookingLabels[b.status]}</td>
                  <td>{money(b.amount)}</td>
                  <td>
                    <button
                      className="mg-icon-button"
                      aria-label={`Abrir pedido ${b.id}`}
                      onClick={() => setSelected(b.id)}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!filtered.length && (
          <Empty
            title="Nenhum pedido encontrado"
            text="Ajuste a busca ou selecione outro filtro."
          />
        )}
      </div>
      {selected && (
        <OrderModal id={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
