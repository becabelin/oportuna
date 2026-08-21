import type { NextRequest } from "next/server";

import { removerFonte } from "@/lib/coleta";
import { getFonte } from "@/lib/fontes";
import { apiError, CORS_HEADERS, json, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(_request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const fonte = getFonte(id);
  if (!fonte) return apiError(404, "not_found", "Fonte não encontrada.");
  return json({ data: fonte });
}

export async function DELETE(_request: NextRequest, context: RouteParams) {
  const { id } = await context.params;
  const fonte = getFonte(id);
  if (!fonte) return apiError(404, "not_found", "Fonte não encontrada.");
  removerFonte(id);
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
