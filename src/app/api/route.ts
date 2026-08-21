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
      "Você envia links de editais. A Oportuna coleta e mantém as oportunidades ainda abertas.",
    endpoints: {
      "GET /api": "Este índice",
      "GET /api/taxonomia": "Tipos, áreas, níveis, modalidades e países com contagem",
      "GET /api/fontes": "Fontes monitoradas (URLs que você cadastrou)",
      "POST /api/fontes": "Adiciona uma URL e coleta na hora. Corpo: { url, tipo? }",
      "POST /api/fontes/:id/coletar": "Coleta de novo uma fonte",
      "DELETE /api/fontes/:id": "Remove a fonte e as oportunidades coletadas dela",
      "GET|POST /api/coletar": "Atualiza todas as fontes",
      "GET /api/oportunidades":
        "Lista paginada. Query: q, tipo, area, nivel, modalidade, pais, status, origem, fonteId, ordenar, page, limit",
      "POST /api/oportunidades": "Cadastra uma oportunidade na mão",
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
