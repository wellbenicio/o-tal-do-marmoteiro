import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(
    /\D/g,
    "",
  );
  const hasWhatsapp = Boolean(
    whatsappNumber && /^\d{10,15}$/.test(whatsappNumber),
  );
  const contactUrl = hasWhatsapp
    ? `https://wa.me/${whatsappNumber}`
    : "/agendar";

  return (
    <footer className="footer-section">
      <div className="footer-inner">
        <Link
          className="footer-brand"
          href="/"
          aria-label="O Tal do Marmoteiro — início"
        >
          <Image
            alt="O Tal do Marmoteiro"
            className="footer-logo"
            height={160}
            sizes="(max-width: 767px) 240px, 334px"
            src="/assets/Group 289458.png"
            width={334}
          />
        </Link>
        <nav className="footer-contact" aria-label="Contato e informações">
          <h2>Contato</h2>
          <Link
            href={contactUrl}
            target={hasWhatsapp ? "_blank" : undefined}
            rel={hasWhatsapp ? "noopener noreferrer" : undefined}
          >
            {hasWhatsapp ? "Nosso WhatsApp" : "Fale com a gente"}
          </Link>
          <Link href="/#como-funciona">Como funciona</Link>
          <Link href="/#faq">Central de ajuda</Link>
          <Link href="/login">Minha conta</Link>
          <Link href="/termos">Termos e orientações</Link>
        </nav>
        <p className="footer-copyright">
          Marmoteiro · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
