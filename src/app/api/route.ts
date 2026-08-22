import { json, optionsResponse } from "@/lib/http";
import { taxonomia } from "@/lib/store";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return optionsResponse();
}

export function GET() {
  return json({
    name: "Oportuna API",
    version: "1.0.0",
    description:
      "Base pública de oportunidades de estudo. Integre no seu app e puxe bolsas, eventos, cursos, estágios, intercâmbios e concursos já coletados.",
    comoUsar: {
      listarAbertas: "/api/oportunidades?status=abertas",
      puxarTodaABase: "/api/oportunidades?status=todas&limit=todas",
      detalhe: "/api/oportunidades/:id",
    },
    endpoints: {
      "GET /api": "Este índice",
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
  });
}
