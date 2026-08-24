import * as cheerio from "cheerio";

import { pickDeadline } from "./dates";
import { capitalizeTags, isOpen } from "./format";
import {
  createFonte,
  deleteFonte,
  ensureSeedFontes,
  getFonte,
  listFontes,
  updateFonte,
} from "./fontes";
import { persistNow } from "./persist";
import { assertPublicHttpUrl } from "./ssrf";
import { gerarSubtitulo, pareceOportunidade, SINAL_OPORTUNIDADE } from "./triagem";
import {
  deleteByFonte,
  upsertColetada,
} from "./store";
import type { Fonte, Modalidade, Nivel, NovaOportunidade, TipoOportunidade } from "./types";
import { AREAS } from "./taxonomia";

const USER_AGENT =
  "TrilhaDaOportunidade/1.0 (agregador educacional; +https://github.com/becabelin/trilha-da-oportunidade)";
const MAX_BYTES = 3_000_000;
const MAX_ITEMS = 30;

const KEYWORD = SINAL_OPORTUNIDADE;

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
  if (/est[aá]gio|internship|jovem aprendiz|aprendizagem profissional/.test(value)) return "estagio";
  if (/interc[aâ]mbio|exchange|erasmus|mobilidade|pec-g|pec-pg/.test(value)) return "intercambio";
  if (/hackathon|congresso|confer[eê]ncia|evento|summit|festival|workshop|webinar|design day|\bcamp\b/i.test(value)) {
    return "evento";
  }
  if (/curso gratuito|curso com bolsa|certificate program|mooc|bootcamp|summer school|winter school/i.test(value)) {
    return "curso";
  }
  if (/concurso|olimp[ií]ada|pr[eê]mio|award|prize/.test(value)) return "concurso";
  if (/bolsa|scholarship|fellow|grant|funding|edital|mestrado|doutorado|prouni|fies/.test(value)) {
    return "bolsa";
  }
  return fallback ?? "bolsa";
}

export function inferNivel(text: string, fallback: Nivel = "todos"): Nivel {
  const value = text.toLowerCase();
  if (
    /ensino m[eé]dio|ensino-medio|high school|15 a 17|15–17|jovem de 15|obmep|obi\b|obf\b|obq\b/.test(
      value
    )
  ) {
    return "ensino-medio";
  }
  if (
    /mestrado|doutorado|p[oó]s-?gradua|stricto sensu|lato sensu|mba\b|master'?s|phd\b|graduate school|demanda social/.test(
      value
    )
  ) {
    return "pos-graduacao";
  }
  if (
    /gradua[cç][aã]o|undergrad|bachelor|licenciatura|bacharelado|inicia[cç][aã]o cient[ií]fica|pibic|prouni|fies/.test(
      value
    )
  ) {
    return "graduacao";
  }
  return fallback;
}

export function inferArea(text: string, fallback: string): string {
  const value = text.toLowerCase();
  const rules: Array<{ area: (typeof AREAS)[number]; re: RegExp }> = [
    {
      area: "Ciência da Computação",
      re: /computa[cç]|software|programa[cç]|intelig[eê]ncia artificial|\bia\b|dados|hackathon|inform[aá]tica|obi\b|ux |produto digital|alura/,
    },
    {
      area: "UX e Produto",
      re: /\bux\b|user experience|product design|product manager|design system|figma/,
    },
    {
      area: "Engenharia",
      re: /engenharia|senai|petrobras|rob[oó]tica|obr\b/,
    },
    {
      area: "Saúde",
      re: /sa[uú]de|medicina|enfermagem|fonoaudiolog|farm[aá]cia|biomedicina|fiocruz|neuroci[eê]ncia/,
    },
    {
      area: "Ciências Exatas",
      re: /matem[aá]tica|f[ií]sica|qu[ií]mica|estat[ií]stica|obmep|obf\b|obq\b|embrapa|astronomia/,
    },
    {
      area: "Ciências Humanas",
      re: /hist[oó]ria|sociologia|filosofia|letras|pedagogia|direito|ci[eê]ncias sociais|antropologia|geografia humana/,
    },
    {
      area: "Negócios",
      re: /neg[oó]cios|administra[cç]|economia|finan[cç]|empreendedor|sebrae|mba|lideran[cç]/,
    },
    {
      area: "Artes e Design",
      re: /artes? |design gr[aá]fico|arquitetura|cinema|m[uú]sica|fotografia|moda/,
    },
    {
      area: "Meio Ambiente",
      re: /meio ambiente|ambiental|clima|sustentab|ecologia|engajamundo/,
    },
  ];
  for (const rule of rules) {
    if (rule.re.test(value)) return rule.area;
  }
  return fallback || "Multidisciplinar";
}

export function inferModalidade(text: string, fallback: Modalidade = "remoto"): Modalidade {
  const value = text.toLowerCase();
  if (/h[ií]brido|hybrid/.test(value)) return "hibrido";
  if (/presencial|on-?site|in person|campus/.test(value)) return "presencial";
  if (/remoto|online|ead|distance|virtual/.test(value)) return "remoto";
  return fallback;
}

export function inferPais(text: string, fallback = "Internacional"): string {
  const value = text.toLowerCase();
  if (/brasil|brazil|capes|cnpq|fapesp|faperj|fapemig|prouni|fies|mec\b|senac|senai/.test(value)) {
    return "Brasil";
  }
  if (/reino unido|united kingdom|chevening|uk\b/.test(value)) return "Reino Unido";
  if (/alemanha|germany|daad/.test(value)) return "Alemanha";
  if (/estados unidos|united states|fulbright|\busa\b/.test(value)) return "Estados Unidos";
  if (/fran[cç]a|france/.test(value)) return "França";
  if (/portugal/.test(value)) return "Portugal";
  if (/europa|erasmus|uni[aã]o europeia/.test(value)) return "União Europeia";
  return fallback;
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

function parseJsonFeed(body: string, fallbackTipo: TipoOportunidade | null): Candidato[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];
  const record = parsed as Record<string, unknown>;
  const items = Array.isArray(record.items) ? record.items : [];
  const candidatos: Candidato[] = [];
  for (const raw of items.slice(0, MAX_ITEMS)) {
    if (!raw || typeof raw !== "object") continue;
    const item = raw as Record<string, unknown>;
    const titulo = String(item.title ?? "").trim();
    const url = String(item.url ?? item.external_url ?? "").trim();
    if (!titulo || !url) continue;
    const descricao = decodeSnippet(
      String(item.content_text ?? item.summary ?? item.content_html ?? titulo)
    );
    candidatos.push({
      titulo: titulo.slice(0, 140),
      descricao: descricao.slice(0, 800),
      url,
      prazo: pickDeadline(`${titulo}\n${descricao}\n${String(item.date_published ?? "")}`),
      tipo: inferTipo(`${titulo} ${descricao}`, fallbackTipo),
    });
  }
  return candidatos;
}

function isJsonFeed(contentType: string, body: string) {
  if (/json/i.test(contentType) && !/html/i.test(contentType)) return true;
  const trimmed = body.trim();
  return trimmed.startsWith("{") && /"items"\s*:/.test(trimmed.slice(0, 400));
}
function parseHtmlLinks(
  $: cheerio.CheerioAPI,
  baseUrl: string,
  fallbackTipo: TipoOportunidade | null,
  modoBlog = false
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
    if (
      modoBlog &&
      /^(ui\/ux design|brand guidelines|tutorials?|blog|stories|updates|product|pricing|docs|home|features)$/i.test(
        titulo
      )
    ) {
      return;
    }
    const context = cleanText(el.closest("article, li, tr, .post, .card, h2, h3").text() || titulo);
    const blob = `${titulo} ${url.pathname} ${context}`;
    const inArticle = el.closest("article, .post, h2, h3").length > 0;
    if (!KEYWORD.test(blob)) return;
    if (modoBlog && inArticle && !KEYWORD.test(`${titulo} ${url.pathname}`)) return;
    const score =
      (KEYWORD.test(titulo) ? 4 : 0) +
      (KEYWORD.test(url.pathname) ? 2 : 0) +
      (inArticle ? 3 : 0);
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
    $('link[rel="alternate"][type*="json"]').attr("href") ||
    $('link[rel="alternate"][type*="xml"]').attr("href");
  if (!href) return null;
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return null;
  }
}

function candidatoDaPagina(
  $: cheerio.CheerioAPI,
  finalUrl: string,
  fallbackTipo: TipoOportunidade | null
): Candidato | null {
  const titulo = cleanText(
    $("meta[property='og:title']").attr("content") ||
      $("h1").first().text() ||
      $("title").first().text()
  );
  const descricao = cleanText(
    $("meta[property='og:description']").attr("content") ||
      $("meta[name='description']").attr("content") ||
      $("article p, main p, p").first().text()
  );
  const blob = `${titulo}\n${descricao}\n${finalUrl}`;
  if (!titulo || titulo.length < 12) return null;
  if (!KEYWORD.test(blob)) return null;
  return {
    titulo: titulo.slice(0, 140),
    descricao: (descricao || titulo).slice(0, 800),
    url: finalUrl,
    prazo: pickDeadline(blob),
    tipo: inferTipo(blob, fallbackTipo),
  };
}

function toOportunidade(
  candidato: Candidato,
  fonte: Fonte
): NovaOportunidade {
  const organizacao = fonte.titulo || hostnameLabel(fonte.url);
  const tipo = fonte.tipoSugerido ?? candidato.tipo;
  const blob = `${candidato.titulo}\n${candidato.descricao}\n${candidato.url}\n${fonte.titulo ?? ""}\n${fonte.url}`;
  const areaFallback = fonte.areaSugerida || "Multidisciplinar";
  return {
    titulo: candidato.titulo,
    subtitulo: gerarSubtitulo({
      titulo: candidato.titulo,
      descricao: candidato.descricao,
      tipo,
      organizacao,
      prazoInscricao: candidato.prazo,
    }),
    tipo,
    organizacao,
    descricao: candidato.descricao,
    area: inferArea(blob, areaFallback),
    nivel: inferNivel(blob, "todos"),
    modalidade: inferModalidade(blob, "remoto"),
    pais: inferPais(blob, /gov\.br|fapesp|faperj|fapemig|senac|senai|\.br\//i.test(fonte.url) ? "Brasil" : "Internacional"),
    cidade: null,
    beneficio: null,
    prazoInscricao: candidato.prazo,
    dataInicio: null,
    dataFim: null,
    urlInscricao: candidato.url,
    requisitos: [],
    tags: capitalizeTags([fonte.titulo ?? hostnameLabel(fonte.url)]),
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
    let pagina = await fetchPublicPage(fonte.url);
    const modoBlog = false;
    let candidatos: Candidato[] = [];
    let page$ = cheerio.load("");

    if (isJsonFeed(pagina.contentType, pagina.body)) {
      candidatos = parseJsonFeed(pagina.body, fonte.tipoSugerido);
    } else {
      page$ = cheerio.load(pagina.body, { xml: isFeed(pagina.contentType, pagina.body) });

      if (isFeed(pagina.contentType, pagina.body)) {
        candidatos = parseFeed(page$, fonte.tipoSugerido);
        if (candidatos.length === 0) {
          const siteLink = cleanText(page$("channel > link").first().text());
          if (siteLink && siteLink !== fonte.url) {
            try {
              pagina = await fetchPublicPage(siteLink);
              page$ = cheerio.load(pagina.body);
              candidatos = [
                ...parseJsonLd(page$, fonte.tipoSugerido),
                ...parseHtmlLinks(page$, pagina.finalUrl, fonte.tipoSugerido, modoBlog),
              ];
            } catch {
              candidatos = [];
            }
          }
        }
      } else {
        const feedUrl = discoverFeed(page$, pagina.finalUrl);
        if (feedUrl) {
          try {
            const feedPage = await fetchPublicPage(feedUrl);
            if (isJsonFeed(feedPage.contentType, feedPage.body)) {
              candidatos = parseJsonFeed(feedPage.body, fonte.tipoSugerido);
            } else {
              const $feed = cheerio.load(feedPage.body, { xml: true });
              candidatos = parseFeed($feed, fonte.tipoSugerido);
            }
          } catch {
            candidatos = [];
          }
        }
        if (candidatos.length === 0) {
          candidatos = [
            ...parseJsonLd(page$, fonte.tipoSugerido),
            ...parseHtmlLinks(page$, pagina.finalUrl, fonte.tipoSugerido, modoBlog),
          ];
        }
        const propria = candidatoDaPagina(page$, pagina.finalUrl, fonte.tipoSugerido);
        if (propria) candidatos.push(propria);
      }
    }

    const unicos = new Map<string, Candidato>();
    for (const candidato of candidatos) {
      if (
        pareceOportunidade({
          titulo: candidato.titulo,
          descricao: candidato.descricao,
          url: candidato.url,
        }) &&
        !unicos.has(candidato.url)
      ) {
        unicos.set(candidato.url, candidato);
      }
    }

    const hoje = new Date().toISOString().slice(0, 10);
    const triados = [...unicos.values()];
    const abertos = triados.filter((item) => !item.prazo || item.prazo >= hoje);
    const usados = abertos.length > 0 ? abertos : triados.slice(0, 8);

    if (!fonte.titulo) {
      const pageTitle = page$("title").first().text().trim();
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

    persistNow();
    return { fonte: atualizada ?? fonte, oportunidades: salvos };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao coletar a fonte.";
    const atualizada = updateFonte(fonte.id, {
      status: "erro",
      ultimaColeta: new Date().toISOString(),
      erro: message,
    });
    persistNow();
    return { fonte: atualizada ?? fonte, oportunidades: [], erro: message };
  }
}

export async function coletarTodas() {
  ensureSeedFontes();
  const fontes = listFontes();
  const resultados = [];
  for (const fonte of fontes) {
    resultados.push(await coletarFonte(fonte.id));
  }
  persistNow();
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
