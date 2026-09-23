"use client";
import { useState, type FormEvent } from "react";
import {
  ArrowDownToLine,
  Plus,
  Wallet,
  TrendingUp,
  RefreshCcw,
  Receipt,
  ArrowUpRight,
} from "lucide-react";
import { useManagement } from "./ManagementProvider";
import {
  financeCsv,
  financialMetrics,
  inPeriod,
  isPaid,
} from "@/lib/management";
import {
  localDate,
  money,
  shiftedDate,
  prettyDate,
  methodLabels,
  paymentLabels,
} from "@/lib/demo-bookings";
import {
  downloadFile,
  Empty,
  FlowChart,
  Kpi,
  MgBadge,
  SectionTitle,
} from "./Shared";
import { Modal } from "@/components/portal/Modal";
import { OrderModal } from "./OrderModal";
export function Finance() {
  const s = useManagement();
  const [period, setPeriod] = useState("month");
  const [customFrom, setCustomFrom] = useState(shiftedDate(-29));
  const [customTo, setCustomTo] = useState(localDate());
  const [expense, setExpense] = useState(false);
  const [order, setOrder] = useState<string | null>(null);
  const today = localDate();
  const from =
    period === "month"
      ? today.slice(0, 7) + "-01"
      : period === "custom"
        ? customFrom
        : shiftedDate(-Number(period) + 1);
  const to = period === "custom" ? customTo : today;
  const m = financialMetrics(s, from, to);
  const rows = s.orders
    .filter(
      (o) =>
        inPeriod(o.booking.paidAt || o.booking.createdAt, from, to) ||
        inPeriod(o.refundedAt, from, to),
    )
    .sort((a, b) =>
      (b.booking.paidAt || b.booking.createdAt).localeCompare(
        a.booking.paidAt || a.booking.createdAt,
      ),
    );
  const span = Math.max(
    1,
    Math.floor((Date.parse(to) - Date.parse(from)) / 86400000) + 1,
  );
  const groups = Math.min(10, span);
  const chart = Array.from({ length: groups }, (_, i) => {
    const a = new Date(
        Date.parse(from + "T12:00:00Z") +
          Math.floor((i * span) / groups) * 86400000,
      )
        .toISOString()
        .slice(0, 10),
      b = new Date(
        Date.parse(from + "T12:00:00Z") +
          (Math.floor(((i + 1) * span) / groups) - 1) * 86400000,
      )
        .toISOString()
        .slice(0, 10);
    return {
      label: a.slice(8) + "/" + a.slice(5, 7),
      value: s.orders
        .filter((o) => isPaid(o.booking) && inPeriod(o.booking.paidAt, a, b))
        .reduce((sum, o) => sum + o.booking.amount, 0),
    };
  });
  const modality = [
    ["APPOINTMENT", "Consultas online"],
    ["QUESTION", "Perguntas + prioridade"],
  ].map(([id, label]) => ({
    label,
    value: m.paid
      .filter((o) => o.booking.modality === id)
      .reduce((sum, o) => sum + o.booking.amount, 0),
  }));
  function addExpense(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    s.addExpense({
      title: String(d.get("title")).trim(),
      category: String(d.get("category")),
      date: String(d.get("date")),
      amount: Math.round(Number(d.get("amount")) * 100),
    });
    setExpense(false);
  }
  return (
    <>
      <div className="mg-page-heading">
        <div>
          <span className="mg-eyebrow">NÚMEROS QUE AJUDAM A DECIDIR</span>
          <h1>
            O financeiro, com clareza<span>.</span>
          </h1>
          <p>Acompanhe entradas, devoluções e custos do seu negócio.</p>
        </div>
        <div className="mg-heading-actions">
          <button
            className="product-button secondary"
            onClick={() =>
              downloadFile(
                financeCsv(s, from, to),
                "financeiro-marmoteiro.csv",
                "text/csv;charset=utf-8",
              )
            }
          >
            <ArrowDownToLine size={16} /> Exportar CSV
          </button>
          <button className="product-button" onClick={() => setExpense(true)}>
            <Plus size={17} /> Nova despesa
          </button>
        </div>
      </div>
      <div className="mg-toolbar">
        <div className="mg-tabs">
          {[
            ["month", "Este mês"],
            ["7", "7 dias"],
            ["30", "30 dias"],
            ["90", "90 dias"],
            ["custom", "Personalizado"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={period === id ? "active" : ""}
              onClick={() => setPeriod(id)}
            >
              {label}
            </button>
          ))}
        </div>
        {period === "custom" ? (
          <div className="mg-date-inputs">
            <label>
              De
              <input
                type="date"
                value={customFrom}
                max={customTo}
                onChange={(e) =>
                  e.target.value && setCustomFrom(e.target.value)
                }
              />
            </label>
            <label>
              Até
              <input
                type="date"
                value={customTo}
                min={customFrom}
                max={today}
                onChange={(e) => e.target.value && setCustomTo(e.target.value)}
              />
            </label>
          </div>
        ) : (
          <span className="mg-period-label">
            {prettyDate(from, true)} — {prettyDate(to, true)}
          </span>
        )}
      </div>
      <div className="mg-kpis">
        <Kpi
          icon={Wallet}
          label="Recebimentos"
          value={money(m.gross)}
          detail={`${m.count} pagamentos aprovados no período`}
          accent
        />
        <Kpi
          icon={RefreshCcw}
          label="Devoluções concluídas"
          value={money(m.refunds)}
          detail="Saídas efetivadas no período"
        />
        <Kpi
          icon={Receipt}
          label="Taxas e despesas"
          value={money(m.fees + m.expenses)}
          detail="Custos registrados nos exemplos"
        />
        <Kpi
          icon={TrendingUp}
          label="Resultado de caixa estimado"
          value={money(m.net)}
          detail="Antes de tributos e itens não lançados"
        />
      </div>
      <div className="mg-financial-secondary">
        <div>
          <span>Aguardando pagamento</span>
          <strong>{money(m.pending)}</strong>
          <small>Não compõe a receita</small>
        </div>
        <div>
          <span>Reembolsos a processar</span>
          <strong>{money(m.refundPending)}</strong>
          <small>Compromissos atuais · fora das saídas realizadas</small>
        </div>
        <div>
          <span>Ticket médio</span>
          <strong>{money(m.ticket)}</strong>
          <small>Recebido / pagamentos do período</small>
        </div>
        <div>
          <span>Conversão em pagamento</span>
          <strong>{m.conversion}%</strong>
          <small>Pedidos criados no período que foram pagos</small>
        </div>
      </div>
      <div className="mg-finance-grid">
        <section className="mg-card">
          <SectionTitle
            title="Evolução dos recebimentos"
            detail="Regime de caixa · data de confirmação do pagamento"
          />
          <FlowChart
            values={chart.map((v) => v.value)}
            labels={chart.map((v) => v.label)}
          />
        </section>
        <section className="mg-card">
          <SectionTitle
            title="De onde vem a receita"
            detail="Prioridade faz parte da pergunta."
          />
          <div className="mg-revenue-mix">
            {modality.map((v, i) => (
              <div key={v.label}>
                <div>
                  <span>
                    <i className={i ? "purple" : ""} />
                    {v.label}
                  </span>
                  <strong>{money(v.value)}</strong>
                </div>
                <div className="mg-progress-track">
                  <span
                    className={i ? "purple" : ""}
                    style={{
                      width: `${m.gross ? (v.value / m.gross) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mg-payment-mix">
            {(["PIX", "CARD", "BOLETO"] as const).map((method) => (
              <div key={method}>
                <span>{methodLabels[method]}</span>
                <strong>
                  {money(
                    m.paid
                      .filter((o) => o.booking.method === method)
                      .reduce((sum, o) => sum + o.booking.amount, 0),
                  )}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="mg-card">
        <SectionTitle
          title="O caminho do dinheiro"
          detail="Receita não é o mesmo que resultado disponível."
        />
        <div className="mg-cash-breakdown">
          {[
            ["Recebimentos", m.gross],
            ["− Devoluções", -m.refunds],
            ["− Taxas", -m.fees],
            ["− Despesas", -m.expenses],
            ["= Resultado estimado", m.net],
          ].map(([label, value], i) => (
            <div key={String(label)} className={i === 4 ? "total" : ""}>
              <span>{label}</span>
              <strong>{money(Number(value))}</strong>
            </div>
          ))}
        </div>
        <p className="mg-caption">
          Os dados são fictícios. Esta visão não representa saldo bancário,
          lucro líquido ou contabilidade fiscal.
        </p>
      </section>
      <section className="mg-card mg-table-wrap mg-spaced">
        <div className="mg-table-title">
          <SectionTitle
            title="Pagamentos e devoluções"
            detail="O pagamento original continua no histórico após um reembolso."
          />
        </div>
        <table className="mg-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Pedido / consulente</th>
              <th>Forma</th>
              <th>Total pago</th>
              <th>Devolvido</th>
              <th>Status</th>
              <th>
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const b = o.booking;
              return (
                <tr key={b.id}>
                  <td>
                    {prettyDate(
                      localDate(new Date(b.paidAt || b.createdAt)),
                      true,
                    )}
                  </td>
                  <td>
                    <strong>
                      {s.customers.find((c) => c.id === o.customerId)?.name}
                    </strong>
                    <small>{b.id}</small>
                  </td>
                  <td>{methodLabels[b.method]}</td>
                  <td>{money(isPaid(b) ? b.amount : 0)}</td>
                  <td>
                    {money(
                      o.refundedAt ? b.cancellation?.result.amount || 0 : 0,
                    )}
                  </td>
                  <td>
                    <MgBadge
                      tone={
                        b.paymentStatus === "APPROVED" ? "green" : "neutral"
                      }
                    >
                      {paymentLabels[b.paymentStatus]}
                    </MgBadge>
                  </td>
                  <td>
                    <button
                      className="mg-icon-button"
                      aria-label={`Abrir lançamento ${b.id}`}
                      onClick={() => setOrder(b.id)}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <Empty
            title="Sem movimentações neste período"
            text="Escolha outras datas para explorar os exemplos."
          />
        )}
      </section>
      <section className="mg-card mg-spaced">
        <SectionTitle
          title="Despesas registradas"
          action={
            <button className="text-link" onClick={() => setExpense(true)}>
              Adicionar <Plus size={14} />
            </button>
          }
        />
        {s.expenses
          .filter((e) => inPeriod(e.date, from, to))
          .map((e) => (
            <div className="mg-expense-row" key={e.id}>
              <span className="mg-task-icon">
                <Receipt size={18} />
              </span>
              <div>
                <strong>{e.title}</strong>
                <small>
                  {prettyDate(e.date, true)} · {e.category}
                </small>
              </div>
              <strong>{money(e.amount)}</strong>
            </div>
          ))}
      </section>
      {expense && (
        <Modal
          title="Registrar despesa de exemplo"
          onClose={() => setExpense(false)}
        >
          <form className="portal-form" onSubmit={addExpense}>
            <label>
              Descrição
              <input
                name="title"
                required
                maxLength={100}
                placeholder="Ex.: material de atendimento"
              />
            </label>
            <div className="form-two-columns">
              <label>
                Valor (R$)
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  required
                />
              </label>
              <label>
                Data
                <input
                  type="date"
                  name="date"
                  defaultValue={today}
                  max={today}
                  required
                />
              </label>
            </div>
            <label>
              Categoria
              <select name="category">
                <option>Materiais</option>
                <option>Software</option>
                <option>Marketing</option>
                <option>Operação</option>
                <option>Outros</option>
              </select>
            </label>
            <button className="product-button full" type="submit">
              Salvar despesa
            </button>
          </form>
        </Modal>
      )}
      {order && <OrderModal id={order} onClose={() => setOrder(null)} />}
    </>
  );
}
