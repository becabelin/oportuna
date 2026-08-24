import type { NextRequest } from "next/server";

import { gateAdmin } from "@/lib/admin-auth";
import { adicionarEColetar } from "@/lib/coleta";
import { listFontes } from "@/lib/fontes";
import { apiError, json, optionsResponse, requireJson } from "@/lib/http";
import { assertPublicHttpUrl } from "@/lib/ssrf";
import { isTipo } from "@/lib/validate";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse("none");
}

export async function GET(request: NextRequest) {
  const gate = await gateAdmin(request);
  if (gate instanceof Response) return gate;
  return json({ data: listFontes() }, { cors: "none" });
}

export async function POST(request: NextRequest) {
  const gate = await gateAdmin(request);
  if (gate instanceof Response) return gate;

  const media = requireJson(request);
  if (media) return media;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "invalid_json", "O corpo da requisição precisa ser JSON.");
  }

  if (!body || typeof body !== "object") {
    return apiError(400, "invalid_json", "Envie um objeto JSON.");
  }

  const url = "url" in body ? String((body as { url?: unknown }).url ?? "").trim() : "";
  const tipoRaw =
    "tipo" in body ? (body as { tipo?: unknown }).tipo : undefined;

  try {
    await assertPublicHttpUrl(url);
  } catch (error) {
    return apiError(
      422,
      "validation_error",
      error instanceof Error ? error.message : "URL inválida.",
      { url: "Informe uma URL http(s) pública." }
    );
  }

  const tipo = isTipo(tipoRaw) ? tipoRaw : null;
  const resultado = await adicionarEColetar(url, tipo);
  return json(
    {
      data: resultado.fonte,
      oportunidades: resultado.oportunidades,
      erro: resultado.erro ?? null,
    },
    { status: 201, cors: "none" }
  );
}
