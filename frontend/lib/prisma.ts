import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function getDatabaseUrl() {
  return (
    process.env.DATABASE_URL
    || process.env.POSTGRES_PRISMA_URL
    || process.env.POSTGRES_URL
    || ""
  );
}

function createPrismaClient() {
  const connectionString = getDatabaseUrl();

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL, POSTGRES_PRISMA_URL, or POSTGRES_URL is not configured. Add one before using persistence."
    );
  }

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({ adapter });
}

export function getPrisma() {
  const prisma =
    globalForPrisma.prisma ?? createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }

  return prisma;
}
