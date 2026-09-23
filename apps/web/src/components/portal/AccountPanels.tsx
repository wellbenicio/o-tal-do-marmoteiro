"use client";
import { useState, type FormEvent } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  FilePenLine,
  Mail,
  ArrowRight,
} from "lucide-react";
import { useDemo } from "./DemoProvider";
import { formString } from "@/lib/form";
import {
  prettyTimestamp,
  prettyDate,
  type DemoProfile,
} from "@/lib/demo-bookings";
const protectedFields = [
  { key: "legalName", label: "Nome civil" },
  { key: "socialName", label: "Nome social" },
  { key: "birthDate", label: "Data de nascimento" },
  { key: "motherName", label: "Nome da mãe" },
  { key: "genderIdentity", label: "Identidade de gênero" },
] as const;
export function AccountPanels({ view }: { view: "account" | "privacy" }) {
  const { profile, updateContact, addRequest, requests, notify } = useDemo();
  const [correction, setCorrection] = useState(false);
  const [field, setField] = useState<keyof DemoProfile>("legalName");
  if (!profile) return null;
  function saveContact(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    updateContact(
      formString(data, "email").trim(),
      formString(data, "phone").trim(),
    );
  }
  function submitCorrection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    addRequest({
      type: "CORRECTION",
      title:
        "Correção de " +
        (protectedFields.find((f) => f.key === field)?.label || field),
      field,
      currentValue: profile![field],
      requestedValue: formString(data, "newValue").trim(),
      reason: formString(data, "reason").trim(),
    });
    setCorrection(false);
  }
  function submitPrivacy(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    addRequest({
      type: "PRIVACY",
      title: formString(data, "type"),
      reason: formString(data, "message").trim(),
    });
    e.currentTarget.reset();
  }
  const filtered = requests.filter(
    (r) => r.type === (view === "account" ? "CORRECTION" : "PRIVACY"),
  );
  return (
    <div className="account-panels">
      {view === "account" ? (
        <>
          <div className="portal-card account-section">
            <div className="subsection-heading">
              <h2>
                <LockKeyhole size={19} /> Seus dados cadastrais
              </h2>
              <span className="status-badge">Dados protegidos</span>
            </div>
            <p>
              Vamos tratar você como <strong>{profile.name}</strong>
              {profile.pronouns && ` (${profile.pronouns})`}. Para corrigir os
              dados abaixo, envie uma solicitação.
            </p>
            <dl className="profile-data-grid">
              {protectedFields.map((f) => (
                <div key={f.key}>
                  <dt>{f.label}</dt>
                  <dd>
                    {f.key === "birthDate"
                      ? prettyDate(profile.birthDate)
                      : profile[f.key] || "Não informado"}
                  </dd>
                </div>
              ))}
              <div>
                <dt>Pronomes</dt>
                <dd>{profile.pronouns || "Não informados"}</dd>
              </div>
            </dl>
            <button
              className="product-button secondary"
              onClick={() => setCorrection(!correction)}
            >
              <FilePenLine size={16} />
              {correction
                ? "Fechar solicitação"
                : "Solicitar correção cadastral"}
            </button>
            {correction && (
              <form
                className="portal-form correction-form"
                onSubmit={submitCorrection}
              >
                <label>
                  Campo a corrigir
                  <select
                    value={field}
                    onChange={(e) =>
                      setField(e.target.value as keyof DemoProfile)
                    }
                  >
                    {protectedFields.map((f) => (
                      <option value={f.key} key={f.key}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="field-hint">
                  Valor atual: {profile[field] || "Não informado"}
                </p>
                <label>
                  Novo valor
                  <input
                    name="newValue"
                    type={field === "birthDate" ? "date" : "text"}
                    required
                  />
                </label>
                <label>
                  Motivo <small>(opcional)</small>
                  <textarea
                    name="reason"
                    rows={3}
                    placeholder="Conte o que precisa ser corrigido. Use dados fictícios."
                  />
                </label>
                <p className="field-hint">
                  A solicitação será analisada; o dado cadastral permanece como
                  está até a aprovação.
                </p>
                <button className="product-button" type="submit">
                  Registrar solicitação de teste <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
          <div className="portal-card account-section">
            <h2>Como podemos falar com você?</h2>
            <p>
              Contatos são editáveis. Na versão integrada, alterações passam por
              verificação.
            </p>
            <form className="portal-form" onSubmit={saveContact}>
              <div className="form-two-columns">
                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    defaultValue={profile.email}
                    autoComplete="email"
                    required
                  />
                </label>
                <label>
                  WhatsApp
                  <input
                    name="phone"
                    type="tel"
                    defaultValue={profile.phone}
                    pattern="\(?[1-9][0-9]\)?\s?[0-9]{4,5}[\s\-]?[0-9]{4}"
                    required
                  />
                </label>
              </div>
              <button className="product-button" type="submit">
                Salvar contato de teste
              </button>
            </form>
          </div>
          <div className="portal-card account-section">
            <h2>Segurança do acesso</h2>
            <p>
              Nenhuma senha é guardada ou autenticada nesta prévia. No serviço
              integrado, você poderá alterar sua senha e revogar sessões.
            </p>
            <button
              className="product-button secondary"
              onClick={() =>
                notify(
                  "Alteração de senha demonstrativa. Nenhuma senha foi alterada ou e-mail enviado.",
                )
              }
            >
              Testar alteração de senha
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="privacy-hero portal-card">
            <ShieldCheck size={34} />
            <span className="portal-eyebrow">SEUS DADOS, SEUS DIREITOS</span>
            <h2>Cuidado também é transparência.</h2>
            <p>
              Solicite acesso, correção ou outro direito aplicável e acompanhe a
              resposta por aqui. Conteúdos de consulta recebem tratamento
              separado do histórico administrativo.
            </p>
            <a className="text-link" href="mailto:falecom@marmoteiro.com">
              <Mail size={16} />
              falecom@marmoteiro.com
            </a>
          </div>
          <section className="portal-card account-section">
            <h2>Registrar uma solicitação</h2>
            <p>
              Conte o que precisa. Evite documentos e informações sensíveis
              desnecessárias.
            </p>
            <form className="portal-form" onSubmit={submitPrivacy}>
              <label>
                Assunto
                <select name="type">
                  <option>Acesso aos meus dados</option>
                  <option>Correção dos meus dados</option>
                  <option>Informações sobre o tratamento</option>
                  <option>Exclusão dos meus dados</option>
                  <option>Revogação de consentimento</option>
                  <option>Outro direito de privacidade</option>
                </select>
              </label>
              <label>
                Sua solicitação
                <textarea
                  name="message"
                  required
                  rows={4}
                  placeholder="Descreva sua solicitação usando apenas dados fictícios nesta prévia."
                />
              </label>
              <button className="product-button" type="submit">
                Registrar solicitação de teste <ArrowRight size={16} />
              </button>
            </form>
            <p className="field-hint">
              Pedidos são avaliados conforme o direito aplicável e as obrigações
              de conservação. Nenhuma exclusão ou comunicação real ocorre nesta
              demonstração.
            </p>
          </section>
        </>
      )}
      <section className="portal-card account-section">
        <h2>Suas solicitações</h2>
        {filtered.length ? (
          <div className="request-history">
            {filtered.map((r) => (
              <article key={r.id}>
                <div>
                  <strong>{r.title}</strong>
                  <span className="status-badge">Recebida</span>
                </div>
                <small>
                  {r.id} · {prettyTimestamp(r.requestedAt)}
                </small>
                {r.reason && <p>{r.reason}</p>}
                {r.type === "CORRECTION" && (
                  <p>
                    {r.currentValue || "Não informado"} → {r.requestedValue}
                  </p>
                )}
                <p className="field-hint">
                  Aguardando análise no fluxo de demonstração. Nenhum envio
                  real.
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p>Nenhuma solicitação registrada nesta sessão.</p>
        )}
      </section>
    </div>
  );
}
