"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Video,
  CalendarDays,
  ShieldCheck,
  CreditCard,
  QrCode,
  Barcode,
  Sparkles,
  MessageCircle,
  Info,
} from "lucide-react";
import { useDemo } from "./DemoProvider";
import { BookingCalendar } from "./BookingCalendar";
import { LegalAcknowledgements } from "./LegalAcknowledgements";
import {
  methodLabels,
  money,
  prettyDate,
  prettyTimestamp,
  localDate,
  type DemoBooking,
} from "@/lib/demo-bookings";
import { previewConfig } from "@/lib/preview-config";
import { previewAcceptances, type LegalDocumentId } from "@/lib/preview-legal";
const steps = ["Seu acesso", "Documentos", "Seu atendimento", "Pagamento"];
const paymentIcons = {
  PIX: { icon: QrCode, size: 44 },
  CARD: { icon: CreditCard, size: 40 },
  BOLETO: { icon: Barcode, size: 45 },
};
function journeyTitle(
  step: number,
  question: boolean,
  paid: boolean,
  orderStatus?: DemoBooking["orderStatus"],
) {
  if (step !== 5)
    return question
      ? "O que você quer compreender?"
      : "Vamos marcar nossa conversa?";
  if (paid) return "Está tudo certo por aqui.";
  if (orderStatus === "AWAITING_PAYMENT")
    return "Falta só confirmar o pagamento.";
  return "Confira a situação do seu pedido.";
}
function progressClass(step: number, index: number) {
  if (step === index + 1) return "active";
  if (step > index + 1) return "complete";
  return "";
}
export function BookingWizard({
  initialModality = "APPOINTMENT",
  resumeId,
}: Readonly<{
  initialModality?: DemoBooking["modality"];
  resumeId?: string;
}>) {
  const { ready, bookings } = useDemo();
  if (!ready)
    return (
      <main className="portal-loading">
        <Sparkles />
        <p>Preparando seu atendimento…</p>
      </main>
    );
  return (
    <BookingJourney
      key={resumeId || initialModality}
      initial={bookings.find((b) => b.id === resumeId)}
      initialModality={initialModality}
    />
  );
}
function BookingJourney({
  initial,
  initialModality,
}: Readonly<{
  initial?: DemoBooking;
  initialModality: DemoBooking["modality"];
}>) {
  const { profile, bookings, addBooking, payBooking, now, enterDemo } =
    useDemo();
  const [step, setStep] = useState(initial ? 5 : 1);
  const [modality, setModality] = useState<DemoBooking["modality"]>(
    initial?.modality ?? initialModality,
  );
  const [date, setDate] = useState(initial?.date ?? "");
  const [time, setTime] = useState(initial?.time ?? "");
  const [method, setMethod] = useState<DemoBooking["method"]>(
    initial?.method ?? "PIX",
  );
  const [bookingId, setBookingId] = useState(initial?.id ?? "");
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState<LegalDocumentId[]>([]);
  const [recording, setRecording] = useState<"yes" | "no" | "">("");
  const [questionText, setQuestionText] = useState(
    initial?.question?.text ?? "",
  );
  const [questionContext, setQuestionContext] = useState(
    initial?.question?.context ?? "",
  );
  const [whatsappReminder, setWhatsappReminder] = useState(
    initial?.whatsappReminderConsent?.granted ?? false,
  );
  const [priority, setPriority] = useState(initial?.priority ?? false);
  const creating = useRef(false);
  const question = modality === "QUESTION";
  const priorityAmount = priority ? previewConfig.question.priorityAmount : 0;
  const amount = question
    ? previewConfig.question.amount + priorityAmount
    : previewConfig.appointment.amount;
  const queueLabel = priority
    ? "Prioritária · mesmo SLA de 48h úteis"
    : "Regular · até 48h úteis";
  const recordingLabel =
    recording === "yes" ? "Autorizada separadamente" : "Não autorizada";
  const PaymentIcon = paymentIcons[method].icon;
  const current = bookings.find((b) => b.id === bookingId);
  const paid = current?.paymentStatus === "APPROVED";
  const returnUrl = "/agendar" + (question ? "?modalidade=pergunta" : "");
  function next(value: number) {
    setStep(value);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function createPayment() {
    if (
      creating.current ||
      !profile ||
      accepted.length !== 3 ||
      (question && questionText.trim().length < 10) ||
      (!question && (!date || !time || !recording))
    )
      return;
    creating.current = true;
    const at = new Date().toISOString();
    const booking: DemoBooking = {
      id: "MRM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      modality,
      date: question ? localDate() : date,
      time: question ? "00:00" : time,
      method,
      orderStatus: "AWAITING_PAYMENT",
      status: "NOT_STARTED",
      paymentStatus: "PENDING",
      amount,
      createdAt: at,
      priority: question && priority,
      question: question
        ? {
            text: questionText.trim(),
            context: questionContext.trim() || undefined,
            receivedAt: at,
          }
        : undefined,
      whatsappReminderConsent: question
        ? undefined
        : {
            granted: whatsappReminder,
            decidedAt: at,
            phone: profile.phone,
            version: "WHATSAPP-LEMBRETE-PREVIA-2026-09-22",
          },
      rescheduleUsed: false,
      lockExpiresAt: new Date(
        Date.now() + previewConfig.appointment.holdMinutes * 60000,
      ).toISOString(),
      acceptances: previewAcceptances(accepted, at),
      recordingConsent: question
        ? undefined
        : {
            granted: recording === "yes",
            decidedAt: at,
            version: "PREVIA-BASELINE-2026-09-21",
          },
      timeline: [
        {
          at,
          title:
            "Pedido de demonstração criado; leitura dos três resumos registrada",
        },
      ],
    };
    if (!addBooking(booking)) {
      setError("Esse horário não está mais disponível. Volte e escolha outro.");
      creating.current = false;
      return;
    }
    setBookingId(booking.id);
    next(5);
  }
  function renderPaymentOutcome() {
    if (paid)
      return (
        <>
          <span className="result-icon success">
            <CheckCircle2 size={38} />
          </span>
          <span className="portal-eyebrow">PAGAMENTO SIMULADO APROVADO</span>
          <h2>
            {question
              ? "Sua pergunta entrou na fila."
              : "Seu momento está reservado."}
          </h2>
          <p>
            {question ? (
              "A execução ainda não começou. Acompanhe o atendimento e suas solicitações na sua área."
            ) : (
              <>
                Consulta marcada na demonstração para{" "}
                <strong>{prettyDate(date)}</strong>, às <strong>{time}</strong>.
              </>
            )}
          </p>
          {!question && (
            <div className="appointment-channels">
              <Video size={22} />
              <div>
                <h3>Google Calendar + Google Meet</h3>
                <p>
                  Convite por e-mail e link da chamada: aguardando integração.
                  Nenhum link fictício foi criado.
                </p>
                <p>
                  Lembretes WhatsApp:{" "}
                  {whatsappReminder
                    ? "autorizados para esta consulta; aguardando conexão"
                    : "não ativados"}
                  .
                </p>
              </div>
            </div>
          )}
          <div className="result-next">
            <CalendarDays size={22} />
            <p>
              Pedido, documentos, histórico e ações disponíveis reunidos em um
              só lugar. Nenhum e-mail real foi enviado.
            </p>
          </div>
          <Link
            className="product-button full"
            href={question ? "/minha-conta/perguntas" : "/minha-conta"}
          >
            Ir para minha área <ArrowRight size={16} />
          </Link>
        </>
      );
    if (current?.orderStatus === "AWAITING_PAYMENT")
      return (
        <>
          <span className="result-icon">
            <PaymentIcon size={paymentIcons[method].size} />
          </span>
          <span className="portal-eyebrow">AGUARDANDO APROVAÇÃO</span>
          <h2>{methodLabels[method]} de demonstração</h2>
          <p>
            Este pedido ainda não está confirmado. O pagamento de teste expira
            em{" "}
            {Math.max(
              0,
              Math.ceil((Date.parse(current.lockExpiresAt!) - now) / 60000),
            )}{" "}
            minutos.
          </p>
          <div className="demo-payment-amount">
            <span>Total do pedido</span>
            <strong>{money(current.amount)}</strong>
          </div>
          <p className="inline-info">
            O botão abaixo simula a confirmação do gateway. Nenhum valor é
            cobrado.
          </p>
          <button
            className="product-button full"
            onClick={() => payBooking(bookingId)}
          >
            Simular pagamento aprovado <CheckCircle2 size={18} />
          </button>
          <Link className="text-link" href="/minha-conta/consultas">
            Continuar depois na minha área
          </Link>
        </>
      );
    return (
      <>
        <span className="result-icon">
          <Clock3 size={38} />
        </span>
        <h2>Esta reserva foi encerrada.</h2>
        <p>
          O prazo expirou ou a reserva foi cancelada. Nenhuma cobrança foi
          realizada.
        </p>
        <button
          className="product-button full"
          onClick={() => {
            creating.current = false;
            setBookingId("");
            setDate("");
            setTime("");
            next(1);
          }}
        >
          Iniciar um novo pedido
        </button>
      </>
    );
  }
  function renderAccessStep() {
    return (
      <>
        <div className="wizard-section-title">
          <span className="portal-eyebrow">PASSO 01</span>
          <h2>Um atendimento do seu jeito.</h2>
          <p>Escolha a modalidade e acesse sua conta para continuar.</p>
        </div>
        <fieldset className="service-choice" aria-label="Modalidade">
          {[
            {
              id: "APPOINTMENT",
              icon: Video,
              name: "Consulta online",
              desc: "Uma conversa ao vivo, em um horário só seu.",
            },
            {
              id: "QUESTION",
              icon: MessageCircle,
              name: "Pergunta avulsa",
              desc: "Uma pergunta, com foto do jogo e áudio pelo WhatsApp.",
            },
          ].map(({ id, icon: Icon, name, desc }) => (
            <button
              key={id}
              className={modality === id ? "selected" : ""}
              aria-pressed={modality === id}
              onClick={() => setModality(id as DemoBooking["modality"])}
            >
              <Icon size={24} />
              <strong>{name}</strong>
              <span>{desc}</span>
            </button>
          ))}
        </fieldset>
        {profile ? (
          <div className="checkout-profile">
            <span className="profile-avatar">{profile.name[0]}</span>
            <div>
              <strong>{profile.name}</strong>
              <p>
                {profile.email} ·{" "}
                {profile.pronouns || "Seus dados estão na sua área"}
              </p>
            </div>
            <Link href="/minha-conta/dados">Ver dados</Link>
          </div>
        ) : (
          <div className="checkout-access">
            <h3>Seu espaço acompanha você.</h3>
            <p>
              Entre ou crie uma conta para reunir agendamentos, perguntas e
              anotações.
            </p>
            <div className="modal-buttons">
              <Link
                className="product-button"
                href={"/cadastro?continuar=" + encodeURIComponent(returnUrl)}
              >
                Criar minha conta <ArrowRight size={16} />
              </Link>
              <Link
                className="product-button secondary"
                href={"/login?continuar=" + encodeURIComponent(returnUrl)}
              >
                Já tenho conta
              </Link>
            </div>
            <button className="text-link" onClick={() => enterDemo()}>
              Explorar com uma conta fictícia
            </button>
          </div>
        )}
        <div className="wizard-actions">
          <span className="field-hint">
            Seus documentos ficam vinculados a cada contratação.
          </span>
          <button
            className="product-button"
            disabled={!profile}
            onClick={() => next(2)}
          >
            Continuar <ArrowRight size={16} />
          </button>
        </div>
      </>
    );
  }

  function renderDocumentsStep() {
    return (
      <>
        <div className="wizard-section-title">
          <span className="portal-eyebrow">PASSO 02</span>
          <h2>Informação antes de decidir.</h2>
          <p>Leia os documentos aplicáveis ao seu atendimento.</p>
        </div>
        <LegalAcknowledgements accepted={accepted} onChange={setAccepted} />
        <div className="wizard-actions">
          <button className="product-button secondary" onClick={() => next(1)}>
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            className="product-button"
            disabled={accepted.length !== 3}
            onClick={() => next(3)}
          >
            Configurar atendimento <ArrowRight size={16} />
          </button>
        </div>
      </>
    );
  }

  function renderServiceStep() {
    return (
      <>
        <div className="wizard-section-title">
          <span className="portal-eyebrow">PASSO 03</span>
          <h2>
            {question
              ? "Uma pergunta. Um novo olhar."
              : "Qual é o melhor momento?"}
          </h2>
          <p>
            {question
              ? "Conheça a entrega e escolha sua fila de atendimento."
              : "Escolha um dia e um horário para sua consulta."}
          </p>
        </div>
        {question ? (
          <>
            <div className="question-delivery">
              <MessageCircle size={26} />
              <div>
                <h3>Você recebe pelo WhatsApp</h3>
                <p>
                  A identificação da pergunta, a foto do jogo e o áudio com a
                  interpretação.
                </p>
              </div>
            </div>
            <div className="portal-form question-inputs">
              <label>
                Sua pergunta{" "}
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  rows={4}
                  minLength={10}
                  maxLength={1500}
                  required
                  placeholder="Escreva a pergunta que você quer trazer para o jogo."
                />
              </label>
              <span className="field-hint">
                {questionText.length}/1500 caracteres · Uma pergunta, respondida
                por áudio e foto pelo WhatsApp. Não é uma videochamada.
              </span>
              <label>
                Contexto para o atendimento (opcional){" "}
                <textarea
                  value={questionContext}
                  onChange={(e) => setQuestionContext(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Conte apenas o necessário para compreender sua pergunta."
                />
              </label>
              <p className="field-hint">
                Use somente exemplos fictícios nesta prévia. Evite documentos e
                informações excessivas de outras pessoas.
              </p>
            </div>
            <div className="guidance-list">
              <article>
                <Clock3 />
                <div>
                  <h3>Até 48 horas úteis</h3>
                  <p>
                    O prazo começa na confirmação do pagamento. A data limite
                    depende do calendário operacional, ainda não configurado
                    nesta demonstração.
                  </p>
                </div>
              </article>
              <article>
                <ShieldCheck />
                <div>
                  <h3>Na fila, ainda não iniciado</h3>
                  <p>
                    O início e a entrega são registrados pelo prestador. Você
                    pode solicitar cancelamento pela sua área, inclusive durante
                    a execução.
                  </p>
                </div>
              </article>
            </div>
            <label
              className={`priority-choice ${priority ? "selected" : ""}`}
              aria-label="Adicionar prioridade de fila"
            >
              <input
                type="checkbox"
                checked={priority}
                onChange={(e) => setPriority(e.target.checked)}
              />
              <span>
                <strong>
                  Adicionar prioridade de fila{" "}
                  <em>+ {money(previewConfig.question.priorityAmount)}</em>
                </strong>
                <small>
                  Passa à frente das perguntas regulares ainda não iniciadas.
                  Não interrompe atendimentos e mantém o limite de 48 horas
                  úteis.
                </small>
              </span>
            </label>
            <p className="field-hint">
              Valores ilustrativos. A prioridade integra o total da contratação
              e também o reembolso integral, quando aplicável.
            </p>
          </>
        ) : (
          <>
            <BookingCalendar
              date={date}
              time={time}
              onDate={setDate}
              onTime={setTime}
              bookings={bookings}
            />
            <div className="policy-summary">
              <h3>Seu horário, com clareza</h3>
              <p>
                <strong>Reagendamento:</strong> uma vez, solicitado com pelo
                menos 24h de antecedência. Após receber as opções, você tem 48h
                para escolher.
              </p>
              <p>
                <strong>Cancelamento tardio:</strong> menos de 24h, retenção de
                30% e restituição de 70%, quando aplicável.
              </p>
              <p>
                <strong>No-show:</strong> tolerância de 15min; retenção de 50% e
                restituição de 50%, quando caracterizado. Direitos legais e
                situações excepcionais prevalecem.
              </p>
            </div>
            <div className="appointment-channels">
              <Video size={22} />
              <div>
                <h3>Consulta por Google Meet</h3>
                <p>
                  Após a confirmação do pagamento, o fluxo integrado enviará o
                  convite do Google Calendar com o link da videochamada ao seu
                  e-mail. Nesta prévia, o envio ainda está desativado.
                </p>
              </div>
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={whatsappReminder}
                onChange={(e) => setWhatsappReminder(e.target.checked)}
              />
              <span>
                Quero receber lembretes desta consulta pelo WhatsApp no número{" "}
                {profile?.phone}.
                <small>
                  Opcional. Você pode agendar sem ativar. Esta escolha não
                  autoriza mensagens promocionais; o envio automático ainda não
                  está conectado.
                </small>
              </span>
            </label>
            <fieldset className="recording-choice">
              <legend>Você autoriza a gravação da consulta?</legend>
              <p>
                A escolha é independente dos termos. Recusar não impede a
                consulta. Retenção de até 90 dias após o atendimento, salvo
                preservação jurídica necessária.
              </p>
              <label>
                <input
                  type="radio"
                  name="recording"
                  checked={recording === "no"}
                  onChange={() => setRecording("no")}
                />{" "}
                Não autorizo a gravação
              </label>
              <label>
                <input
                  type="radio"
                  name="recording"
                  checked={recording === "yes"}
                  onChange={() => setRecording("yes")}
                />{" "}
                Autorizo, conforme as condições apresentadas
              </label>
            </fieldset>
          </>
        )}
        <div className="wizard-actions">
          <button className="product-button secondary" onClick={() => next(2)}>
            <ArrowLeft size={16} />
            Voltar
          </button>
          <button
            className="product-button"
            disabled={
              question
                ? questionText.trim().length < 10
                : !date || !time || !recording
            }
            onClick={() => next(4)}
          >
            Revisar e pagar <ArrowRight size={16} />
          </button>
        </div>
      </>
    );
  }

  function renderReviewStep() {
    return (
      <>
        <div className="wizard-section-title">
          <span className="portal-eyebrow">PASSO 04</span>
          <h2>Confira. Está tudo certo?</h2>
          <p>Revise os detalhes antes de iniciar o pagamento de teste.</p>
        </div>
        <div className="checkout-review">
          <div>
            <span>Atendimento</span>
            <strong>
              {question
                ? "Pergunta avulsa pelo WhatsApp"
                : "Consulta online · 30 minutos"}
            </strong>
          </div>
          <div>
            <span>{question ? "Fila" : "Horário de Brasília"}</span>
            <strong>
              {question ? queueLabel : `${prettyDate(date)} · ${time}`}
            </strong>
          </div>
          <div>
            <span>{question ? "Início do prazo" : "Gravação"}</span>
            <strong>
              {question ? "Após confirmação do pagamento" : recordingLabel}
            </strong>
          </div>
          <div>
            <span>Documentos</span>
            <strong>3 resumos lidos · versão da prévia 21/09/2026</strong>
          </div>
        </div>
        <fieldset className="payment-methods" aria-label="Forma de pagamento">
          {(
            [
              {
                id: "PIX",
                icon: QrCode,
                title: "Pix",
                text: "Código Pix no checkout",
              },
              {
                id: "CARD",
                icon: CreditCard,
                title: "Cartão de crédito",
                text: "Dados tratados pelo provedor de pagamento",
              },
              {
                id: "BOLETO",
                icon: Barcode,
                title: "Boleto",
                text: "Confirmação após compensação",
              },
            ] as const
          ).map(({ id, icon: Icon, title, text }) => (
            <button
              className={method === id ? "selected" : ""}
              key={id}
              onClick={() => setMethod(id)}
              aria-pressed={method === id}
            >
              <Icon size={24} />
              <span>
                <strong>{title}</strong>
                <small>{text}</small>
              </span>
              <span className="radio-mark">{method === id && <span />}</span>
            </button>
          ))}
        </fieldset>
        <div className="inline-info">
          <ShieldCheck size={18} />
          <p>
            Não solicitamos dados bancários nesta prévia. Nenhuma cobrança será
            feita. A confirmação de uma contratação real dependerá do provedor
            de pagamento.
          </p>
        </div>
        {method === "BOLETO" && !question && (
          <p className="pending-policy">
            A compensação pode ultrapassar a reserva temporária. Na operação
            real, um pagamento após a expiração exigirá reconciliação; não
            garante o mesmo horário.
          </p>
        )}
        <p className="payment-policy-note">
          Você pode solicitar cancelamento na sua área. O direito legal
          aplicável prevalece sobre retenções; os valores dependem da avaliação
          do caso.{" "}
          <Link
            href="/documentos/terms"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rever condições
          </Link>
          .
        </p>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="wizard-actions">
          <button className="product-button secondary" onClick={() => next(3)}>
            <ArrowLeft size={16} />
            Revisar
          </button>
          <button className="product-button" onClick={createPayment}>
            Iniciar pagamento de teste <ArrowRight size={16} />
          </button>
        </div>
      </>
    );
  }

  function renderResultStep() {
    return (
      <div className="payment-result">
        {renderPaymentOutcome()}
        {current && (
          <p className="modal-footnote">
            {current.id} · criado em {prettyTimestamp(current.createdAt)}
          </p>
        )}
      </div>
    );
  }
  return (
    <main className="booking-page">
      <header className="booking-header">
        <Link href="/">
          <Image
            src="/assets/Group 289458.png"
            width={116}
            height={56}
            alt="O Tal do Marmoteiro"
          />
        </Link>
        <span>
          <ShieldCheck size={16} /> Seu momento começa aqui
        </span>
        <Link href={profile ? "/minha-conta" : "/login"}>
          {profile ? "Minha conta" : "Já tenho conta"}
          <ArrowRight size={15} />
        </Link>
      </header>
      <div className="booking-page-inner">
        <Link className="back-link" href={profile ? "/minha-conta" : "/"}>
          <ArrowLeft size={15} />
          {profile ? "Voltar para minha área" : "Voltar para o site"}
        </Link>
        <div className="booking-title">
          <span className="portal-eyebrow">
            UM MOMENTO PARA NOVAS PERSPECTIVAS
          </span>
          <h1>{journeyTitle(step, question, paid, current?.orderStatus)}</h1>
          <p>
            Com escuta, clareza e aquele axé. Escolha como prefere conversar.
          </p>
        </div>
        <div className="demo-banner compact">
          <Sparkles size={16} />
          <span>
            Prévia interativa · conta, preços, agenda e pagamentos de exemplo.
            Use dados fictícios.
          </span>
        </div>
        {step < 5 && (
          <ol className="wizard-progress">
            {steps.map((label, i) => (
              <li
                key={label}
                aria-current={step === i + 1 ? "step" : undefined}
                className={progressClass(step, i)}
              >
                <span>{step > i + 1 ? <Check size={15} /> : i + 1}</span>
                {label}
              </li>
            ))}
          </ol>
        )}
        <div className="booking-columns">
          <section className="wizard-panel portal-card">
            {step === 1 && renderAccessStep()}
            {step === 2 && renderDocumentsStep()}
            {step === 3 && renderServiceStep()}
            {step === 4 && renderReviewStep()}
            {step === 5 && renderResultStep()}
          </section>
          <aside className="booking-summary portal-card">
            <div className="summary-art">
              <Image
                src="/assets/marmoteiro-baralho.png"
                width={400}
                height={240}
                alt="Baralho e velas para a consulta"
              />
            </div>
            <div className="summary-body">
              <span className="portal-eyebrow">SEU PRÓXIMO PASSO</span>
              <h2>
                {question ? "Pergunta avulsa" : "Consulta de Baralho Cigano"}
              </h2>
              <p>Um novo olhar para os caminhos que se abrem.</p>
              <div className="summary-details">
                <span>
                  <Clock3 size={16} />
                  {question
                    ? "Até 48 horas úteis após pagamento"
                    : "30 minutos de conversa"}
                </span>
                <span>
                  {question ? <MessageCircle size={16} /> : <Video size={16} />}
                  {question ? "Resposta pelo WhatsApp" : "Online e individual"}
                </span>
                {date && !question && (
                  <span>
                    <CalendarDays size={16} />
                    {prettyDate(date, true)}
                    {time && ` · ${time}`}
                  </span>
                )}
              </div>
              {question && (
                <div className="summary-price-lines">
                  <span>
                    Pergunta{" "}
                    <strong>{money(previewConfig.question.amount)}</strong>
                  </span>
                  <span>
                    Prioridade{" "}
                    <strong>
                      {money(
                        priority ? previewConfig.question.priorityAmount : 0,
                      )}
                    </strong>
                  </span>
                </div>
              )}
              <div className="summary-total">
                <span>Total de exemplo</span>
                <strong>{money(current?.amount ?? amount)}</strong>
              </div>
              <p className="summary-trust">
                <ShieldCheck size={15} />
                Sem cobrança nesta demonstração
              </p>
            </div>
            <div className="summary-support">
              <Info size={17} />
              <p>
                Precisa conversar?{" "}
                <a href="mailto:falecom@marmoteiro.com">
                  falecom@marmoteiro.com
                </a>
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
