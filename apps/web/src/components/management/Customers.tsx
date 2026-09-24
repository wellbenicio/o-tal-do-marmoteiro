"use client";
import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  Users,
  Heart,
  Clock3,
  Check,
  CalendarClock,
  Mail,
} from "lucide-react";
import { useManagement } from "./ManagementProvider";
import { customerStats } from "@/lib/management";
import { bookingLabels, money, prettyDate } from "@/lib/demo-bookings";
import { Avatar, Empty, Kpi, MgBadge, SectionTitle } from "./Shared";
import { Modal } from "@/components/portal/Modal";
export function Customers({
  initialFilter = "all",
}: {
  initialFilter?: string;
}) {
  const s = useManagement();
  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [interval, setInterval] = useState(String(s.settings.returnDays));
  const all = s.customers.map((customer) => ({
    customer,
    ...customerStats(s, customer, s.now),
  }));
  const followups = all.filter((c) => c.needsFollowup);
  const rows = all
    .filter(
      (c) =>
        c.customer.name.toLowerCase().includes(search.toLowerCase()) &&
        (filter !== "retorno" || c.needsFollowup),
    )
    .sort((a, b) =>
      filter === "ranking"
        ? b.completed - a.completed
        : filter === "retorno"
          ? (b.days || 0) - (a.days || 0)
          : a.customer.name.localeCompare(b.customer.name),
    );
  const current = all.find((c) => c.customer.id === selected);
  return (
    <>
      <div className="mg-page-heading">
        <div>
          <span className="mg-eyebrow">O NEGÓCIO É FEITO DE PESSOAS</span>
          <h1>
            Quem caminha com você<span>.</span>
          </h1>
          <p>
            Conheça a frequência, acompanhe os vínculos e lembre de quem faz
            tempo.
          </p>
        </div>
      </div>
      <div className="mg-kpis">
        <Kpi
          icon={Users}
          label="Consulentes"
          value={String(all.length)}
          detail="Perfis fictícios nesta demonstração"
        />
        <Kpi
          icon={Heart}
          label="Já voltaram"
          value={String(all.filter((c) => c.completed > 1).length)}
          detail="Mais de um atendimento concluído"
          accent
        />
        <Kpi
          icon={Clock3}
          label="Para retomar contato"
          value={String(followups.length)}
          detail={`Último atendimento há ${s.settings.returnDays}+ dias`}
        />
        <Kpi
          icon={CalendarClock}
          label="Com atendimento pendente"
          value={String(all.filter((c) => c.upcoming).length)}
          detail="Consulta futura ou pergunta em andamento"
        />
      </div>
      <section className="mg-relationship-banner">
        <span className="mg-task-icon">
          <Heart size={24} />
        </span>
        <div>
          <h2>Cuidar do vínculo, no tempo de cada pessoa.</h2>
          <p>
            Um lembrete interno após o período escolhido. Sem mensagens
            automáticas de relacionamento.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            s.updateSettings({ returnDays: Number(interval) });
          }}
        >
          <label>
            Lembrar após
            <select
              aria-label="Intervalo para retorno"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
            >
              {[15, 30, 45, 60, 90].map((d) => (
                <option key={d} value={d}>
                  {d} dias
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Salvar</button>
        </form>
      </section>
      <div className="mg-toolbar">
        <div className="mg-tabs">
          {[
            ["all", "Todos os consulentes"],
            ["ranking", "Mais atendidos"],
            ["retorno", "Retomar contato"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={filter === id ? "active" : ""}
              onClick={() => setFilter(id)}
            >
              {label}
              {id === "retorno" && <b>{followups.length}</b>}
            </button>
          ))}
        </div>
        <label className="mg-search">
          <Search size={16} />
          <input
            aria-label="Buscar consulente"
            placeholder="Buscar por nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {filter === "retorno" ? (
        <div className="mg-followup-grid">
          {rows.map((c) => (
            <article className="mg-card mg-followup" key={c.customer.id}>
              <div className="mg-question-person">
                <Avatar name={c.customer.name} />
                <div>
                  <h2>{c.customer.name}</h2>
                  <p>
                    {c.completed} atendimento{c.completed !== 1 ? "s" : ""}{" "}
                    realizado{c.completed !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="mg-followup-age">
                <strong>{c.days}</strong>
                <span>dias desde o último atendimento</span>
              </div>
              <p>
                Sem próximo encontro marcado. Um convite pode fazer sentido, se
                a pessoa quiser.
              </p>
              <div className="mg-followup-actions">
                <button
                  className="product-button small"
                  onClick={() => s.relationship(c.customer.id, "contacted")}
                >
                  <Check size={14} /> Registrar contato feito
                </button>
                <button
                  className="product-button secondary small"
                  onClick={() => s.relationship(c.customer.id, "snooze")}
                >
                  Adiar 7 dias
                </button>
              </div>
              <div className="mg-followup-links">
                <button onClick={() => setSelected(c.customer.id)}>
                  Ver histórico <ArrowUpRight size={13} />
                </button>
                <button
                  onClick={() => s.relationship(c.customer.id, "dismiss")}
                >
                  Dispensar lembrete
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mg-card mg-table-wrap">
          <table className="mg-table">
            <thead>
              <tr>
                <th>Consulente</th>
                <th>Atendimentos realizados</th>
                <th>Último atendimento</th>
                <th>Valor após devoluções</th>
                <th>Acompanhamento</th>
                <th>
                  <span className="sr-only">Detalhes</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.customer.id}>
                  <td>
                    <div className="mg-person-cell">
                      {filter === "ranking" && (
                        <span className="mg-rank">{i + 1}</span>
                      )}
                      <Avatar name={c.customer.name} small />
                      <div>
                        <strong>{c.customer.name}</strong>
                        <small>{c.customer.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <strong>{c.completed}</strong>
                  </td>
                  <td>
                    {c.last
                      ? prettyDate(
                          new Date(c.last).toLocaleDateString("en-CA", {
                            timeZone: "America/Sao_Paulo",
                          }),
                          true,
                        )
                      : "Ainda não atendido"}
                    {c.days !== null && <small>há {c.days} dias</small>}
                  </td>
                  <td>{money(c.total)}</td>
                  <td>
                    <MgBadge
                      tone={
                        c.upcoming
                          ? "green"
                          : c.needsFollowup
                            ? "orange"
                            : "neutral"
                      }
                    >
                      {c.upcoming
                        ? "Atendimento pendente"
                        : c.needsFollowup
                          ? "Hora de retomar"
                          : !c.customer.relationshipAllowed
                            ? "Contato não autorizado"
                            : "Em dia"}
                    </MgBadge>
                  </td>
                  <td>
                    <button
                      className="mg-icon-button"
                      aria-label={`Ver consulente ${c.customer.name}`}
                      onClick={() => setSelected(c.customer.id)}
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!rows.length && (
        <div className="mg-card">
          <Empty
            title="Nenhum consulente neste filtro"
            text="Os lembretes respeitam o período, os próximos atendimentos e as preferências de contato."
          />
        </div>
      )}
      <p className="mg-caption">
        Frequência considera serviços concluídos. Lembretes não incluem quem já
        tem atendimento pendente, contato recente ou preferência contrária a
        relacionamento.
      </p>
      {current && (
        <Modal
          title="Histórico do consulente"
          onClose={() => setSelected(null)}
        >
          <div className="mg-order-customer">
            <Avatar name={current.customer.name} />
            <div>
              <strong>{current.customer.name}</strong>
              <p>{current.customer.pronouns}</p>
            </div>
          </div>
          <dl className="detail-list">
            <div>
              <dt>E-mail</dt>
              <dd>{current.customer.email}</dd>
            </div>
            <div>
              <dt>WhatsApp</dt>
              <dd>{current.customer.phone}</dd>
            </div>
            <div>
              <dt>Atendimentos realizados</dt>
              <dd>{current.completed}</dd>
            </div>
            <div>
              <dt>Contato de relacionamento</dt>
              <dd>
                {current.customer.relationshipAllowed
                  ? "Permitido no exemplo"
                  : "Não autorizado no exemplo"}
              </dd>
            </div>
          </dl>
          <p className="mg-inline-note">
            <Mail size={17} /> Nenhuma mensagem é enviada ao registrar contato
            nesta prévia.
          </p>
          <SectionTitle
            title="Histórico administrativo"
            detail="Conteúdo privado de consulta não aparece nesta listagem."
          />
          <div className="mg-customer-history">
            {current.orders
              .sort((a, b) => b.booking.date.localeCompare(a.booking.date))
              .map((o) => (
                <article key={o.booking.id}>
                  <div>
                    <strong>
                      {o.booking.modality === "QUESTION"
                        ? "Pergunta avulsa"
                        : "Consulta online"}
                    </strong>
                    <span>{bookingLabels[o.booking.status]}</span>
                  </div>
                  <small>
                    {prettyDate(o.booking.date, true)} · {o.booking.id} ·{" "}
                    {money(o.booking.amount)}
                  </small>
                </article>
              ))}
          </div>
          <button
            className="product-button secondary full"
            onClick={() =>
              s.relationship(
                current.customer.id,
                current.customer.relationshipAllowed ? "disallow" : "allow",
              )
            }
          >
            Simular{" "}
            {current.customer.relationshipAllowed ? "recusa" : "autorização"} de
            contato
          </button>
          <p className="field-hint">
            Preferência fictícia para validar os filtros; na operação real, a
            manifestação pertence ao consulente.
          </p>
        </Modal>
      )}
    </>
  );
}
