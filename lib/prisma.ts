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

function isDatabaseConnectionError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const errorWithCode = error as { code?: unknown; message?: unknown };
  const message =
    typeof errorWithCode.message === "string" ? errorWithCode.message : "";

  return (
    errorWithCode.code === "P1001" ||
    message.includes("Can't reach database server") ||
    message.includes("Can't reach database")
  );
}

export async function withPrismaRetry<T>(
  operation: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
) {
  const attempts = options.attempts ?? 3;
  const delayMs = options.delayMs ?? 350;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= attempts || !isDatabaseConnectionError(error)) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }

  return operation();
}
