import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE_NAME = "casamento_admin_session";

function getAdminEnv() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!password) {
    throw new Error("ADMIN_PASSWORD nao configurada.");
  }

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET nao configurada.");
  }

  return { password, secret };
}

function signValue(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function buildSessionValue(secret: string) {
  const base = "admin-authenticated";
  return `${base}.${signValue(base, secret)}`;
}

export function validateAdminPassword(password: string) {
  return password === getAdminEnv().password;
}

export async function createAdminSession() {
  const store = await cookies();
  const { secret } = getAdminEnv();

  store.set(ADMIN_COOKIE_NAME, buildSessionValue(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const store = await cookies();
  const cookieValue = store.get(ADMIN_COOKIE_NAME)?.value;

  if (!cookieValue) return false;

  const { secret } = getAdminEnv();
  const expected = buildSessionValue(secret);

  const provided = Buffer.from(cookieValue);
  const target = Buffer.from(expected);

  if (provided.length !== target.length) return false;

  return timingSafeEqual(provided, target);
}

export async function requireAdminAuth() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    redirect("/admin");
  }
}
