"use client";
import { useDemo } from "./DemoProvider";
import { overlapsBlock } from "@/lib/preview-events";
import { previewConfig } from "@/lib/preview-config";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import {
  appointmentTimestamp,
  localDate,
  type DemoBooking,
} from "@/lib/demo-bookings";
export function BookingCalendar({
  date,
  time,
  onDate,
  onTime,
  bookings = [],
  except,
}: Readonly<{
  date: string;
  time: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
  bookings?: DemoBooking[];
  except?: string;
}>) {
  const { now, busyBlocks } = useDemo();
  const today = localDate();
  const initial = new Date((date || today) + "T12:00:00-03:00");
  const [month, setMonth] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1),
  );
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const currentMonth = new Date(today + "T12:00:00-03:00");
  currentMonth.setDate(1);
  const slots = previewConfig.calendar.slots;
  function iso(day: number) {
    return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return (
    <div className="calendar-layout">
      <div className="booking-calendar">
        <div className="calendar-month">
          <h3>
            {month.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <div>
            <button
              aria-label="Mês anterior"
              disabled={month <= currentMonth}
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Próximo mês"
              disabled={
                month.getTime() > currentMonth.getTime() + 45 * 86400000
              }
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="calendar-grid">
          {["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"].map((d) => (
            <span className="calendar-weekday" key={d}>
              {d}
            </span>
          ))}
          {Array.from({ length: offset }, (_, i) => (
            <span key={`empty-${i}`} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const value = iso(i + 1);
            return (
              <button
                type="button"
                key={value}
                aria-label={new Date(value + "T12:00:00").toLocaleDateString(
                  "pt-BR",
                  { dateStyle: "full" },
                )}
                aria-pressed={date === value}
                disabled={value < today}
                className={`${date === value ? "selected" : ""} ${value === today ? "today" : ""}`}
                onClick={() => {
                  onDate(value);
                  onTime("");
                }}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <p className="calendar-footnote">
          <span />
          Agenda demonstrativa · horário de Brasília
        </p>
      </div>
      <div className="time-picker">
        <h3>
          <Clock3 size={16} /> Horários disponíveis
        </h3>
        {date ? (
          <>
            <p>
              {new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </p>
            <div className="time-grid">
              {slots.map((slot) => {
                const occupied =
                  overlapsBlock(busyBlocks, date, slot, 30, except) ||
                  bookings.some(
                    (b) =>
                      b.id !== except &&
                      b.modality === "APPOINTMENT" &&
                      b.date === date &&
                      b.time === slot &&
                      (b.status === "BOOKED" ||
                        b.orderStatus === "CANCELLATION_REQUESTED" ||
                        (b.orderStatus === "AWAITING_PAYMENT" &&
                          new Date(b.lockExpiresAt || 0).getTime() > now)),
                  );
                return (
                  <button
                    type="button"
                    key={slot}
                    aria-pressed={time === slot}
                    className={time === slot ? "selected" : ""}
                    disabled={
                      occupied || appointmentTimestamp(date, slot) <= now
                    }
                    onClick={() => onTime(slot)}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <p className="calendar-empty">
            Escolha um dia no calendário para ver os horários.
          </p>
        )}
      </div>
    </div>
  );
}
