import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingStatusCard } from "@/components/booking/BookingStatusCard";
import { buttonClassName } from "@/components/ui/Button";
import { getPublicBooking } from "@/server/bookings/booking.service";

export const dynamic = "force-dynamic";

export default async function BookingStatusPage({
  params
}: {
  params: Promise<{ publicToken: string }>;
}) {
  const { publicToken } = await params;
  const booking = await getPublicBooking(publicToken).catch(() => null);

  if (!booking) {
    notFound();
  }

  return (
    <main className="min-h-screen px-4 py-12">
      <BookingStatusCard booking={booking} />
      <div className="mx-auto mt-6 flex max-w-2xl justify-center">
        <Link className={buttonClassName("secondary")} href="/">
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
}
