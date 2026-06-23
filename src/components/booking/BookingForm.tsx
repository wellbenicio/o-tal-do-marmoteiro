"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
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
    <Section id="agendamento">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-marmoteiro-rose">
            Agendamento
          </p>
          <h2 className="mt-3 font-display text-4xl text-marmoteiro-ink">
            Escolha seu horário
          </h2>
          <p className="mt-4 leading-7 text-marmoteiro-ink/72">
            O horário fica reservado temporariamente enquanto você segue para o pagamento.
            A confirmação só acontece depois que o pagamento for aprovado.
          </p>
          {selectedService ? (
            <Card className="mt-6">
              <h3 className="text-lg font-semibold">{selectedService.name}</h3>
              <p className="mt-2 text-sm leading-6 text-marmoteiro-ink/68">
                {selectedService.description}
              </p>
              <p className="mt-4 text-2xl font-bold text-marmoteiro-wine">
                {formatCurrency(selectedService.priceCents, selectedService.currency)}
              </p>
            </Card>
          ) : null}
        </div>

        <Card>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="space-y-2 text-sm font-medium">
              Serviço
              <select
                className="min-h-11 w-full rounded-md border border-marmoteiro-wine/20 bg-white px-3 py-2 text-sm outline-none focus:border-marmoteiro-gold focus:ring-2 focus:ring-marmoteiro-gold/25"
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <DateSelector value={date} onChange={setDate} />

            <div className="space-y-2">
              <span className="text-sm font-medium">Horário</span>
              <TimeSlotSelector
                loading={loadingSlots}
                selectedSlot={selectedSlot}
                slots={slots}
                onSelect={setSelectedSlot}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium sm:col-span-2">
                Nome
                <Input
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                E-mail
                <Input
                  required
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </label>
              <label className="space-y-2 text-sm font-medium">
                WhatsApp
                <Input
                  required
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                />
              </label>
            </div>

            {message ? (
              <p className="rounded-md border border-marmoteiro-rose/30 bg-marmoteiro-rose/10 p-3 text-sm text-marmoteiro-wine">
                {message}
              </p>
            ) : null}

            <Button className="w-full" disabled={submitting || !serviceId} type="submit">
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <CalendarCheck size={18} />}
              Iniciar pagamento
            </Button>
          </form>
        </Card>
      </div>
    </Section>
  );
}
