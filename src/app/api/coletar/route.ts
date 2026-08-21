import { coletarTodas } from "@/lib/coleta";
import { json, optionsResponse } from "@/lib/http";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export function OPTIONS() {
  return optionsResponse();
}

export async function POST() {
  const resultados = await coletarTodas();
  return json({
    data: resultados.map((item) => ({
      fonte: item.fonte,
      total: item.oportunidades.length,
      erro: item.erro ?? null,
    })),
  });
}

export async function GET() {
  return POST();
}
