import type { NextRequest } from "next/server";

import { coletarFonte } from "@/lib/coleta";
import { getFonte } from "@/lib/fontes";
import { apiError, json, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return optionsResponse();
}

export async function POST(_request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  if (!getFonte(id)) {
    return apiError(404, "not_found", "Fonte não encontrada.");
  }
  const resultado = await coletarFonte(id);
  return json({
    data: resultado.fonte,
    oportunidades: resultado.oportunidades,
    erro: resultado.erro ?? null,
  });
}
