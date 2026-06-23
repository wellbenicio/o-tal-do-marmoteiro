import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.service.upsert({
    where: {
      id: "svc_cartomancia_30"
    },
    update: {
      name: "Jogo de Cartomancia — 30 minutos",
      description:
        "Consulta online com Baralho Cigano para direcionamento, clareza e reflexão espiritual/intuitiva.",
      durationMinutes: 30,
      priceCents: 7000,
      currency: "BRL",
      active: true
    },
    create: {
      id: "svc_cartomancia_30",
      name: "Jogo de Cartomancia — 30 minutos",
      description:
        "Consulta online com Baralho Cigano para direcionamento, clareza e reflexão espiritual/intuitiva.",
      durationMinutes: 30,
      priceCents: 7000,
      currency: "BRL",
      active: true
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
