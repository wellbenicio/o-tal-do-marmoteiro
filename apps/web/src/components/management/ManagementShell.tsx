"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  MessageCircle,
  Receipt,
  Wallet,
  Users,
  Bell,
  Plug,
  Search,
  ArrowUpRight,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAdminIdentity, adminLogout } from "./AdminAccess";
import { useManagement } from "./ManagementProvider";
const nav = [
  { href: "/gestao", label: "Visão geral", icon: LayoutDashboard },
  { href: "/gestao/agenda", label: "Minha agenda", icon: CalendarDays },
  { href: "/gestao/perguntas", label: "Perguntas", icon: MessageCircle },
  { href: "/gestao/pedidos", label: "Pedidos e solicitações", icon: Receipt },
  { href: "/gestao/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/gestao/consulentes", label: "Consulentes", icon: Users },
  { href: "/gestao/notificacoes", label: "Notificações e e-mails", icon: Bell },
  { href: "/gestao/integracoes", label: "Integrações", icon: Plug },
];
export function ManagementShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const state = useManagement();
  const admin = useAdminIdentity();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const unread = state.notices.filter((n) => !n.read).length;
  useEffect(() => {
    if (!open) return;
    const old = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const el = document.querySelector(".mg-sidebar");
    const focus = el?.querySelectorAll<HTMLElement>("a[href],button");
    focus?.[0]?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "Tab" && focus?.length) {
        const first = focus[0],
          last = focus[focus.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = previousOverflow;
      old?.focus();
    };
  }, [open]);
  if (!state.ready)
    return (
      <main className="portal-loading">
        <Sparkles />
        <p>Preparando sua gestão…</p>
      </main>
    );
  return (
    <div className="management-app">
      <aside className={`mg-sidebar ${open ? "open" : ""}`}>
        <Link href="/gestao" className="mg-brand">
          <Image
            src="/assets/Group 289458.png"
            width={142}
            height={68}
            alt="O Tal do Marmoteiro"
          />
        </Link>
        <button
          className="mg-close"
          aria-label="Fechar navegação"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
        <span className="mg-nav-label">GESTÃO DO ORÁCULO</span>
        <nav aria-label="Gestão">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              href={href}
              key={href}
              className={pathname === href ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {href === "/gestao/notificacoes" && unread > 0 && <b>{unread}</b>}
            </Link>
          ))}
        </nav>
        <div className="mg-sidebar-bottom">
          <button className="mg-logout" onClick={adminLogout}>
            <LogOut size={15} />
            Sair do painel
          </button>
          <div className="mg-owner">
            <span>WB</span>
            <div>
              <strong>{admin.name}</strong>
              <small>Acesso autorizado</small>
            </div>
            <ShieldCheck size={16} />
          </div>
          <Link href="/minha-conta">
            Ver área do consulente <ArrowUpRight size={14} />
          </Link>
        </div>
      </aside>
      {open && (
        <button
          className="mg-backdrop"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="mg-main">
        <header className="mg-topbar">
          <button
            className="mg-menu"
            aria-label="Abrir navegação da gestão"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <div className="mg-breadcrumb">
            Seu negócio <span>/</span>
            <strong>
              {nav.find((n) => n.href === pathname)?.label || "Gestão"}
            </strong>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push("/gestao/pedidos?busca=" + encodeURIComponent(query));
            }}
            className="mg-search"
          >
            <Search size={16} />
            <input
              aria-label="Buscar pedido ou consulente"
              placeholder="Buscar pedido ou consulente"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <kbd>↵</kbd>
          </form>
          <Link
            href="/gestao/notificacoes"
            className="mg-bell"
            aria-label={`${unread} notificações não lidas`}
          >
            <Bell size={19} />
            {unread > 0 && <i />}
          </Link>
          <Link href="/" className="mg-site-link">
            Ver site <ArrowUpRight size={14} />
          </Link>
        </header>
        <div className="mg-demo-strip">
          <Sparkles size={14} />
          <span>
            Demonstração · dados fictícios. Google e e-mails ainda não
            conectados.
          </span>
          <Link href="/gestao/integracoes">
            Ver integrações <ArrowRightIcon />
          </Link>
        </div>
        <main className="mg-content">{children}</main>
        <footer className="mg-footer">
          <span>O Tal do Marmoteiro · Um olhar para o seu negócio.</span>
          <span>Horário de Brasília · Prévia de gestão</span>
        </footer>
      </div>
    </div>
  );
}
function ArrowRightIcon() {
  return <ArrowUpRight size={12} />;
}
