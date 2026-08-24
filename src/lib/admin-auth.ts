import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { apiError } from "./http";
import { LIMITES_ADMIN_LOGIN } from "./limites-api";
import {
  checarJanela,
  consultarJanela,
  headersLimite,
  type ResultadoLimite,
} from "./rate-limit";

export const COOKIE_ADMIN = "trilha_admin";
export const ADMIN_REALM = "Trilha da Oportunidade";
const COOKIE_TTL_MS = 60 * 60 * 24 * 1000;

type HeaderLike = { get(name: string): string | null };

function envFirst(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  return null;
}

function secretsIguais(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function adminSecret() {
  return envFirst("TRILHA_ADMIN_SECRET", "TRILHA_ADMIN_SECRET", "ADMIN_SECRET");
}

export function cronSecret() {
  return envFirst("CRON_SECRET", "CRON_SECRET");
}

export function producaoFechada() {
  return process.env.NODE_ENV === "production";
}

export function cookieAdminAssinado(secret: string, now = Date.now()) {
  const exp = String(now + COOKIE_TTL_MS);
  const sig = createHmac("sha256", secret).update(`v2:${exp}`).digest("base64url");
  return `${exp}.${sig}`;
}

export function cookieAdminValido(value: string | null | undefined, secret: string) {
  if (!value) return false;
  const dot = value.lastIndexOf(".");
  if (dot < 1) return false;
  const exp = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = createHmac("sha256", secret).update(`v2:${exp}`).digest("base64url");
  if (!secretsIguais(sig, expected)) return false;
  const expMs = Number(exp);
  return Number.isFinite(expMs) && expMs >= Date.now();
}

function bearerToken(headers: HeaderLike) {
  const header = headers.get("authorization");
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  return header.slice(7).trim() || null;
}

function senhaBasic(headers: HeaderLike) {
  const header = headers.get("authorization");
  if (!header?.toLowerCase().startsWith("basic ")) return null;
  try {
    const decoded = Buffer.from(header.slice(6).trim(), "base64").toString("utf8");
    const idx = decoded.indexOf(":");
    if (idx < 0) return null;
    return decoded.slice(idx + 1);
  } catch {
    return null;
  }
}

function cookieDoPedido(request: NextRequest) {
  return request.cookies.get(COOKIE_ADMIN)?.value ?? null;
}

export function temCredencialAdmin(
  headers: HeaderLike,
  cookie?: string | null
) {
  const secret = adminSecret();
  if (!secret) return false;

  const candidatos = [
    bearerToken(headers),
    senhaBasic(headers),
    headers.get("x-admin-secret")?.trim() || null,
  ].filter((item): item is string => Boolean(item));

  if (candidatos.some((item) => secretsIguais(item, secret))) return true;
  return cookieAdminValido(cookie, secret);
}

export function temCredencialCron(headers: HeaderLike) {
  const secret = cronSecret();
  const token = bearerToken(headers);
  if (!secret || !token) return false;
  return secretsIguais(token, secret);
}

export function clienteIp(request: { headers: HeaderLike }) {
  const vercel = request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return "local";
}

function recusarAdmin() {
  return apiError(401, "unauthorized", "Esta ação é restrita.", undefined, { cors: "none" });
}

function recusarAdminBloqueado(limite: Extract<ResultadoLimite, { ok: false }>) {
  return apiError(
    429,
    "rate_limited",
    "Muitas tentativas neste endereço. Espere um pouco e tente de novo.",
    undefined,
    { cors: "none", headers: headersLimite(limite) }
  );
}

export async function gateAdmin(request: NextRequest): Promise<Response | { ok: true }> {
  const ip = clienteIp(request);
  const peek = await consultarJanela("admin-fail", ip, LIMITES_ADMIN_LOGIN);
  if (!peek.ok) return recusarAdminBloqueado(peek);

  if (temCredencialAdmin(request.headers, cookieDoPedido(request))) {
    return { ok: true };
  }
  if (!adminSecret() && !producaoFechada()) {
    return { ok: true };
  }

  const after = await checarJanela("admin-fail", ip, LIMITES_ADMIN_LOGIN);
  if (!after.ok) return recusarAdminBloqueado(after);
  return recusarAdmin();
}

export async function gateCronOuAdmin(request: NextRequest): Promise<Response | { ok: true }> {
  if (temCredencialCron(request.headers)) {
    return { ok: true };
  }
  return gateAdmin(request);
}

export function aplicarCookieAdmin(response: NextResponse, request: NextRequest) {
  const secret = adminSecret();
  if (!secret) return;
  response.cookies.set(COOKIE_ADMIN, cookieAdminAssinado(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}
