import { z } from "zod";

const optionalEnvSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  ENABLE_RUNTIME_DB_SETUP: z.string().optional(),
  INFINITEPAY_HANDLE: z.string().min(1).optional(),
  INFINITEPAY_API_BASE_URL: z
    .string()
    .url()
    .default("https://api.checkout.infinitepay.io"),
  INFINITEPAY_WEBHOOK_SECRET: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export function getOptionalServerEnv() {
  return optionalEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    ENABLE_RUNTIME_DB_SETUP: process.env.ENABLE_RUNTIME_DB_SETUP,
    INFINITEPAY_HANDLE: process.env.INFINITEPAY_HANDLE,
    INFINITEPAY_API_BASE_URL: process.env.INFINITEPAY_API_BASE_URL,
    INFINITEPAY_WEBHOOK_SECRET: process.env.INFINITEPAY_WEBHOOK_SECRET,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function shouldRunRuntimeDbSetup() {
  const flag = process.env.ENABLE_RUNTIME_DB_SETUP?.trim().toLowerCase();

  if (flag === "true") return true;
  if (flag === "false") return false;

  return process.env.NODE_ENV !== "production";
}

export function getServerEnv() {
  const env = getOptionalServerEnv();

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL nao configurada.");
  }

  if (!env.INFINITEPAY_HANDLE) {
    throw new Error("INFINITEPAY_HANDLE nao configurada.");
  }

  return {
    ...env,
    DATABASE_URL: env.DATABASE_URL,
    INFINITEPAY_HANDLE: env.INFINITEPAY_HANDLE,
  };
}

export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
