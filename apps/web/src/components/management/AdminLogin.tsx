"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";
import { clearAdminPreview } from "@/lib/preview-events";
export function AdminLogin({ returnTo }: Readonly<{ returnTo: string }>) {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    clearAdminPreview();
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Não foi possível entrar.");
        return;
      }
      window.location.assign(returnTo);
    } catch {
      setError("Não foi possível conectar. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="admin-login">
      <section className="admin-login-story">
        <Link href="/" className="admin-login-logo">
          <Image
            src="/assets/Group 289458.png"
            width={170}
            height={82}
            alt="O Tal do Marmoteiro"
          />
        </Link>
        <div>
          <span className="mg-eyebrow">O CUIDADO COMEÇA NOS BASTIDORES</span>
          <h1>
            Seu espaço.
            <br />
            Seu tempo.
            <br />
            <em>Seu oráculo.</em>
          </h1>
          <p>
            Um lugar para cuidar dos encontros,
            <br />
            das pessoas e do seu negócio.
          </p>
        </div>
        <span className="admin-login-seal">
          <ShieldCheck size={18} /> Acesso exclusivo à gestão
        </span>
      </section>
      <section className="admin-login-panel">
        <Link href="/" className="admin-login-back">
          <ArrowLeft size={15} /> Voltar ao site
        </Link>
        <div className="admin-login-form">
          <span className="admin-login-lock">
            <LockKeyhole size={25} />
          </span>
          <span className="mg-eyebrow">PAINEL DO PRESTADOR</span>
          <h2>Bem-vindo ao seu espaço.</h2>
          <p>Entre com o acesso administrativo autorizado.</p>
          <form className="portal-form" onSubmit={submit}>
            <label>
              E-mail administrativo{" "}
              <input
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
                placeholder="voce@dominio.com"
                disabled={busy}
              />
            </label>
            <label>
              Senha
              <div className="admin-password">
                <input
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  maxLength={128}
                  disabled={busy}
                />
                <button
                  type="button"
                  aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="product-button full"
              disabled={busy}
            >
              {busy ? (
                <>
                  <LoaderCircle size={17} className="admin-spin" /> Verificando
                  acesso…
                </>
              ) : (
                <>
                  Entrar no painel <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
          <div className="admin-login-note">
            <ShieldCheck size={18} />
            <p>
              O acesso é liberado pelo responsável pelo oráculo. Contas de
              consulente não têm permissão para entrar neste painel.
            </p>
          </div>
          <details className="admin-login-help">
            <summary>Primeiro acesso ou redefinição de senha</summary>
            <p>
              O responsável pelo servidor cria sua conta e redefine sua senha
              por um canal restrito. Não há cadastro público de administradores.
            </p>
          </details>
        </div>
        <small className="admin-login-footer">
          O Tal do Marmoteiro · Gestão com cuidado.
        </small>
      </section>
    </main>
  );
}
