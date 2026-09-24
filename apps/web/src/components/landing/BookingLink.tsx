import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function BookingLink() {
  return (
    <Link className="booking-link" href="/agendar">
      Ver horários disponíveis <ArrowUpRight size={19} aria-hidden="true" />
    </Link>
  );
}
