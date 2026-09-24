import { BookingWizard } from "@/components/portal/BookingWizard";
export default async function Page({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ modalidade?: string; retomar?: string }>;
}>) {
  const query = await searchParams;
  return (
    <BookingWizard
      initialModality={
        query.modalidade === "pergunta" ? "QUESTION" : "APPOINTMENT"
      }
      resumeId={typeof query.retomar === "string" ? query.retomar : undefined}
    />
  );
}
