import type { NextRequest } from "next/server";

import { gateAdmin } from "@/lib/admin-auth";
import { enriquecerCapasEventos } from "@/lib/coleta";
import { json, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export function OPTIONS() {
  return optionsResponse("none");
}

export async function POST(request: NextRequest) {
  const gate = await gateAdmin(request);
  if (gate instanceof Response) return gate;
  const result = await enriquecerCapasEventos();
  return json({ data: result }, { cors: "none" });
}
