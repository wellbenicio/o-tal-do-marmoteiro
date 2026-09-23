import type { RefundDecisionType } from "@marmoteiro/shared";
// Baseline §§13,15–20. Context is provided by trusted domain assessment in production.
// A screen must never decide that a legal right does not apply.
export type RefundContext = {
  modality: "APPOINTMENT" | "QUESTION";
  totalPaid: number;
  contractedAt: string;
  requestedAt: string;
  execution: string;
  startsAt?: number;
  withdrawal: "APPLICABLE" | "NOT_APPLICABLE" | "UNDETERMINED";
  providerResponsible?: boolean;
  exceptional?: boolean;
  noShowConfirmed?: boolean;
};
export type RefundResult = {
  decision: `${RefundDecisionType}`;
  amount: number | null;
  retained: number | null;
  reason: string;
};
export function decideRefund(context: RefundContext): RefundResult {
  const manual = (reason: string): RefundResult => ({
    decision: "MANUAL_REVIEW_REQUIRED",
    amount: null,
    retained: null,
    reason,
  });
  const refund = (percent: number, reason: string): RefundResult => {
    const amount = Math.round((context.totalPaid * percent) / 100);
    return {
      decision: percent === 100 ? "FULL_REFUND" : "PARTIAL_REFUND",
      amount,
      retained: context.totalPaid - amount,
      reason,
    };
  };
  if (context.totalPaid === 0)
    return {
      decision: "NO_REFUND",
      amount: 0,
      retained: 0,
      reason: "Sem pagamento aprovado; nenhuma cobrança a restituir.",
    };
  if (["DELIVERED", "COMPLETED"].includes(context.execution))
    return manual(
      "Atendimento já entregue/concluído: solicitação encaminhada para análise individual, sem negativa automática.",
    );
  if (context.withdrawal === "APPLICABLE")
    return refund(
      100,
      "Direito de arrependimento aplicável: restituição integral, incluindo prioridade quando contratada.",
    );
  if (context.providerResponsible)
    return refund(
      100,
      "Serviço não realizado por responsabilidade do prestador: restituição integral.",
    );
  if (context.exceptional)
    return manual(
      "Situação excepcional: exige decisão administrativa justificada.",
    );
  if (context.withdrawal === "UNDETERMINED")
    return manual(
      "O enquadramento legal precisa ser avaliado antes de aplicar qualquer retenção.",
    );
  if (context.modality === "APPOINTMENT" && context.noShowConfirmed)
    return refund(
      50,
      "No-show caracterizado, sem regra legal superior: retenção de 50% e restituição de 50%.",
    );
  const hours =
    context.startsAt === undefined
      ? Number.NaN
      : (context.startsAt - Date.parse(context.requestedAt)) / 3600000;
  if (context.modality === "APPOINTMENT" && hours >= 0 && hours < 24)
    return refund(
      70,
      "Cancelamento com menos de 24h, sem regra legal superior: retenção de 30% e restituição de 70%.",
    );
  return manual(
    "Análise do enquadramento contratual e legal; o baseline não define um percentual automático para este contexto.",
  );
}
