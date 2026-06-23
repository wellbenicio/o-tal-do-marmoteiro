import { prisma } from "@/lib/prisma";

export function listActiveServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { createdAt: "asc" }
  });
}

export function findActiveServiceById(id: string) {
  return prisma.service.findFirst({
    where: {
      id,
      active: true
    }
  });
}
