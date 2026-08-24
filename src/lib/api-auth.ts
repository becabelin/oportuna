import type { NextRequest } from "next/server";

import { clienteIp } from "./admin-auth";
import { checarLimite, encontrarChave, registrarUso, type ChaveRegistro } from "./chaves";
import { apiError } from "./http";
import { LIMITES_IP } from "./limites-api";
import {
  checarJanela,
  headersLimite,
  type ResultadoLimite,
} from "./rate-limit";

function hostOf(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export function isSameOrigin(request: NextRequest) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "same-origin") return true;

  const host = request.headers.get("host");
  if (!host) return false;
  const origin = request.headers.get("origin");
  if (origin && hostOf(origin) === host) return true;
  const referer = request.headers.get("referer");
  if (
    referer &&
    hostOf(referer) === host &&
    secFetchSite !== "none" &&
    secFetchSite !== "cross-site"
  ) {
    return true;
  }
  return false;
}

export function extractApiKey(request: NextRequest) {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return request.headers.get("x-api-key")?.trim() || null;
}

function recusarLimite(
  limite: Extract<ResultadoLimite, { ok: false }>,
  mensagemMinuto: string,
  mensagemDia: string,
  cors?: "public" | "chaves"
) {
  return apiError(
    429,
    "rate_limited",
    limite.motivo === "minuto" ? mensagemMinuto : mensagemDia,
    undefined,
    { cors, headers: headersLimite(limite) }
  );
}

export async function gateIpPublico(
  request: NextRequest
): Promise<Response | { headers: Record<string, string> }> {
  const limite = await checarJanela("ip", clienteIp(request), LIMITES_IP);
  if (!limite.ok) {
    return recusarLimite(
      limite,
      `Limite de ${limite.limite} consultas por minuto neste endereço. Espere um pouco.`,
      `Limite de ${limite.limite} consultas por dia neste endereço.`
    );
  }
  return { headers: headersLimite(limite) };
}

export async function gatePublicApi(
  request: NextRequest
): Promise<Response | { chave: ChaveRegistro | "site"; headers: HeadersInit }> {
  const ipGate = await gateIpPublico(request);
  if (ipGate instanceof Response) return ipGate;

  if (isSameOrigin(request)) {
    return { chave: "site", headers: ipGate.headers };
  }

  const raw = extractApiKey(request);
  if (!raw) {
    return apiError(
      401,
      "missing_api_key",
      "Esta rota precisa de uma chave. Peça em /chave e envie Authorization: Bearer opt_… ou X-Api-Key.",
      undefined,
      { headers: ipGate.headers }
    );
  }

  const found = await encontrarChave(raw);
  if (!found || found.status !== "ativa") {
    return apiError(
      401,
      "invalid_api_key",
      "Chave inválida ou revogada. Peça outra em /chave.",
      undefined,
      { headers: ipGate.headers }
    );
  }

  const limite = await checarLimite(found.id);
  if (!limite.ok) {
    return recusarLimite(
      limite,
      `Limite de ${limite.limite} consultas por minuto nesta chave. Espere um pouco.`,
      `Limite de ${limite.limite} consultas por dia nesta chave.`
    );
  }

  await registrarUso(found.id);
  return {
    chave: found,
    headers: headersLimite(limite),
  };
}
