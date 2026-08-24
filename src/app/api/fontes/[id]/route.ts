import type { NextRequest } from "next/server";

import { gateAdmin } from "@/lib/admin-auth";
import { removerFonte } from "@/lib/coleta";
import { getFonte } from "@/lib/fontes";
import { apiError, emptyResponse, json, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return optionsResponse("none");
}

export async function GET(request: NextRequest, context: RouteParams) {
  const gate = await gateAdmin(request);
  if (gate instanceof Response) return gate;
  const { id } = await context.params;
  const fonte = getFonte(id);
  if (!fonte) return apiError(404, "not_found", "Fonte não encontrada.");
  return json({ data: fonte }, { cors: "none" });
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const gate = await gateAdmin(request);
  if (gate instanceof Response) return gate;
  const { id } = await context.params;
  const fonte = getFonte(id);
  if (!fonte) return apiError(404, "not_found", "Fonte não encontrada.");
  removerFonte(id);
  return emptyResponse(204);
}
