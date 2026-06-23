import { Suspense } from "react";
import { MockPaymentClient } from "./payment-client";

export const dynamic = "force-dynamic";

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<main className="p-8">Carregando pagamento mockado...</main>}>
      <MockPaymentClient />
    </Suspense>
  );
}
