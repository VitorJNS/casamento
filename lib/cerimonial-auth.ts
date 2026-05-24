import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const CERIMONIAL_COOKIE_NAME = "casamento_cerimonial_session";

function getCerimonialEnv() {
  const password = process.env.CERIMONIAL_PASSWORD;
  const secret = process.env.CERIMONIAL_SESSION_SECRET;

  if (!password) {
    throw new Error("CERIMONIAL_PASSWORD nao configurada.");
  }

  if (!secret) {
    throw new Error("CERIMONIAL_SESSION_SECRET nao configurada.");
  }

  return { password, secret };
}

function signValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function buildSessionValue(secret: string) {
  const base = "cerimonial-authenticated";
  return `${base}.${signValue(base, secret)}`;
}

export function validateCerimonialPassword(password: string) {
  return password.trim() === getCerimonialEnv().password.trim();
}

export async function createCerimonialSession() {
  const store = await cookies();
  const { secret } = getCerimonialEnv();

  store.set(CERIMONIAL_COOKIE_NAME, buildSessionValue(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearCerimonialSession() {
  const store = await cookies();
  store.delete(CERIMONIAL_COOKIE_NAME);
}

export async function isCerimonialAuthenticated() {
  const store = await cookies();
  const cookieValue = store.get(CERIMONIAL_COOKIE_NAME)?.value;

  if (!cookieValue) return false;

  const { secret } = getCerimonialEnv();
  const expected = buildSessionValue(secret);
  const provided = Buffer.from(cookieValue);
  const target = Buffer.from(expected);

  if (provided.length !== target.length) return false;

  return timingSafeEqual(provided, target);
}

export async function requireCerimonialAuth() {
  const authenticated = await isCerimonialAuthenticated();

  if (!authenticated) {
    redirect("/cerimonial");
  }
}
