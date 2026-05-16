import { PrismaClient } from "@prisma/client";

import { hasDatabaseUrl } from "@/lib/env";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export function getPrisma() {
  if (!hasDatabaseUrl()) {
    throw new Error("DATABASE_URL nao configurada.");
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }

  return globalForPrisma.prisma;
}
