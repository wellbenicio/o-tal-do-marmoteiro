"use client";
import Link from "next/link";
import { PrivateQuestion } from "./PrivateQuestion";
import { Video } from "lucide-react";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Sparkles,
  Play,
  Send,
} from "lucide-react";
import { useManagement } from "./ManagementProvider";
import { queueOrders } from "@/lib/management";
import { bookingLabels, money, prettyTimestamp } from "@/lib/demo-bookings";
import { Avatar, Empty, Kpi, MgBadge } from "./Shared";
import { Modal } from "@/components/portal/Modal";
import { OrderModal } from "./OrderModal";
export function Questions() {
  const s = useManagement();
  const [filter, setFilter] = useState("queue");
  const [deliver, setDeliver] = useState<string | null>(null);
  const [checks, setChecks] = useState([false, false, false]);
  const [details, setDetails] = useState<string | null>(null);
  const queue = queueOrders(s.orders);
  const progress = s.orders.filter(
    (o) =>
      o.booking.modality === "QUESTION" && o.booking.status === "IN_PROGRESS",
  );
  const delivered = s.orders.filter(
    (o) =>
      o.booking.modality === "QUESTION" &&
      ["DELIVERED", "COMPLETED"].includes(o.booking.status),
  );
  const rows =
    filter === "queue" ? queue : filter === "progress" ? progress : delivered;
  return (
    <>
      <div className="mg-page-heading">
        <div>
          <span className="mg-eyebrow">CADA PERGUNTA MERECE PRESENÇA</span>
          <h1>
            Sua fila de perguntas<span>.</span>
          </h1>
          <p>
            Perguntas avulsas: resposta assíncrona por foto e áudio no WhatsApp.
          </p>
        </div>
        <MgBadge tone="orange">SLA: até 48 horas úteis</MgBadge>
      </div>
      <div className="mg-channel-banner">
        <MessageCircle size={23} />
        <div>
          <strong>Você responde pelo WhatsApp</strong>
          <p>
            Esta fila reúne perguntas avulsas. As consultas com dia e hora
            marcados ficam na agenda de videochamadas.
          </p>
        </div>
        <Link href="/gestao/agenda">
          <Video size={17} />
          Ver videochamadas
        </Link>
      </div>
      <div className="mg-kpis">
        <Kpi
          icon={MessageCircle}
          label="Na fila"
          value={String(queue.length)}
          detail="Pagamento aprovado; não iniciadas"
        />
        <Kpi
          icon={Sparkles}
          label="Prioritárias"
          value={String(queue.filter((o) => o.booking.priority).length)}
          detail="À frente das regulares pendentes"
          accent
        />
        <Kpi
          icon={Play}
          label="Em atendimento"
          value={String(progress.length)}
          detail="Início registrado por você"
        />
        <Kpi
          icon={CheckCircle2}
          label="Entregues / concluídas"
          value={String(delivered.length)}
          detail="Histórico de exemplos desta sessão"
        />
      </div>
      <div className="mg-inline-note">
        <Clock3 size={19} />
        <p>
          A contagem começa na confirmação do pagamento. O calendário
          operacional ainda não foi configurado; por isso, esta prévia não
          calcula uma data limite. Prioridade não altera o SLA nem interrompe
          atendimento iniciado.
        </p>
      </div>
      <div className="mg-tabs mg-page-tabs">
        {[
          ["queue", "Aguardando início"],
          ["progress", "Em atendimento"],
          ["delivered", "Entregues e concluídas"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={filter === id ? "active" : ""}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mg-question-list">
        {rows.map((o, i) => {
          const b = o.booking,
            c = s.customers.find((c) => c.id === o.customerId)!;
          return (
            <article className="mg-card mg-question" key={b.id}>
              <div className="mg-question-top">
                <div className="mg-question-person">
                  <span className="mg-queue-number">
                    {filter === "queue" ? (
                      String(i + 1).padStart(2, "0")
                    ) : (
                      <MessageCircle size={21} />
                    )}
                  </span>
                  <Avatar name={c.name} />
                  <div>
                    <h2>{c.name}</h2>
                    <p>{b.id} · Pergunta avulsa · WhatsApp</p>
                  </div>
                </div>
                <MgBadge
                  tone={
                    b.priority
                      ? "orange"
                      : b.status === "COMPLETED"
                        ? "green"
                        : "neutral"
                  }
                >
                  {b.priority ? "Fila prioritária" : bookingLabels[b.status]}
                </MgBadge>
              </div>
              <div className="mg-question-meta">
                <span>
                  <Clock3 size={14} />
                  Pagamento: {b.paidAt ? prettyTimestamp(b.paidAt) : "Pendente"}
                </span>
                <span>
                  {money(b.amount)}
                  {b.priority ? " · prioridade incluída" : ""}
                </span>
              </div>
              <PrivateQuestion
                booking={b}
                customerName={c.name}
                phone={c.phone}
              />
              <div className="mg-question-bottom">
                <p>
                  Entrega: identificação da pergunta + foto do jogo + áudio da
                  interpretação.
                </p>
                <div>
                  <button
                    className="product-button secondary small"
                    onClick={() => setDetails(b.id)}
                  >
                    Ver pedido
                  </button>
                  {b.status === "QUEUED" && (
                    <button
                      className="product-button small"
                      disabled={i !== 0 || !b.question?.text}
                      title={i !== 0 ? "Aguarde sua vez na fila" : ""}
                      onClick={() => s.startQuestion(b.id)}
                    >
                      <Play size={14} />
                      Iniciar atendimento
                    </button>
                  )}
                  {b.status === "IN_PROGRESS" && (
                    <button
                      className="product-button small"
                      onClick={() => {
                        setDeliver(b.id);
                        setChecks([false, false, false]);
                      }}
                    >
                      <Send size={14} />
                      Marcar entrega
                    </button>
                  )}
                  {b.status === "DELIVERED" && (
                    <button
                      className="product-button small"
                      onClick={() => s.completeService(b.id)}
                    >
                      Concluir atendimento <CheckCircle2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
        {!rows.length && (
          <div className="mg-card">
            <Empty
              title="Tudo em dia por aqui"
              text="Os atendimentos desta etapa aparecerão nesta lista."
            />
          </div>
        )}
      </div>
      {deliver && (
        <Modal
          title="Confirmar a entrega da resposta"
          onClose={() => setDeliver(null)}
        >
          <p className="modal-description">
            Marque apenas depois de enviar os três elementos pelo WhatsApp. Na
            demonstração, estes registros são fictícios.
          </p>
          {[
            "Identificação / reprodução da pergunta enviada",
            "Fotografia do jogo enviada",
            "Áudio com interpretação e resposta enviado",
          ].map((text, i) => (
            <label className="check-label" key={text}>
              <input
                type="checkbox"
                checked={checks[i]}
                onChange={(e) =>
                  setChecks((v) =>
                    v.map((checked, j) =>
                      i === j ? e.target.checked : checked,
                    ),
                  )
                }
              />
              <span>{text}</span>
            </label>
          ))}
          <div className="wizard-actions">
            <button
              className="product-button full"
              disabled={!checks.every(Boolean)}
              onClick={() => {
                if (s.deliverQuestion(deliver, checks)) setDeliver(null);
              }}
            >
              Registrar entrega simulada <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
      {details && <OrderModal id={details} onClose={() => setDetails(null)} />}
    </>
  );
}
