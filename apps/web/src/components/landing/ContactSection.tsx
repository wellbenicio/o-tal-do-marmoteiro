"use client";

import Image from "next/image";
import { type FormEvent, useRef, useState } from "react";
import "./contact.css";

const whatsappNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "").replace(
  /\D/g,
  "",
);
const hasWhatsappNumber = /^[1-9]\d{9,14}$/.test(whatsappNumber);

export function ContactSection() {
  const [showPreviewMessage, setShowPreviewMessage] = useState(false);
  const contactDialog = useRef<HTMLDialogElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowPreviewMessage(true);
  }

  return (
    <section
      aria-labelledby="contact-heading"
      className="contact-section"
      id="agendamento"
    >
      <div className="contact-card figma-shell">
        <div className="contact-visual">
          <Image
            alt="O Tal do Marmoteiro com seu baralho de cartas"
            className="contact-photo"
            fill
            sizes="(max-width: 760px) 100vw, (max-width: 1180px) 59vw, 663px"
            src="/assets/marmoteiro-baralho.png"
          />
          <div aria-hidden="true" className="contact-photo-shade" />
          <div className="contact-copy">
            <h2 id="contact-heading">
              As <span>respostas</span>
              <br />
              que você procura
              <br />
              podem estar aqui
            </h2>
            <p>
              Receba uma leitura de cartomancia online personalizada e encontre
              direcionamento para o momento que está vivendo.
            </p>
          </div>
        </div>

        <div className="contact-form-panel">
          <form className="contact-form" onSubmit={handleSubmit}>
            <Image
              alt="O Tal do Marmoteiro"
              className="contact-logo"
              height={80}
              src="/assets/Group 289458.png"
              width={167}
            />
            <div className="contact-fields">
              <label className="contact-field" htmlFor="contact-name">
                <span>Nome</span>
                <input
                  autoComplete="name"
                  id="contact-name"
                  minLength={2}
                  name="name"
                  placeholder="Digite seu nome"
                  required
                  type="text"
                />
              </label>

              <label className="contact-field" htmlFor="contact-birthdate">
                <span>Data de nascimento</span>
                <input
                  autoComplete="bday"
                  id="contact-birthdate"
                  name="birthdate"
                  required
                  type="date"
                />
              </label>

              <label className="contact-field" htmlFor="contact-email">
                <span>E-mail</span>
                <input
                  autoComplete="email"
                  id="contact-email"
                  name="email"
                  placeholder="Digite e-mail"
                  required
                  type="email"
                />
              </label>

              <label className="contact-field" htmlFor="contact-phone">
                <span>Telefone</span>
                <span className="contact-phone-row">
                  <span className="contact-country-code">
                    <Image
                      alt="Brasil"
                      height={21}
                      src="/assets/Flag_of_Brazil 1.svg"
                      width={30}
                    />
                    <span>+55</span>
                  </span>
                  <input
                    aria-label="Telefone com DDD, código do país +55"
                    autoComplete="tel-national"
                    id="contact-phone"
                    inputMode="tel"
                    name="phone"
                    pattern="\(?[1-9][0-9]\)?\s?[0-9]{4,5}[\s\-]?[0-9]{4}"
                    placeholder="(00) 00000-0000"
                    required
                    title="Informe seu telefone com DDD, por exemplo (85) 99999-9999."
                    type="tel"
                  />
                </span>
              </label>
            </div>

            <button className="contact-submit" type="submit">
              Enviar
            </button>

            <p className="contact-whatsapp">
              Ou fale com a gente pelo{" "}
              {hasWhatsappNumber ? (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  nosso whatsapp
                </a>
              ) : (
                <button
                  onClick={() => contactDialog.current?.showModal()}
                  type="button"
                >
                  nosso whatsapp
                </button>
              )}
            </p>

            {showPreviewMessage && (
              <output className="contact-preview-message">
                Esta é uma prévia da interface. Seus dados não foram enviados. O
                agendamento e o pagamento estarão disponíveis na próxima etapa.
              </output>
            )}
          </form>
        </div>
      </div>

      <dialog
        aria-describedby="contact-dialog-description"
        aria-labelledby="contact-dialog-title"
        className="contact-dialog"
        ref={contactDialog}
      >
        <h2 id="contact-dialog-title">Nosso WhatsApp está chegando</h2>
        <p id="contact-dialog-description">
          Esta é uma prévia da interface. O canal de atendimento pelo WhatsApp
          estará disponível em breve.
        </p>
        <button
          autoFocus
          className="contact-submit"
          onClick={() => contactDialog.current?.close()}
          type="button"
        >
          Entendi
        </button>
      </dialog>
    </section>
  );
}
