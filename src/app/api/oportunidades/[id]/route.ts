import type { NextRequest } from "next/server";

import { gateAdmin } from "@/lib/admin-auth";
import { gatePublicApi } from "@/lib/api-auth";
import { apiError, emptyResponse, json, optionsResponse, requireJson } from "@/lib/http";
import {
  deleteOportunidade,
  getOportunidade,
  updateOportunidade,
} from "@/lib/store";
import { validateOportunidade } from "@/lib/validate";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return optionsResponse("public");
}

export async function GET(request: NextRequest, context: RouteParams) {
  const gate = await gatePublicApi(request);
  if (gate instanceof Response) return gate;
  const { id } = await context.params;
  const item = getOportunidade(id);
  if (!item) {
    return apiError(404, "not_found", "Oportunidade não encontrada.");
  }
  return json({ data: item }, { headers: gate.headers });
}

export async function PATCH(request: NextRequest, context: RouteParams) {
  const gate = await gateAdmin(request);
  if (gate instanceof Response) return gate;

  const media = requireJson(request);
  if (media) return media;

  const { id } = await context.params;
  const current = getOportunidade(id);
  if (!current) {
    return apiError(404, "not_found", "Oportunidade não encontrada.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "invalid_json", "O corpo da requisição precisa ser JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return apiError(400, "invalid_json", "Envie um objeto JSON.");
  }

  const merged = { ...current, ...(body as object) };
  const parsed = validateOportunidade(merged, false);
  if (!parsed.ok) {
    return apiError(422, "validation_error", "Revise os campos enviados.", parsed.details);
  }

  const updated = updateOportunidade(id, parsed.data);
  return json({ data: updated }, { cors: "none" });
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const gate = await gateAdmin(request);
  if (gate instanceof Response) return gate;

  const { id } = await context.params;
  const removed = deleteOportunidade(id);
  if (!removed) {
    return apiError(404, "not_found", "Oportunidade não encontrada.");
  }
  return emptyResponse(204);
}
