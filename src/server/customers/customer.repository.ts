import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function upsertCustomerByEmail(
  email: string,
  data: Pick<Prisma.CustomerCreateInput, "name" | "phone">
) {
  return prisma.customer.upsert({
    where: { email },
    update: data,
    create: {
      email,
      ...data
    }
  });
}
