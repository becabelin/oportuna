import type { NextRequest } from "next/server";

import { checarPedidoPorIp, emitirChave } from "@/lib/chaves";
import { LIMITES_API } from "@/lib/limites-api";
import { apiError, json, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  if (!checarPedidoPorIp(ip)) {
    return apiError(429, "rate_limited", "Já pedimos várias chaves deste IP nesta hora. Tente mais tarde.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Envie um JSON com nome, email e projeto.");
  }

  const payload = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const nome = asText(payload.nome);
  const email = asText(payload.email);
  const projeto = asText(payload.projeto);

  const details: Record<string, string> = {};
  if (nome.length < 2) details.nome = "Diga como te chamamos.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) details.email = "Email inválido.";
  if (projeto.length < 4) details.projeto = "Conte em uma frase o que você vai construir.";
  if (Object.keys(details).length > 0) {
    return apiError(422, "validation_error", "Revise o pedido da chave.", details);
  }

  const chave = emitirChave({ nome, email, projeto });
  return json(
    {
      data: {
        chave: chave.chave,
        nome: chave.nome,
        email: chave.email,
        projeto: chave.projeto,
        limites: LIMITES_API,
        comoUsar: {
          header: `Authorization: Bearer ${chave.chave}`,
          exemplo: `curl -H "Authorization: Bearer ${chave.chave}" "https://SEU_HOST/api/oportunidades?status=abertas"`,
        },
      },
    },
    { status: 201 }
  );
}
