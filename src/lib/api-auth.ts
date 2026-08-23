import type { NextRequest } from "next/server";

import { checarLimite, encontrarChave, registrarUso, type ChaveApi } from "./chaves";
import { apiError } from "./http";

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

export function gatePublicApi(
  request: NextRequest
): Response | { chave: ChaveApi | "site"; headers: HeadersInit } {
  if (isSameOrigin(request)) {
    return { chave: "site", headers: {} };
  }

  const raw = extractApiKey(request);
  if (!raw) {
    return apiError(
      401,
      "missing_api_key",
      "Esta rota precisa de uma chave. Peça em /chave e envie Authorization: Bearer opt_… ou X-Api-Key."
    );
  }

  const found = encontrarChave(raw);
  if (!found || found.status !== "ativa") {
    return apiError(401, "invalid_api_key", "Chave inválida ou revogada. Peça outra em /chave.");
  }

  const limite = checarLimite(found.id);
  if (!limite.ok) {
    return apiError(
      429,
      "rate_limited",
      limite.motivo === "minuto"
        ? `Limite de ${limite.limite} consultas por minuto. Espere um pouco.`
        : `Limite de ${limite.limite} consultas por dia nesta chave.`
    );
  }

  registrarUso(found.chave);
  return {
    chave: found,
    headers: {
      "X-RateLimit-Limit": String(limite.limiteMinuto),
      "X-RateLimit-Remaining": String(limite.restanteMinuto),
      "X-RateLimit-Limit-Day": String(limite.limiteDia),
      "X-RateLimit-Remaining-Day": String(limite.restanteDia),
    },
  };
}

