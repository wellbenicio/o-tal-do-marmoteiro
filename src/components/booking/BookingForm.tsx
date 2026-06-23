"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRightCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Section } from "@/components/ui/Section";
import { formatCurrency, toDateInputValue } from "@/lib/format";
import { DateSelector } from "./DateSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";

type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
};

export function BookingForm() {
  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(toDateInputValue());
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const selectedService = useMemo(
    () => services.find((service) => service.id === serviceId),
    [serviceId, services]
  );

  useEffect(() => {
    fetch("/api/services")
      .then((response) => response.json())
      .then((data) => {
        const fetchedServices = data.services ?? [];
        setServices(fetchedServices);
        setServiceId(fetchedServices[0]?.id ?? "");
      })
      .catch(() => {
        setMessage("Não foi possível carregar os serviços.");
      });
  }, []);

  useEffect(() => {
    if (!serviceId || !date) {
      return;
    }

    setLoadingSlots(true);
    setSelectedSlot("");
    fetch(`/api/availability?serviceId=${encodeURIComponent(serviceId)}&date=${date}`)
      .then((response) => response.json())
      .then((data) => {
        setSlots(data.slots ?? []);
      })
      .catch(() => {
        setSlots([]);
        setMessage("Não foi possível carregar os horários.");
      })
      .finally(() => {
        setLoadingSlots(false);
      });
  }, [date, serviceId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!selectedSlot) {
      setMessage("Escolha um horário disponível.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/bookings/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          serviceId,
          scheduledStart: selectedSlot,
          customer: form
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível iniciar o pagamento.");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao iniciar pagamento.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Section id="agendamento" className="py-16">
      <div className="grid overflow-hidden rounded-2xl bg-[#1a0716] shadow-soft sm:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-[430px] overflow-hidden">
          <Image
            fill
            alt=""
            className="object-cover"
            src="/assets/figma/booking-photo.png"
            sizes="(max-width: 860px) 100vw, 430px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a0716] via-[#1a0716]/25 to-transparent" />
        </div>

        <form className="space-y-4 p-6 sm:p-8" onSubmit={handleSubmit}>
          <Image
            alt="O Tal do Marmoteiro"
            className="mb-4 h-auto w-28"
            height={73}
            src="/assets/figma/logo.png"
            width={160}
          />

          {selectedService ? (
            <div className="rounded-md border border-white/10 bg-black/25 p-3">
              <p className="text-sm font-semibold text-white">{selectedService.name}</p>
              <p className="mt-1 text-xs text-white/55">
                {selectedService.durationMinutes} minutos ·{" "}
                {formatCurrency(selectedService.priceCents, selectedService.currency)}
              </p>
            </div>
          ) : null}

          <label className="space-y-2 text-xs font-medium text-white/75">
            Serviço
            <select
              className="min-h-10 w-full rounded-sm border border-white/25 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-marmoteiro-amber focus:ring-2 focus:ring-marmoteiro-amber/25"
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
            >
              {services.map((service) => (
                <option className="bg-black" key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <DateSelector value={date} onChange={setDate} />
            <div className="space-y-2 text-xs font-medium text-white/75">
              Horário
              <TimeSlotSelector
                loading={loadingSlots}
                selectedSlot={selectedSlot}
                slots={slots}
                onSelect={setSelectedSlot}
              />
            </div>
          </div>

          <label className="space-y-2 text-xs font-medium text-white/75">
            Nome
            <Input
              required
              autoComplete="name"
              placeholder="Digite seu nome"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label className="space-y-2 text-xs font-medium text-white/75">
            E-mail
            <Input
              required
              autoComplete="email"
              placeholder="Digite seu e-mail"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label className="space-y-2 text-xs font-medium text-white/75">
            WhatsApp
            <Input
              required
              autoComplete="tel"
              placeholder="(00) 00000-0000"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
            />
          </label>

          {message ? (
            <p className="rounded-md border border-marmoteiro-red/40 bg-marmoteiro-red/15 p-3 text-xs text-white">
              {message}
            </p>
          ) : null}

          <Button className="w-full rounded-sm" disabled={submitting || !serviceId} type="submit">
            {submitting ? <Loader2 className="animate-spin" size={16} /> : null}
            Enviar
          </Button>
          <p className="text-center text-xs text-white/50">
            Ou fale com a gente pelo <span className="text-marmoteiro-amber">nosso whatsapp</span>
            <ArrowRightCircle className="ml-1 inline" size={13} />
          </p>
        </form>
      </div>
    </Section>
  );
}
