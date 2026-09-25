"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useDemo } from "@/components/portal/DemoProvider";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { profile } = useDemo();
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" aria-label="Marmoteiro — início">
          <Image
            src="/assets/Group 289458.png"
            width={125}
            height={60}
            alt="O Tal do Marmoteiro"
            priority
          />
        </Link>
        <nav
          className={open ? "site-nav is-open" : "site-nav"}
          aria-label="Navegação principal"
        >
          <Link href="/#sobre" onClick={() => setOpen(false)}>
            A consulta
          </Link>
          <Link href="/#como-funciona" onClick={() => setOpen(false)}>
            Como funciona
          </Link>
          <Link href="/#faq" onClick={() => setOpen(false)}>
            Dúvidas
          </Link>
        </nav>
        <div className="site-header-actions">
          <Link
            className="site-account"
            href={profile ? "/minha-conta" : "/login"}
          >
            <UserRound size={17} />
            <span>Minha conta</span>
          </Link>
          <Link className="site-book" href="/agendar">
            Agendar <ArrowUpRight size={16} />
          </Link>
          <button
            className="site-menu"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}
