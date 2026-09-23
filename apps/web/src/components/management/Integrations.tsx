"use client";
import Link from "next/link";
import { CommunicationReadiness } from "./CommunicationReadiness";
import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CalendarDays,
  Mail,
  RefreshCcw,
  Check,
  Download,
  LockKeyhole,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import { useManagement } from "./ManagementProvider";
import { appointmentTimestamp, prettyDate } from "@/lib/demo-bookings";
import { downloadFile, MgBadge, SectionTitle } from "./Shared";
import { Modal } from "@/components/portal/Modal";
export function Integrations() {
  const s = useManagement();
  const [connect, setConnect] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [email, setEmail] = useState(s.settings.ownerEmail);
  const active = s.orders.filter(
    (o) =>
      o.booking.modality === "APPOINTMENT" &&
      o.booking.status === "BOOKED" &&
      o.booking.orderStatus !== "CANCELED",
  );
  function saveEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    s.updateSettings({ ownerEmail: email });
  }
  function ics() {
    const stamp = (n: number) =>
      new Date(n)
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z/, "Z");
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Marmoteiro//Preview//PT-BR",
      "CALSCALE:GREGORIAN",
    ];
    for (const { booking: b } of active) {
      const start = appointmentTimestamp(b.date, b.time);
      lines.push(
        "BEGIN:VEVENT",
        `UID:${b.id.toLowerCase()}@preview.marmoteiro.com`,
        `DTSTAMP:${stamp(s.now)}`,
        `DTSTART:${stamp(start)}`,
        `DTEND:${stamp(start + 30 * 60000)}`,
        "SUMMARY:Compromisso - O Tal do Marmoteiro",
        `DESCRIPTION:Pedido ${b.id}. Evento ficticio exportado da demonstracao.`,
        "CLASS:PRIVATE",
        "END:VEVENT",
      );
    }
    lines.push("END:VCALENDAR");
    downloadFile(
      lines.join("\r\n") + "\r\n",
      "agenda-exemplo-marmoteiro.ics",
      "text/calendar;charset=utf-8",
    );
  }
  return (
    <>
      <div className="mg-page-heading">
        <div>
          <span className="mg-eyebrow">SEU NEGÓCIO ACOMPANHA VOCÊ</span>
          <h1>
            Conexões que facilitam<span>.</span>
          </h1>
          <p>A estrutura para acompanhar o oráculo, mesmo longe do painel.</p>
        </div>
      </div>
      <CommunicationReadiness />
      <div className="mg-integration-grid">
        <section className="mg-card mg-integration">
          <div className="mg-integration-top">
            <span className="mg-google-icon large">G</span>
            <MgBadge tone={s.settings.googleDemo ? "orange" : "neutral"}>
              {s.settings.googleDemo ? "Simulação ativa" : "Não conectado"}
            </MgBadge>
          </div>
          <h2>Google Calendar + Meet</h2>
          <p>
            Veja os atendimentos ao lado da sua agenda pessoal. Consultas e
            bloqueios, sem precisar manter o painel aberto.
          </p>
          <ul>
            <li>
              <Check size={15} />
              Consultas confirmadas entram no calendário.
            </li>
            <li>
              <Check size={15} />
              Reagendamentos e cancelamentos atualizam o espelho.
            </li>
            <li>
              <Check size={15} />
              Compromissos pessoais podem bloquear horários.
            </li>
            <li>
              <ShieldCheck size={15} />
              Conteúdo íntimo fica fora dos eventos.
            </li>
          </ul>
          <div className="mg-integration-config">
            <span>Calendário do oráculo</span>
            <strong>{s.settings.googleCalendar}</strong>
            <span>Conta Google</span>
            <strong>Nenhuma conta real conectada</strong>
          </div>
          {s.settings.googleDemo ? (
            <>
              <div className="mg-heading-actions">
                <button
                  className="product-button"
                  onClick={() =>
                    setLastSync(new Date().toLocaleTimeString("pt-BR"))
                  }
                >
                  <RefreshCcw size={16} />
                  Simular sincronização
                </button>
                <button
                  className="text-link"
                  onClick={() => {
                    s.updateSettings({ googleDemo: false });
                    setLastSync(null);
                  }}
                >
                  Encerrar simulação
                </button>
              </div>
              <p className="field-hint">
                {lastSync
                  ? `Espelho de exemplo atualizado às ${lastSync}.`
                  : `${active.length} eventos seriam espelhados.`}{" "}
                Nenhuma chamada à API Google foi feita.
              </p>
            </>
          ) : (
            <button className="product-button" onClick={() => setConnect(true)}>
              Explorar conexão de demonstração <ArrowRight size={16} />
            </button>
          )}
        </section>
        <section className="mg-card mg-integration">
          <div className="mg-integration-top">
            <span className="mg-integration-icon">
              <Mail size={26} />
            </span>
            <MgBadge>Envio não conectado</MgBadge>
          </div>
          <h2>E-mails do seu negócio</h2>
          <p>
            Confirmações e atualizações para o consulente. Alertas para você
            acompanhar tudo, onde estiver.
          </p>
          <form className="portal-form" onSubmit={saveEmail}>
            <label>
              Seu e-mail para alertas
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <button className="product-button secondary" type="submit">
              Salvar destinatário de exemplo
            </button>
          </form>
          <div className="mg-settings-switches">
            <label>
              <span>
                <strong>Receber alertas operacionais</strong>
                <small>Pagamentos, agenda, perguntas e solicitações.</small>
              </span>
              <input
                type="checkbox"
                checked={s.settings.ownerAlerts}
                onChange={(e) =>
                  s.updateSettings({ ownerAlerts: e.target.checked })
                }
              />
            </label>
            <label>
              <span>
                <strong>Resumo diário para mim</strong>
                <small>Agenda, fila e pendências em uma mensagem.</small>
              </span>
              <input
                type="checkbox"
                checked={s.settings.dailyDigest}
                onChange={(e) =>
                  s.updateSettings({ dailyDigest: e.target.checked })
                }
              />
            </label>
          </div>
          <Link className="text-link" href="/gestao/notificacoes">
            Ver central e prévias de e-mail <ArrowUpRightIcon />
          </Link>
        </section>
      </div>
      <section className="mg-card mg-spaced">
        <SectionTitle
          title="O que cada pessoa acompanha"
          detail="Comunicações transacionais previstas no fluxo integrado."
        />
        <div className="mg-table-wrap">
          <table className="mg-table mg-matrix">
            <thead>
              <tr>
                <th>Evento</th>
                <th>No painel</th>
                <th>E-mail para você</th>
                <th>E-mail para o consulente</th>
              </tr>
            </thead>
            <tbody>
              {[
                "Cadastro / atualização de contato",
                "Pedido e confirmação de pagamento",
                "Agendamento e reagendamento",
                "Pergunta recebida, início e entrega",
                "Cancelamento solicitado e decidido",
                "Reembolso iniciado e concluído",
                "Correção cadastral / privacidade",
              ].map((event) => (
                <tr key={event}>
                  <td>{event}</td>
                  <td>
                    <Check size={17} />
                    <span className="sr-only">Sim</span>
                  </td>
                  <td>
                    {s.settings.ownerAlerts ? (
                      <>
                        <Check size={17} />
                        <span className="sr-only">Previsto</span>
                      </>
                    ) : (
                      "Desativado no exemplo"
                    )}
                  </td>
                  <td>
                    <Check size={17} />
                    <span className="sr-only">Previsto</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mg-caption">
          E-mails essenciais da contratação são separados de relacionamento
          comercial. Nenhuma campanha ou contato mensal é disparado
          automaticamente.
        </p>
      </section>
      <div className="mg-two-columns">
        <section className="mg-card">
          <SectionTitle title="Lembretes e disponibilidade" />
          <div className="mg-setting-row">
            <div>
              <strong>Antecedência do lembrete de consulta</strong>
              <p>Configuração ilustrativa para a integração de envio.</p>
            </div>
            <select
              aria-label="Antecedência do lembrete"
              className="mg-select"
              value={s.settings.consultationReminder}
              onChange={(e) =>
                s.updateSettings({
                  consultationReminder: Number(e.target.value),
                })
              }
            >
              {[30, 60, 120, 1440].map((m) => (
                <option key={m} value={m}>
                  {m === 1440 ? "24 horas" : `${m} minutos`}
                </option>
              ))}
            </select>
          </div>
          <div className="mg-settings-switches">
            <label>
              <span>
                <strong>Considerar horários pessoais</strong>
                <small>
                  Usar apenas ocupação, sem importar conteúdo privado.
                </small>
              </span>
              <input
                type="checkbox"
                checked={s.settings.includePersonalBusy}
                onChange={(e) =>
                  s.updateSettings({ includePersonalBusy: e.target.checked })
                }
              />
            </label>
          </div>
          <div className="mg-inline-note">
            <LockKeyhole size={18} />
            <p>
              Alterações na agenda pessoal não aprovam pagamentos nem cancelam
              contratos. Divergências de consultas exigem revisão.
            </p>
          </div>
        </section>
        <section className="mg-card">
          <SectionTitle
            title="Experimente o espelho da agenda"
            detail={`${active.length} consultas de exemplo. Exportação manual, sem sincronização contínua.`}
          />
          <div className="mg-calendar-export">
            {active.slice(0, 3).map((o) => (
              <div key={o.booking.id}>
                <CalendarDays size={18} />
                <span>
                  <strong>Compromisso · Marmoteiro</strong>
                  <small>
                    {prettyDate(o.booking.date, true)} · {o.booking.time}
                  </small>
                </span>
                <MgBadge>Privado</MgBadge>
              </div>
            ))}
          </div>
          <button className="product-button secondary" onClick={ics}>
            <Download size={16} />
            Baixar agenda de exemplo (.ics)
          </button>
        </section>
      </div>
      {connect && (
        <Modal
          title="Como a conexão vai funcionar"
          onClose={() => setConnect(false)}
        >
          <div className="mg-connect-heading">
            <span className="mg-google-icon large">G</span>
            <h3>O oráculo, junto da sua agenda.</h3>
          </div>
          <p className="modal-description">
            Na integração real, você autorizará sua conta Google e terá um
            calendário do oráculo ao lado do pessoal. A leitura de
            disponibilidade evita conflitos.
          </p>
          <form
            className="portal-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              s.updateSettings({
                googleDemo: true,
                googleCalendar: String(form.get("calendar")).trim(),
              });
              setConnect(false);
            }}
          >
            <label>
              Nome do calendário de exemplo
              <input
                name="calendar"
                defaultValue={s.settings.googleCalendar}
                required
                maxLength={80}
              />
            </label>
            <p className="pending-policy">
              Esta etapa só demonstra a experiência. Não solicita senha, não
              autentica no Google e não acessa sua agenda pessoal.
            </p>
            <button className="product-button full" type="submit">
              Ativar espelho de demonstração <ArrowRight size={16} />
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
function ArrowUpRightIcon() {
  return <ExternalLink size={14} />;
}
