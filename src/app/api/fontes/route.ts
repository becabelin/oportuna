import type { NextRequest } from "next/server";

import { adicionarEColetar } from "@/lib/coleta";
import { isTipo } from "@/lib/validate";
import { listFontes } from "@/lib/fontes";
import { apiError, json, optionsResponse } from "@/lib/http";
import { assertPublicHttpUrl } from "@/lib/ssrf";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  return json({ data: listFontes() });
}

export async function POST(request: NextRequest) {
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
    { status: 201 }
  );
}
