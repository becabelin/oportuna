import type { NextRequest } from "next/server";

import { gateAdmin } from "@/lib/admin-auth";
import { revogarChave } from "@/lib/chaves";
import { apiError, json, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export function OPTIONS() {
  return optionsResponse("none");
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  const gate = await gateAdmin(request);
  if (gate instanceof Response) return gate;
  const { id } = await context.params;
  const revoked = await revogarChave(id);
  if (!revoked) {
    return apiError(404, "not_found", "Chave não encontrada.");
  }
  return json({ data: revoked }, { cors: "none" });
}
