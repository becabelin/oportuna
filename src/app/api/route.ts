import type { NextRequest } from "next/server";

import { gateIpPublico } from "@/lib/api-auth";
import { json, optionsResponse } from "@/lib/http";
import { LIMITES_API, LIMITES_IP } from "@/lib/limites-api";
import { taxonomia } from "@/lib/store";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  const gate = await gateIpPublico(request);
  if (gate instanceof Response) return gate;
  return json(
    {
      name: "Trilha da Oportunidade API",
      version: "1.0.0",
      description:
        "Base de oportunidades de estudo. O mural no site é aberto. Para o seu app consultar /api/oportunidades, peça uma chave em /chave e envie Authorization: Bearer opt_…",
      autenticacao: {
        pedirChave: "POST /api/chaves  { nome, email, projeto }",
        usar: "Authorization: Bearer opt_…   ou   X-Api-Key: opt_…",
        teto: `${LIMITES_API.porMinuto} chamadas/minuto e ${LIMITES_API.porDia}/dia por chave; ${LIMITES_IP.porMinuto}/minuto e ${LIMITES_IP.porDia}/dia por IP`,
      },
      comoUsar: {
        listarAbertas: "/api/oportunidades?status=abertas",
        puxarTodaABase: "/api/oportunidades?status=todas&limit=todas",
        detalhe: "/api/oportunidades/:id",
      },
      endpoints: {
        "POST /api/chaves": "Emite uma chave (nome, email, projeto)",
        "GET /api": "Este índice (sem chave)",
        "GET /api/taxonomia": "Tipos, áreas, níveis, modalidades e países com contagem",
        "GET /api/oportunidades":
          "Lista a base. Query: q, tipo, area, nivel, modalidade, pais, status, ordenar, page, limit (use limit=todas para o acervo inteiro)",
        "GET /api/oportunidades/:id": "Detalhe de uma oportunidade",
      },
      enumeracoes: {
        tipo: ["bolsa", "evento", "curso", "estagio", "intercambio", "concurso"],
        nivel: ["ensino-medio", "graduacao", "pos-graduacao", "todos"],
        modalidade: ["presencial", "remoto", "hibrido"],
        status: ["abertas", "encerradas", "todas"],
        ordenar: ["prazo", "recentes", "titulo"],
      },
      resumo: taxonomia(),
    },
    { headers: gate.headers }
  );
}
