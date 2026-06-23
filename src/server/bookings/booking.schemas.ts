import { z } from "zod";

export const availabilityQuerySchema = z.object({
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD.")
});

export const checkoutSchema = z.object({
  serviceId: z.string().min(1),
  scheduledStart: z.string().datetime(),
  customer: z.object({
    name: z.string().trim().min(2),
    email: z.string().trim().email(),
    phone: z.string().trim().min(8)
  })
});

export const publicTokenSchema = z.object({
  publicToken: z.string().min(1)
});
