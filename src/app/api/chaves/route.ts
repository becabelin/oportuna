import type { NextRequest } from "next/server";

import { clienteIp, gateAdmin } from "@/lib/admin-auth";
import { checarPedidoPorIp, emitirChave, listarChaves } from "@/lib/chaves";
import { apiError, json, optionsResponse, requireJson } from "@/lib/http";
import { LIMITES_API, LIMITES_IP, LIMITES_PEDIDO_CHAVE } from "@/lib/limites-api";
import { checarJanela, headersLimite } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_NOME = 80;
const MAX_EMAIL = 120;
const MAX_PROJETO = 400;

export function OPTIONS() {
  return optionsResponse("chaves");
}

function asText(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

export async function GET(request: NextRequest) {
  const gate = await gateAdmin(request);
  if (gate instanceof Response) return gate;
  return json({ data: await listarChaves() }, { cors: "none" });
}

export async function POST(request: NextRequest) {
  const ip = clienteIp(request);
  const burst = await checarJanela("pedido-chave", ip, LIMITES_PEDIDO_CHAVE);
  if (!burst.ok) {
    return apiError(
      429,
      "rate_limited",
      burst.motivo === "minuto"
        ? "Muitos pedidos de chave neste minuto. Espere um pouco."
        : "Já emitimos várias chaves neste endereço hoje. Tente amanhã.",
      undefined,
      { cors: "chaves", headers: headersLimite(burst) }
    );
  }
  const hora = await checarPedidoPorIp(ip);
  if (!hora.ok) {
    return apiError(
      429,
      "rate_limited",
      "Já pedimos várias chaves deste IP nesta hora. Tente mais tarde.",
      undefined,
      { cors: "chaves", headers: { "Retry-After": String(hora.retryAfterSec) } }
    );
  }

  const media = requireJson(request);
  if (media) return media;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "invalid_json", "Envie um JSON com nome, email e projeto.");
  }

  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : {};
  const nome = asText(payload.nome, MAX_NOME);
  const email = asText(payload.email, MAX_EMAIL);
  const projeto = asText(payload.projeto, MAX_PROJETO);

  const details: Record<string, string> = {};
  if (nome.length < 2) details.nome = "Diga como te chamamos.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) details.email = "Email inválido.";
  if (projeto.length < 4) details.projeto = "Conte em uma frase o que você vai construir.";
  if (Object.keys(details).length > 0) {
    return apiError(422, "validation_error", "Revise o pedido da chave.", details);
  }

  const chave = await emitirChave({ nome, email, projeto });
  return json(
    {
      data: {
        chave: chave.chave,
        prefixo: chave.prefixo,
        nome: chave.nome,
        email: chave.email,
        projeto: chave.projeto,
        limites: LIMITES_API,
        limitesIp: LIMITES_IP,
        comoUsar: {
          header: `Authorization: Bearer ${chave.chave}`,
          exemplo: `curl -H "Authorization: Bearer ${chave.chave}" \\\n  "https://SEU_HOST/api/oportunidades?status=abertas&limit=todas"`,
        },
      },
    },
    { status: 201, cors: "chaves" }
  );
}
