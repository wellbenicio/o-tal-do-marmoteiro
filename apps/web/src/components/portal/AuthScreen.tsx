"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { formString } from "@/lib/form";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  CalendarDays,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { defaultProfile } from "@/lib/demo-bookings";
import { ProfileFields, profileFromForm } from "./ProfileFields";
import { useDemo } from "./DemoProvider";
export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const signup = mode === "signup";
  const [visible, setVisible] = useState(false);
  const [reset, setReset] = useState(false);
  const [sent, setSent] = useState(false);
  const { enterDemo, profile } = useDemo();
  const router = useRouter();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reset) {
      setSent(true);
      return;
    }
    const data = new FormData(event.currentTarget);
    enterDemo(
      signup
        ? profileFromForm(data)
        : { ...defaultProfile, email: formString(data, "email").trim() },
      !signup,
    );
    router.push(destination());
  }
  function destination() {
    const next = new URLSearchParams(window.location.search).get("continuar");
    return next && (next === "/agendar" || next.startsWith("/agendar?"))
      ? next
      : "/minha-conta";
  }
  function switchMode(
    event: React.MouseEvent<HTMLAnchorElement>,
    target: string,
  ) {
    event.preventDefault();
    const next = new URLSearchParams(window.location.search).get("continuar");
    router.push(
      target + (next ? "?continuar=" + encodeURIComponent(next) : ""),
    );
  }

  return (
    <main className={`auth-page ${signup ? "signup-page" : ""}`}>
      <div className="auth-art">
        <Image
          src="/assets/marmoteiro-baralho.png"
          alt=""
          fill
          sizes="50vw"
          priority
        />
        <div className="auth-art-shade" />
        <Link className="auth-brand" href="/">
          <Image
            src="/assets/Group 289458.png"
            width={151}
            height={72}
            alt="O Tal do Marmoteiro"
          />
        </Link>
        <div className="auth-art-copy">
          <span className="portal-eyebrow">BOM TE VER POR AQUI</span>
          <h1>
            Seu espaço.
            <br />
            Suas perguntas.
            <br />
            <em>Novos caminhos.</em>
          </h1>
          <p>
            Suas consultas, anotações e próximos passos, reunidos com cuidado em
            um só lugar.
          </p>
          <div>
            <span>
              <CalendarDays size={16} /> Sua agenda
            </span>
            <span>
              <FileText size={16} /> Suas anotações
            </span>
            <span>
              <ShieldCheck size={16} /> Seu espaço
            </span>
          </div>
        </div>
      </div>
      <section className="auth-form-side">
        <Link href="/" className="back-link">
          <ArrowLeft size={15} /> Voltar para o site
        </Link>
        <div className="auth-form-wrap">
          <span className="portal-eyebrow">ÁREA DO CLIENTE</span>
          <h2>
            {reset
              ? "Vamos recuperar seu acesso?"
              : signup
                ? "Seu próximo capítulo começa aqui."
                : "Que bom te ver de novo."}
          </h2>
          <p className="auth-description">
            {reset
              ? "Informe o e-mail usado no seu cadastro."
              : signup
                ? "Crie seu espaço para acompanhar cada consulta."
                : "Entre para cuidar dos seus próximos encontros."}
          </p>
          <div className="auth-tabs">
            <Link
              href="/login"
              onClick={(e) => switchMode(e, "/login")}
              className={!signup ? "active" : ""}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              onClick={(e) => switchMode(e, "/cadastro")}
              className={signup ? "active" : ""}
            >
              Criar conta
            </Link>
          </div>
          <p className="auth-preview-warning">
            Demonstração: use dados fictícios e uma senha de teste. Nenhuma
            conta real será criada.
          </p>
          <form onSubmit={submit} className="portal-form">
            {signup && !reset && <ProfileFields />}
            <label>
              E-mail
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
                required
              />
            </label>
            {!reset && (
              <label>
                Senha
                <div className="password-field">
                  <input
                    name="password"
                    type={visible ? "text" : "password"}
                    autoComplete={signup ? "new-password" : "current-password"}
                    minLength={8}
                    required
                    placeholder="Pelo menos 8 caracteres"
                  />
                  <button
                    type="button"
                    aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
            )}
            {!signup && !reset && (
              <button
                className="auth-forgot"
                type="button"
                onClick={() => setReset(true)}
              >
                Esqueci minha senha
              </button>
            )}
            {signup && !reset && (
              <label className="check-label">
                <input type="checkbox" required />
                <span>
                  Li as{" "}
                  <Link
                    href="/termos"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    orientações da prévia
                  </Link>{" "}
                  e entendo que este cadastro é demonstrativo.
                </span>
              </label>
            )}
            <button className="product-button full" type="submit">
              {reset
                ? "Testar recuperação"
                : signup
                  ? "Testar cadastro"
                  : "Testar acesso"}
              <ArrowUpRight size={18} />
            </button>
            {reset && (
              <button
                className="product-button secondary full"
                type="button"
                onClick={() => {
                  setReset(false);
                  setSent(false);
                }}
              >
                Voltar ao login
              </button>
            )}
            {sent && (
              <p className="inline-info" role="status">
                Fluxo de recuperação demonstrado. Nenhum e-mail foi enviado; a
                autenticação real ainda será integrada.
              </p>
            )}
          </form>
          <div className="auth-divider">
            <span>ou conheça antes</span>
          </div>
          <button
            className="demo-access"
            onClick={() => {
              if (!profile) enterDemo();
              router.push(destination());
            }}
          >
            <Sparkles size={18} />
            {profile
              ? `Continuar como ${profile.name.split(" ")[0]}`
              : "Explorar uma conta de demonstração"}
            <ArrowUpRight size={16} />
          </button>
          <Link href="/gestao" className="demo-access">
            <ShieldCheck size={18} />
            Acesso administrativo
            <ArrowUpRight size={16} />
          </Link>
          <p className="auth-demo-note">
            <strong>Prévia interativa.</strong> Use dados fictícios. A senha não
            é armazenada nem validada por um serviço de autenticação. Nenhuma
            conta real é criada.
          </p>
        </div>
        <p className="auth-footer">O Tal do Marmoteiro · Um momento só seu.</p>
      </section>
    </main>
  );
}
