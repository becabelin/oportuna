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
      "API pública de oportunidades de estudo: bolsas, eventos, cursos, estágios, intercâmbios e concursos.",
    endpoints: {
      "GET /api": "Este índice",
      "GET /api/taxonomia": "Tipos, áreas, níveis, modalidades e países com contagem",
      "GET /api/oportunidades":
        "Lista paginada. Query: q, tipo, area, nivel, modalidade, pais, status, ordenar, page, limit",
      "POST /api/oportunidades": "Cadastra uma oportunidade",
      "GET /api/oportunidades/:id": "Detalhe",
      "PATCH /api/oportunidades/:id": "Atualização parcial",
      "DELETE /api/oportunidades/:id": "Remove",
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
