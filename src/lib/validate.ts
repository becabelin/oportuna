import type {
  FiltrosOportunidade,
  Modalidade,
  Nivel,
  NovaOportunidade,
  TipoOportunidade,
} from "./types";
import { MODALIDADES, NIVEIS, TIPOS } from "./types";
import { capitalizeTags } from "./format";
import { gerarSubtitulo } from "./triagem";

export function isTipo(value: unknown): value is TipoOportunidade {
  return typeof value === "string" && (TIPOS as readonly string[]).includes(value);
}

function isNivel(value: unknown): value is Nivel {
  return typeof value === "string" && (NIVEIS as readonly string[]).includes(value);
}

function isModalidade(value: unknown): value is Modalidade {
  return (
    typeof value === "string" && (MODALIDADES as readonly string[]).includes(value)
  );
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((item) => typeof item === "string" && item.trim().length > 0)) {
    return null;
  }
  return value.map((item) => item.trim());
}

export type ValidationResult =
  | { ok: true; data: NovaOportunidade }
  | { ok: false; details: Record<string, string> };

export function validateOportunidade(
  body: unknown,
  partial = false
): ValidationResult {
  if (!body || typeof body !== "object") {
    return { ok: false, details: { body: "JSON inválido." } };
  }

  const input = body as Record<string, unknown>;
  const details: Record<string, string> = {};

  const requireField = (key: string) => {
    if (!partial && (input[key] === undefined || input[key] === null)) {
      details[key] = "Campo obrigatório.";
      return false;
    }
    return input[key] !== undefined;
  };

  if (requireField("titulo")) {
    if (typeof input.titulo !== "string" || input.titulo.trim().length < 5) {
      details.titulo = "Use um título com pelo menos 5 caracteres.";
    } else if (input.titulo.trim().length > 140) {
      details.titulo = "Título deve ter no máximo 140 caracteres.";
    }
  }

  if (requireField("tipo") && !isTipo(input.tipo)) {
    details.tipo = `Tipo inválido. Use: ${TIPOS.join(", ")}.`;
  }

  if (requireField("organizacao")) {
    if (typeof input.organizacao !== "string" || input.organizacao.trim().length < 2) {
      details.organizacao = "Informe a organização responsável.";
    }
  }

  if (requireField("descricao")) {
    if (typeof input.descricao !== "string" || input.descricao.trim().length < 20) {
      details.descricao = "Descreva a oportunidade com pelo menos 20 caracteres.";
    } else if (input.descricao.length > 4000) {
      details.descricao = "Descrição deve ter no máximo 4000 caracteres.";
    }
  }

  if (requireField("area")) {
    if (typeof input.area !== "string" || input.area.trim().length < 2) {
      details.area = "Informe a área.";
    }
  }

  if (requireField("nivel") && !isNivel(input.nivel)) {
    details.nivel = `Nível inválido. Use: ${NIVEIS.join(", ")}.`;
  }

  if (requireField("modalidade") && !isModalidade(input.modalidade)) {
    details.modalidade = `Modalidade inválida. Use: ${MODALIDADES.join(", ")}.`;
  }

  if (requireField("pais")) {
    if (typeof input.pais !== "string" || input.pais.trim().length < 2) {
      details.pais = "Informe o país.";
    }
  }

  if (input.cidade !== undefined && input.cidade !== null && typeof input.cidade !== "string") {
    details.cidade = "Cidade deve ser texto ou nulo.";
  }

  if (
    input.beneficio !== undefined &&
    input.beneficio !== null &&
    typeof input.beneficio !== "string"
  ) {
    details.beneficio = "Benefício deve ser texto ou nulo.";
  }

  for (const key of ["prazoInscricao", "dataInicio", "dataFim"] as const) {
    if (input[key] !== undefined && input[key] !== null && !isIsoDate(input[key])) {
      details[key] = "Use a data no formato AAAA-MM-DD ou nulo.";
    }
  }

  if (requireField("urlInscricao") && !isUrl(input.urlInscricao)) {
    details.urlInscricao = "Informe uma URL http(s) válida.";
  }

  if (input.imagemUrl !== undefined && input.imagemUrl !== null && !isUrl(input.imagemUrl)) {
    details.imagemUrl = "A imagem deve ser uma URL http(s) válida ou nula.";
  }

  if (input.requisitos !== undefined) {
    const requisitos = asStringArray(input.requisitos);
    if (!requisitos) details.requisitos = "Requisitos deve ser uma lista de textos.";
  }

  if (input.tags !== undefined) {
    const tags = asStringArray(input.tags);
    if (!tags) details.tags = "Tags deve ser uma lista de textos.";
    else if (tags.length > 12) details.tags = "No máximo 12 tags.";
  }

  if (input.vagas !== undefined && input.vagas !== null) {
    if (typeof input.vagas !== "number" || !Number.isInteger(input.vagas) || input.vagas < 1) {
      details.vagas = "Vagas deve ser um inteiro positivo ou nulo.";
    }
  }

  if (Object.keys(details).length > 0) {
    return { ok: false, details };
  }

  const titulo = String(input.titulo).trim();
  const organizacao = String(input.organizacao).trim();
  const descricao = String(input.descricao).trim();
  const tipo = input.tipo as TipoOportunidade;
  const prazoInscricao = (input.prazoInscricao as string | null) ?? null;
  const subtituloInformado =
    typeof input.subtitulo === "string" ? input.subtitulo.trim().slice(0, 220) : "";

  const data: NovaOportunidade = {
    titulo,
    subtitulo:
      subtituloInformado ||
      gerarSubtitulo({
        titulo,
        descricao,
        tipo,
        organizacao,
        prazoInscricao,
      }),
    tipo,
    organizacao,
    descricao,
    area: String(input.area).trim(),
    nivel: input.nivel as Nivel,
    modalidade: input.modalidade as Modalidade,
    pais: String(input.pais).trim(),
    cidade: input.cidade == null ? null : String(input.cidade).trim() || null,
    beneficio: input.beneficio == null ? null : String(input.beneficio).trim() || null,
    prazoInscricao,
    dataInicio: (input.dataInicio as string | null) ?? null,
    dataFim: (input.dataFim as string | null) ?? null,
    urlInscricao: String(input.urlInscricao).trim(),
    imagemUrl: typeof input.imagemUrl === "string" ? input.imagemUrl.trim() : null,
    requisitos: asStringArray(input.requisitos) ?? [],
    tags: capitalizeTags(asStringArray(input.tags) ?? []),
    vagas: typeof input.vagas === "number" ? input.vagas : null,
    origem: input.origem === "coleta" ? "coleta" : "manual",
    fonteId: typeof input.fonteId === "string" ? input.fonteId : null,
    fonteUrl: typeof input.fonteUrl === "string" ? input.fonteUrl : null,
  };

  return { ok: true, data };
}

export function parseListQuery(searchParams: URLSearchParams): FiltrosOportunidade {
  const tipos = searchParams
    .get("tipo")
    ?.split(",")
    .map((item) => item.trim())
    .filter(isTipo);

  const area = searchParams.get("area") ?? undefined;
  const nivelRaw = searchParams.get("nivel");
  const modalidadeRaw = searchParams.get("modalidade");
  const pais = searchParams.get("pais") ?? undefined;
  const statusRaw = searchParams.get("status");
  const ordenarRaw = searchParams.get("ordenar");
  const origemRaw = searchParams.get("origem");
  const page = Number(searchParams.get("page") ?? "1");
  const limitRaw = searchParams.get("limit") ?? "50";
  const unlimited = limitRaw === "todas" || limitRaw === "all";
  const limit = unlimited ? 10_000 : Number(limitRaw);

  return {
    q: searchParams.get("q")?.trim() || undefined,
    tipo: tipos && tipos.length === 1 ? tipos[0] : tipos,
    area: area && area.length > 0 ? area : undefined,
    nivel: isNivel(nivelRaw) ? nivelRaw : undefined,
    modalidade: isModalidade(modalidadeRaw) ? modalidadeRaw : undefined,
    pais: pais && pais.length > 0 ? pais : undefined,
    status:
      statusRaw === "encerradas" || statusRaw === "todas" || statusRaw === "abertas"
        ? statusRaw
        : "abertas",
    ordenar:
      ordenarRaw === "recentes" || ordenarRaw === "titulo" || ordenarRaw === "prazo"
        ? ordenarRaw
        : "prazo",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    limit:
      Number.isFinite(limit) && limit > 0 ? Math.min(10_000, Math.floor(limit)) : 50,
    fonteId: searchParams.get("fonteId")?.trim() || undefined,
    origem: origemRaw === "coleta" || origemRaw === "manual" ? origemRaw : undefined,
  };
}
