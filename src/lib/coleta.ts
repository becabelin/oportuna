import * as cheerio from "cheerio";

import { pickDeadline } from "./dates";
import { isOpen } from "./format";
import {
  createFonte,
  deleteFonte,
  getFonte,
  listFontes,
  updateFonte,
} from "./fontes";
import { assertPublicHttpUrl } from "./ssrf";
import {
  deleteByFonte,
  upsertColetada,
} from "./store";
import type { Fonte, NovaOportunidade, TipoOportunidade } from "./types";

const USER_AGENT =
  "OportunaBot/1.0 (agregador educacional; +https://github.com/oportuna)";
const MAX_BYTES = 1_500_000;
const MAX_ITEMS = 30;

const KEYWORD =
  /bolsa|bolsas|scholarship|fellow|edital|inscri[cç]|prazo|grant|internship|est[aá]gio|interc[aâ]mbio|exchange|hackathon|congresso|confer[eê]ncia|summer school|postdoc|doutorado|mestrado|\bphd\b|call for|concurso|olimp[ií]ada|mobilidade|funding|fellowship/i;

const SKIP_HREF =
  /login|signup|cart|facebook|twitter|instagram|linkedin|whatsapp|mailto:|javascript:|privacy|cookie|termos|wp-admin|#/i;

type Pagina = {
  finalUrl: string;
  contentType: string;
  body: string;
};

type Candidato = {
  titulo: string;
  descricao: string;
  url: string;
  prazo: string | null;
  tipo: TipoOportunidade;
};

function hostnameLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Fonte externa";
  }
}

export function inferTipo(text: string, fallback: TipoOportunidade | null): TipoOportunidade {
  const value = text.toLowerCase();
  if (/est[aá]gio|internship/.test(value)) return "estagio";
  if (/interc[aâ]mbio|exchange|erasmus|mobilidade/.test(value)) return "intercambio";
  if (/hackathon|congresso|confer[eê]ncia|evento|summit|workshop/.test(value)) return "evento";
  if (/curso|certificate|mooc|bootcamp/.test(value)) return "curso";
  if (/concurso|olimp[ií]ada|prize/.test(value)) return "concurso";
  if (/bolsa|scholarship|fellow|grant|funding|edital/.test(value)) return "bolsa";
  return fallback ?? "bolsa";
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function decodeSnippet(html: string) {
  return cleanText(cheerio.load(`<div>${html}</div>`)("div").text());
}

async function fetchPublicPage(rawUrl: string): Promise<Pagina> {
  const url = await assertPublicHttpUrl(rawUrl);
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15_000),
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, application/json;q=0.9, */*;q=0.8",
    },
  });
  if (!response.ok) {
    throw new Error(`A fonte respondeu ${response.status}.`);
  }
  await assertPublicHttpUrl(response.url);
  const length = Number(response.headers.get("content-length") ?? "0");
  if (length > MAX_BYTES) {
    throw new Error("A página é grande demais para coletar.");
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_BYTES) {
    throw new Error("A página é grande demais para coletar.");
  }
  return {
    finalUrl: response.url,
    contentType: response.headers.get("content-type") ?? "",
    body: buffer.toString("utf8"),
  };
}

function parseFeed($: cheerio.CheerioAPI, fallbackTipo: TipoOportunidade | null): Candidato[] {
  const items = $("item").toArray();
  const entries = items.length > 0 ? items : $("entry").toArray();
  const candidatos: Candidato[] = [];

  for (const node of entries.slice(0, MAX_ITEMS)) {
    const el = $(node);
    const titulo = cleanText(el.find("title").first().text());
    const link =
      cleanText(el.find("link").first().text()) ||
      el.find("link").first().attr("href") ||
      el.find("guid").first().text();
    if (!titulo || !link) continue;
    let url: string;
    try {
      url = new URL(link).toString();
    } catch {
      continue;
    }
    const descricao = decodeSnippet(
      el.find("description, summary, content\\:encoded, content").first().html() ??
        el.find("description, summary").first().text()
    );
    const blob = `${titulo}\n${descricao}`;
    candidatos.push({
      titulo: titulo.slice(0, 140),
      descricao: (descricao || titulo).slice(0, 800),
      url,
      prazo: pickDeadline(blob),
      tipo: inferTipo(blob, fallbackTipo),
    });
  }
  return candidatos;
}

function parseJsonLd($: cheerio.CheerioAPI, fallbackTipo: TipoOportunidade | null): Candidato[] {
  const candidatos: Candidato[] = [];
  $('script[type="application/ld+json"]').each((_, node) => {
    try {
      const parsed = JSON.parse($(node).text()) as unknown;
      const stack = Array.isArray(parsed) ? parsed : [parsed];
      for (const raw of stack) {
        if (!raw || typeof raw !== "object") continue;
        const item = raw as Record<string, unknown>;
        const graph = item["@graph"];
        const nodes = Array.isArray(graph) ? graph : [item];
        for (const nodeItem of nodes) {
          if (!nodeItem || typeof nodeItem !== "object") continue;
          const record = nodeItem as Record<string, unknown>;
          const type = String(record["@type"] ?? "");
          if (!/Event|Scholarship|JobPosting|Course|EducationEvent/i.test(type)) continue;
          const titulo = String(record.name ?? "").trim();
          const url = String(record.url ?? "").trim();
          if (!titulo || !url) continue;
          const descricao = String(record.description ?? titulo);
          const prazo =
            pickDeadline(
              [record.endDate, record.validThrough, record.applicationDeadline, descricao]
                .filter(Boolean)
                .join(" ")
            ) ?? (typeof record.endDate === "string" ? record.endDate.slice(0, 10) : null);
          candidatos.push({
            titulo: titulo.slice(0, 140),
            descricao: descricao.slice(0, 800),
            url,
            prazo,
            tipo: inferTipo(`${type} ${titulo} ${descricao}`, fallbackTipo),
          });
        }
      }
    } catch {
      // JSON-LD malformado: ignora o bloco
    }
  });
  return candidatos;
}

function parseHtmlLinks(
  $: cheerio.CheerioAPI,
  baseUrl: string,
  fallbackTipo: TipoOportunidade | null
): Candidato[] {
  const scored = new Map<string, { score: number; candidato: Candidato }>();

  $("a[href]").each((_, node) => {
    const el = $(node);
    const href = el.attr("href") ?? "";
    if (!href || SKIP_HREF.test(href)) return;
    let url: URL;
    try {
      url = new URL(href, baseUrl);
    } catch {
      return;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return;
    const titulo = cleanText(el.text());
    if (titulo.length < 12 || titulo.length > 180) return;
    const context = cleanText(el.closest("article, li, tr, .post, .card").text() || titulo);
    const blob = `${titulo} ${url.pathname} ${context}`;
    if (!KEYWORD.test(blob)) return;
    const score =
      (KEYWORD.test(titulo) ? 4 : 0) +
      (KEYWORD.test(url.pathname) ? 2 : 0) +
      (el.closest("article, .post").length ? 3 : 0);
    const current = scored.get(url.toString());
    if (current && current.score >= score) return;
    scored.set(url.toString(), {
      score,
      candidato: {
        titulo: titulo.slice(0, 140),
        descricao: context.slice(0, 800),
        url: url.toString(),
        prazo: pickDeadline(context),
        tipo: inferTipo(blob, fallbackTipo),
      },
    });
  });

  return [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ITEMS)
    .map((entry) => entry.candidato);
}

function discoverFeed($: cheerio.CheerioAPI, baseUrl: string) {
  const href =
    $('link[rel="alternate"][type*="rss"]').attr("href") ||
    $('link[rel="alternate"][type*="atom"]').attr("href") ||
    $('link[rel="alternate"][type*="xml"]').attr("href");
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function toOportunidade(
  candidato: Candidato,
  fonte: Fonte
): NovaOportunidade {
  return {
    titulo: candidato.titulo,
    tipo: fonte.tipoSugerido ?? candidato.tipo,
    organizacao: fonte.titulo || hostnameLabel(fonte.url),
    descricao: candidato.descricao,
    area: "Multidisciplinar",
    nivel: "todos",
    modalidade: "remoto",
    pais: "Internacional",
    cidade: null,
    beneficio: null,
    prazoInscricao: candidato.prazo,
    dataInicio: null,
    dataFim: null,
    urlInscricao: candidato.url,
    requisitos: [],
    tags: ["coletada"],
    vagas: null,
    origem: "coleta",
    fonteId: fonte.id,
    fonteUrl: fonte.url,
  };
}

function isFeed(contentType: string, body: string) {
  if (/rss|atom|xml/i.test(contentType) && !/html/i.test(contentType)) return true;
  const head = body.slice(0, 400).toLowerCase();
  return head.includes("<rss") || head.includes("<feed") || head.includes("<rdf:rdf");
}

export async function coletarFonte(fonteId: string) {
  const fonte = getFonte(fonteId);
  if (!fonte) {
    throw new Error("Fonte não encontrada.");
  }

  try {
    const pagina = await fetchPublicPage(fonte.url);
    const $ = cheerio.load(pagina.body, { xml: isFeed(pagina.contentType, pagina.body) });

    let candidatos: Candidato[] = [];
    if (isFeed(pagina.contentType, pagina.body)) {
      candidatos = parseFeed($, fonte.tipoSugerido);
    } else {
      const feedUrl = discoverFeed($, pagina.finalUrl);
      if (feedUrl) {
        try {
          const feedPage = await fetchPublicPage(feedUrl);
          const $feed = cheerio.load(feedPage.body, { xml: true });
          candidatos = parseFeed($feed, fonte.tipoSugerido);
        } catch {
          candidatos = [];
        }
      }
      if (candidatos.length === 0) {
        candidatos = [
          ...parseJsonLd($, fonte.tipoSugerido),
          ...parseHtmlLinks($, pagina.finalUrl, fonte.tipoSugerido),
        ];
      }
    }

    const unicos = new Map<string, Candidato>();
    for (const candidato of candidatos) {
      if (!unicos.has(candidato.url)) unicos.set(candidato.url, candidato);
    }

    const hoje = new Date().toISOString().slice(0, 10);
    const abertos = [...unicos.values()].filter((item) => !item.prazo || item.prazo >= hoje);

    const usados = abertos.length > 0 ? abertos : [...unicos.values()].slice(0, 8);
    if (usados.length === 0) {
      const titulo =
        $("title").first().text().trim() ||
        $('meta[property="og:title"]').attr("content") ||
        fonte.titulo ||
        hostnameLabel(fonte.url);
      const descricao =
        $('meta[name="description"]').attr("content") ||
        $('meta[property="og:description"]').attr("content") ||
        "Página monitorada pela Oportuna. Abra o link para ver os editais atuais.";
      usados.push({
        titulo: cleanText(titulo).slice(0, 140),
        descricao: cleanText(descricao).slice(0, 800),
        url: pagina.finalUrl,
        prazo: pickDeadline(`${titulo} ${descricao}`),
        tipo: fonte.tipoSugerido ?? "bolsa",
      });
    }

    if (!fonte.titulo) {
      const pageTitle = $("title").first().text().trim();
      if (pageTitle) updateFonte(fonte.id, { titulo: pageTitle.slice(0, 80) });
    }

    const salvos = usados.slice(0, MAX_ITEMS).map((candidato) => {
      const current = getFonte(fonte.id) ?? fonte;
      return upsertColetada(toOportunidade(candidato, current));
    });

    const atualizada = updateFonte(fonte.id, {
      status: "ok",
      ultimaColeta: new Date().toISOString(),
      itensEncontrados: salvos.length,
      itensAbertos: salvos.filter(isOpen).length,
      erro: null,
    });

    return { fonte: atualizada ?? fonte, oportunidades: salvos };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao coletar a fonte.";
    const atualizada = updateFonte(fonte.id, {
      status: "erro",
      ultimaColeta: new Date().toISOString(),
      erro: message,
    });
    return { fonte: atualizada ?? fonte, oportunidades: [], erro: message };
  }
}

export async function coletarTodas() {
  const fontes = listFontes();
  const resultados = [];
  for (const fonte of fontes) {
    resultados.push(await coletarFonte(fonte.id));
  }
  return resultados;
}

export async function adicionarEColetar(url: string, tipoSugerido?: TipoOportunidade | null) {
  await assertPublicHttpUrl(url);
  const fonte = createFonte({ url, tipoSugerido: tipoSugerido ?? null });
  return coletarFonte(fonte.id);
}

export function removerFonte(id: string) {
  deleteByFonte(id);
  return deleteFonte(id);
}
