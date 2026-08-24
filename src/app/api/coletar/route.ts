import type { NextRequest } from "next/server";

import { gateCronOuAdmin } from "@/lib/admin-auth";
import { coletarTodas } from "@/lib/coleta";
import { json, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function OPTIONS() {
  return optionsResponse("none");
}

async function executar(request: NextRequest) {
  const gate = await gateCronOuAdmin(request);
  if (gate instanceof Response) return gate;
  const resultados = await coletarTodas();
  return json(
    {
      data: resultados.map((item) => ({
        fonte: item.fonte,
        total: item.oportunidades.length,
        erro: item.erro ?? null,
      })),
    },
    { cors: "none" }
  );
}

export async function POST(request: NextRequest) {
  return executar(request);
}

export async function GET(request: NextRequest) {
  return executar(request);
}
