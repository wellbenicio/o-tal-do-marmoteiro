import { getEnv } from "@/lib/env";

export async function createMockCheckoutPreference(input: { publicToken: string }) {
  const env = getEnv();
  const params = new URLSearchParams({ booking: input.publicToken });

  return {
    gatewayPreferenceId: `mock_${input.publicToken}`,
    checkoutUrl: `${env.APP_URL}/pagamento/mock?${params.toString()}`
  };
}
