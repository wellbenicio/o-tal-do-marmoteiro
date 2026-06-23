import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_TIMEZONE: z.literal("America/Sao_Paulo").default("America/Sao_Paulo"),
  BOOKING_SLOT_MINUTES: z.coerce.number().int().positive().default(30),
  BOOKING_LOCK_MINUTES: z.coerce.number().int().positive().default(15),
  BUSINESS_OPEN_HOUR: z.coerce.number().int().min(0).max(23).default(9),
  BUSINESS_CLOSE_HOUR: z.coerce.number().int().min(1).max(24).default(18),
  ENABLE_MOCK_PAYMENTS: z
    .enum(["true", "false"])
    .default(process.env.NODE_ENV === "production" ? "false" : "true"),
  MERCADO_PAGO_ACCESS_TOKEN: z.string().optional().default(""),
  MERCADO_PAGO_WEBHOOK_SECRET: z.string().optional().default(""),
  GOOGLE_CALENDAR_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_REFRESH_TOKEN: z.string().optional().default("")
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }

  return cachedEnv;
}
