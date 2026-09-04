import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// En desarrollo Next.js recarga los modulos en caliente y cada recarga crearia
// un cliente nuevo, agotando las conexiones de Postgres. Guardamos la instancia
// en el objeto global para reutilizarla.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function crearCliente() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  }
  // En produccion esta debe ser la connection string con pooler de Neon.
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
