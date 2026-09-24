"use client";
import { useEffect, useState } from "react";
import {
  CalendarDays,
  Video,
  Mail,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { MgBadge, SectionTitle } from "./Shared";
type Readiness = {
  enabled: boolean;
  googleConfigured: boolean;
  whatsappConfigured: boolean;
  reminderMinutes: number[];
};
export function CommunicationReadiness() {
  const [status, setStatus] = useState<Readiness | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/integrations/status", {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Status de integração indisponível.");
        setStatus(await r.json());
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, []);
  return (
    <section className="mg-card mg-communication-readiness">
      <SectionTitle
        title="Da confirmação ao encontro"
        detail="Consultas por vídeo: convite por e-mail e lembretes opcionais no WhatsApp."
        action={
          <MgBadge tone={status?.enabled ? "orange" : "neutral"}>
            {status?.enabled
              ? "Processamento habilitado"
              : "Envio real desativado"}
          </MgBadge>
        }
      />
      <div className="mg-communication-flow">
        {[
          {
            icon: ShieldCheck,
            title: "Pagamento confirmado",
            text: "A integração parte da confirmação confiável no servidor.",
          },
          {
            icon: CalendarDays,
            title: "Google Calendar",
            text: "Cria um evento privado para a consulta agendada.",
          },
          {
            icon: Video,
            title: "Google Meet",
            text: "Gera um link exclusivo para este atendimento.",
          },
          {
            icon: Mail,
            title: "Convite por e-mail",
            text: "O Google envia o convite ao endereço do consulente.",
          },
          {
            icon: MessageCircle,
            title: "Lembrete no WhatsApp",
            text: "Envia o template autorizado para quem ativou o lembrete.",
          },
        ].map(({ icon: Icon, title, text }, i) => (
          <div key={title}>
            <Icon size={23} />
            <strong>{title}</strong>
            <p>{text}</p>
            {i < 4 && <ArrowRight className="mg-flow-arrow" size={15} />}
          </div>
        ))}
      </div>
      <div className="mg-readiness-status">
        <div>
          <strong>Google Calendar + Meet</strong>
          <MgBadge tone={status?.googleConfigured ? "orange" : "neutral"}>
            {status?.googleConfigured
              ? "Credenciais configuradas; requer homologação"
              : "Aguardando conta Google e credenciais"}
          </MgBadge>
        </div>
        <div>
          <strong>WhatsApp Business Platform</strong>
          <MgBadge tone={status?.whatsappConfigured ? "orange" : "neutral"}>
            {status?.whatsappConfigured
              ? "Credenciais configuradas; requer homologação"
              : "Aguardando número, token e template aprovado"}
          </MgBadge>
        </div>
      </div>
      {failed ? (
        <p className="mg-caption">
          Não foi possível consultar a configuração do servidor. Nenhuma conexão
          será presumida como ativa.
        </p>
      ) : (
        <p className="mg-caption">
          {status
            ? "Antecedências previstas no servidor: " +
              status.reminderMinutes
                .map((m) => (m >= 60 ? `${m / 60}h` : `${m}min`))
                .join(" e ") +
              "."
            : "Consultando configuração…"}{" "}
          Reagendar invalida os lembretes do horário anterior; cancelar impede
          os próximos envios. Os pedidos de demonstração não acionam integrações
          reais.
        </p>
      )}
    </section>
  );
}
