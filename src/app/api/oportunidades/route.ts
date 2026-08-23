import type { NextRequest } from "next/server";

import { gatePublicApi } from "@/lib/api-auth";
import { apiError, json, optionsResponse } from "@/lib/http";
import { createOportunidade, listOportunidades } from "@/lib/store";
import { parseListQuery, validateOportunidade } from "@/lib/validate";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET(request: NextRequest) {
  const gate = gatePublicApi(request);
  if (gate instanceof Response) return gate;
  const filtros = parseListQuery(request.nextUrl.searchParams);
  return json(listOportunidades(filtros), { headers: gate.headers });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, "invalid_json", "O corpo da requisição precisa ser JSON.");
  }

  const parsed = validateOportunidade(body, false);
  if (!parsed.ok) {
    return apiError(422, "validation_error", "Revise os campos enviados.", parsed.details);
  }

  const created = createOportunidade(parsed.data);
  return json(
    { data: created },
    {
      status: 201,
      headers: { Location: `/api/oportunidades/${created.id}` },
    }
  );
}
