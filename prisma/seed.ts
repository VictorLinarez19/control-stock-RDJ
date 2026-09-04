import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const CATEGORIAS = [
  "Rodamientos",
  "Bieletas",
  "Anillos",
  "Filtros",
  "Pastillas de freno",
  "Correas",
  "Bujias",
  "Amortiguadores",
];

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta DATABASE_URL (o DIRECT_URL) para correr el seed");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  for (const nombre of CATEGORIAS) {
    // upsert para que el seed se pueda correr mas de una vez sin duplicar nada
    await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
  }

  const total = await prisma.categoria.count();
  console.log(`Categorias en la base: ${total}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
