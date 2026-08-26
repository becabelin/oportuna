import * as cheerio from "cheerio";

import {
  imagemNoCard,
  imagemNoDocumento,
  imagemNoItemFeed,
  imagemNoJsonFeedItem,
} from "./capa-fonte";
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
import { ehCapaInutil } from "./imagem-url";
import { persistNow } from "./persist";
import { assertPublicHttpUrl } from "./ssrf";
import {
  ehNomeDeFonte,
  enxugarFicha,
  enxugarTituloNoticia,
  gerarSubtitulo,
  limparTextoColetado,
  mesmaOportunidade,
  pareceOportunidade,
  SINAL_OPORTUNIDADE,
  tituloColetavel,
} from "./triagem";
import {
  deleteByFonte,
  listOportunidades,
  updateOportunidade,
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
  /login|signup|cart|facebook|twitter|instagram|linkedin|whatsapp|mailto:|javascript:|privacy|cookie|termos|wp-admin|#|maps\.google|maps\.app\.goo\.gl|google\.[^/]+\/maps|goo\.gl\/maps/i;

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
  imagem: string | null;
  organizacao?: string | null;
  pais?: string;
  modalidade?: Modalidade;
  areaHint?: string;
  confiavel?: boolean;
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
  if (/hackathon|congresso|confer[eê]ncia|evento|summit|festival|workshop|webinar|design day|\bcamp\b|meetup/i.test(value)) {
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
    /mestrado|doutorado|p[oó]s-?gradua|stricto sensu|lato sensu|mba\b|master'?s|phd\b|doctorate|post-?doctoral|graduate school|demanda social/.test(
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
      re: /hist[oó]ria|sociologia|filosofia|letras|pedagogia|direito|\bin law\b|ci[eê]ncias sociais|antropologia|geografia humana/,
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
  const semCdata = html.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  const $ = cheerio.load(`<div>${semCdata}</div>`);
  $("p, li, br, div, h1, h2, h3, h4").each((_, el) => {
    $(el).prepend(" ");
  });
  return cleanText($("div").first().text());
}

const SANTANDER_DISCOVERY =
  "https://api-manager.universia.net/soa-content-discovery/api/contents";

function textoSantander(value: unknown) {
  return typeof value === "string" ? value : "";
}

function dataSantander(value: unknown) {
  const raw = textoSantander(value);
  return /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : null;
}

function listaSantander(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

export function ehFonteSantanderOpenAcademy(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "santanderopenacademy.com" || host.endsWith(".santanderopenacademy.com");
  } catch {
    return false;
  }
}

export function ehFonteMeetup(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return host === "meetup.com" || host.endsWith(".meetup.com");
  } catch {
    return false;
  }
}

const MEETUP_SLUG_RESERVADO = new Set([
  "find",
  "login",
  "register",
  "topics",
  "cities",
  "pro",
  "home",
  "account",
  "messages",
  "groups",
]);

function slugMeetup(url: string) {
  try {
    const parts = new URL(url).pathname.split("/").filter(Boolean);
    const slug = parts[0]?.trim();
    if (!slug || MEETUP_SLUG_RESERVADO.has(slug.toLowerCase())) return null;
    return slug;
  } catch {
    return null;
  }
}

function feedMeetupGrupo(url: string) {
  const slug = slugMeetup(url);
  return slug ? `https://www.meetup.com/${slug}/events/rss/` : null;
}

function organizacaoMeetup(channelTitle: string, slug: string) {
  const limpo = cleanText(channelTitle.replace(/^events\s*[-–—:]\s*/i, ""));
  if (limpo && !/^meetup$/i.test(limpo)) return limpo.slice(0, 160);
  return slug.replace(/[-_]+/g, " ").slice(0, 160);
}

async function coletarMeetupGrupo(url: string): Promise<Candidato[]> {
  const feed = feedMeetupGrupo(url);
  const slug = slugMeetup(url);
  if (!feed || !slug) return [];
  const pagina = await fetchPublicPage(feed);
  const $ = cheerio.load(pagina.body, { xml: true });
  const organizacao = organizacaoMeetup($("channel > title").first().text(), slug);
  const candidatos: Candidato[] = [];
  for (const node of $("item").toArray().slice(0, MAX_ITEMS)) {
    const el = $(node);
    const titulo = cleanText(el.find("title").first().text());
    const link =
      cleanText(el.find("link").first().text()) ||
      el.find("guid").first().text();
    if (!titulo || !link) continue;
    let itemUrl: string;
    try {
      itemUrl = new URL(link).toString();
    } catch {
      continue;
    }
    const descricao = decodeSnippet(
      el.find("description").first().text() ||
        el.find("description, content\\:encoded, content").first().html() ||
        ""
    );
    const blob = `${titulo}\n${descricao}`;
    candidatos.push({
      titulo: titulo.slice(0, 140),
      descricao: (descricao || titulo).slice(0, 2000),
      url: itemUrl,
      prazo: pickDeadline(blob),
      tipo: "evento",
      imagem: imagemNoItemFeed($, node, itemUrl),
      organizacao,
      pais: inferPais(blob, "Brasil"),
      modalidade: inferModalidade(blob, "presencial"),
      confiavel: true,
    });
  }
  return candidatos;
}

function tipoSantander(resourceType: string, categories: string[], blob: string): TipoOportunidade {
  if (/SOA_COURSE/i.test(resourceType)) return "curso";
  const cats = categories.join(" ").toLowerCase();
  if (cats.includes("internship")) return "estagio";
  if (cats.includes("academic_mobility")) return "intercambio";
  return inferTipo(blob, "bolsa");
}

function dicaAreaSantander(categories: string[]) {
  const cats = categories.join(" ").toUpperCase();
  if (/\bTECH\b|TOOLS/.test(cats)) return "computação inteligência artificial tecnologia";
  if (/\bLANGUAGE\b/.test(cats)) return "idiomas inglês espanhol";
  if (/BUSINESS|FINANCIAL_EDUCATION|SKILLS/.test(cats)) return "negócios carreira finanças";
  if (/ACADEMIC_MOBILITY/.test(cats)) return "mobilidade acadêmica intercâmbio";
  if (/INTERNSHIP/.test(cats)) return "estágio internship";
  if (/RESEARCH/.test(cats)) return "pesquisa científica";
  return "";
}

function modalidadeSantander(item: Record<string, unknown>, categories: string[]): Modalidade {
  const mode = textoSantander(item.mode).toUpperCase();
  if (mode === "ONLINE") return "remoto";
  if (mode === "HYBRID" || mode === "HYBRIDIZED") return "hibrido";
  if (mode === "ONSITE" || mode === "PRESENTIAL" || mode === "IN_PERSON") return "presencial";
  if (/ACADEMIC_MOBILITY|INTERNSHIP/i.test(categories.join(" "))) return "presencial";
  return "remoto";
}

function candidatoSantander(item: Record<string, unknown>): Candidato | null {
  const status = textoSantander(item.status).toUpperCase();
  if (status && status !== "OPEN") return null;
  const titulo = cleanText(textoSantander(item.name));
  const url =
    textoSantander(item.detailUrl).trim() || textoSantander(item.actionUrl).trim();
  if (titulo.length < 8 || !url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
  } catch {
    return null;
  }
  const categories = listaSantander(item.categories);
  const descricao = decodeSnippet(
    textoSantander(item.shortDescription) ||
      textoSantander(item.marketingTitle) ||
      textoSantander(item.description)
  );
  const countries = listaSantander(item.countries);
  const resourceType = textoSantander(item.resourceType);
  const areaHint = dicaAreaSantander(categories);
  const blob = `${titulo} ${descricao} ${categories.join(" ")} ${areaHint}`;
  const organizacao =
    cleanText(textoSantander(item.provider) || textoSantander(item.author)) ||
    "Santander Open Academy";
  const imagem = textoSantander(item.image).trim();
  return {
    titulo: titulo.slice(0, 140),
    descricao: (descricao || titulo).slice(0, 800),
    url,
    prazo: dataSantander(item.applicationDeadlineDate),
    tipo: tipoSantander(resourceType, categories, blob),
    imagem: imagem && !ehCapaInutil(imagem) ? imagem : null,
    organizacao,
    pais: countries.includes("BR") ? "Brasil" : "Internacional",
    modalidade: modalidadeSantander(item, categories),
    areaHint,
    confiavel: true,
  };
}

async function fetchSantanderDiscovery(resourceType: "SOA_GRANT" | "SOA_COURSE") {
  const candidatos: Candidato[] = [];
  const limit = 50;
  for (let offset = 0; offset < 200; offset += limit) {
    const url = `${SANTANDER_DISCOVERY}?resourceType=${resourceType}&limit=${limit}&offset=${offset}&status=OPEN`;
    const parsed = await assertPublicHttpUrl(url);
    const response = await fetch(parsed, {
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        "Accept-Language": "pt-BR",
      },
    });
    if (!response.ok) {
      throw new Error(`A fonte Santander respondeu ${response.status}.`);
    }
    await assertPublicHttpUrl(response.url);
    const data = (await response.json()) as { results?: unknown };
    const results = Array.isArray(data.results) ? data.results : [];
    for (const row of results) {
      if (!row || typeof row !== "object") continue;
      const candidato = candidatoSantander(row as Record<string, unknown>);
      if (candidato) candidatos.push(candidato);
    }
    if (results.length < limit) break;
  }
  return candidatos;
}

async function coletarSantanderOpenAcademy(): Promise<Candidato[]> {
  const [cursos, bolsas] = await Promise.all([
    fetchSantanderDiscovery("SOA_COURSE"),
    fetchSantanderDiscovery("SOA_GRANT"),
  ]);
  const unicos = new Map<string, Candidato>();
  for (const candidato of [...cursos, ...bolsas]) {
    if (!unicos.has(candidato.url)) unicos.set(candidato.url, candidato);
  }
  return [...unicos.values()].sort((a, b) => (a.prazo ?? "9999").localeCompare(b.prazo ?? "9999"));
}

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 3;

export async function fetchPublicPage(rawUrl: string, hops = 0): Promise<Pagina> {
  if (hops > MAX_REDIRECTS) {
    throw new Error("A fonte redirecionou vezes demais.");
  }
  const url = await assertPublicHttpUrl(rawUrl);
  const response = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html, application/json;q=0.9, */*;q=0.8",
    },
  });
  if (REDIRECT_STATUS.has(response.status)) {
    const location = response.headers.get("location");
    if (!location) {
      throw new Error(`A fonte respondeu ${response.status}.`);
    }
    return fetchPublicPage(new URL(location, url).toString(), hops + 1);
  }
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
      imagem: imagemNoItemFeed($, node, url),
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
          const url = String(record.url ?? "").trim();
          const descricao = String(record.description ?? record.name ?? "");
          const titulo = tituloColetavel(String(record.name ?? "").trim(), descricao, url);
          if (!titulo || !url) continue;
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
            imagem: imagemNoJsonFeedItem(record, url),
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
      imagem: imagemNoJsonFeedItem(item, url),
    });
  }
  return candidatos;
}

function isJsonFeed(contentType: string, body: string) {
  if (/json/i.test(contentType) && !/html/i.test(contentType)) return true;
  const trimmed = body.trim();
  return trimmed.startsWith("{") && /"items"\s*:/.test(trimmed.slice(0, 400));
}

function pesoPortugues(titulo: string, descricao: string) {
  const blob = `${titulo}\n${descricao}`;
  let peso = 0;
  if (/[áàâãéêíóôõúç]/i.test(blob)) peso += 4;
  if (/\b(bolsa|institui[cç][aã]o|inscri[cç][oõ]es até)\b/i.test(blob)) peso += 5;
  if (/\b(fellowship|instituition|deadline for submissions)\b/i.test(blob)) peso -= 4;
  if (descricao.length > 180) peso += 2;
  return peso;
}

function candidatoHtmlMelhor(
  atual: { score: number; candidato: Candidato },
  score: number,
  titulo: string,
  descricao: string
) {
  if (atual.score > score) return true;
  if (atual.score < score) return false;
  return (
    pesoPortugues(atual.candidato.titulo, atual.candidato.descricao) >=
    pesoPortugues(titulo, descricao)
  );
}

function recortePortuguesFapesp(url: URL, texto: string) {
  if (!/fapesp\.br$/i.test(url.hostname.replace(/^www\./, ""))) return texto;
  const corte = texto.search(
    /\b(Level\s+\d|Instituition:|Field of knowledge:|Deadline for submissions:|Fellowship Opportunities)\b/i
  );
  if (corte > 50) return texto.slice(0, corte).replace(/\s+/g, " ").trim();
  return texto;
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
    const bruto = cleanText(el.text());
    if (bruto.length < 12 || bruto.length > 180) return;
    if (
      modoBlog &&
      /^(ui\/ux design|brand guidelines|tutorials?|blog|stories|updates|product|pricing|docs|home|features)$/i.test(
        bruto
      )
    ) {
      return;
    }
    const context = recortePortuguesFapesp(
      url,
      cleanText(el.closest("article, li, tr, .post, .card, h2, h3").text() || bruto)
    );
    const titulo = tituloColetavel(bruto, context, url.toString());
    if (!titulo) return;
    const blob = `${titulo} ${url.pathname} ${context}`;
    const inArticle = el.closest("article, .post, h2, h3").length > 0;
    if (!KEYWORD.test(blob)) return;
    if (modoBlog && inArticle && !KEYWORD.test(`${titulo} ${url.pathname}`)) return;
    const score =
      (KEYWORD.test(titulo) ? 4 : 0) +
      (KEYWORD.test(url.pathname) ? 2 : 0) +
      (inArticle ? 3 : 0);
    const current = scored.get(url.toString());
    if (current && candidatoHtmlMelhor(current, score, titulo, context)) return;
    scored.set(url.toString(), {
      score,
      candidato: {
        titulo: titulo.slice(0, 140),
        descricao: context.slice(0, 1200),
        url: url.toString(),
        prazo: pickDeadline(context),
        tipo: inferTipo(blob, fallbackTipo),
        imagem: imagemNoCard($, node, url.toString()),
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
  const descricao = cleanText(
    $("meta[property='og:description']").attr("content") ||
      $("meta[name='description']").attr("content") ||
      $("article p, main p, p").first().text()
  );
  const titulo = tituloColetavel(
    cleanText(
      $("meta[property='og:title']").attr("content") ||
        $("h1").first().text() ||
        $("title").first().text()
    ),
    descricao,
    finalUrl
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
    imagem: imagemNoDocumento($, finalUrl),
  };
}

function toOportunidade(
  candidato: Candidato,
  fonte: Fonte
): NovaOportunidade {
  const ficha = enxugarFicha(candidato.titulo, candidato.descricao);
  const nomeFonte = fonte.titulo || hostnameLabel(fonte.url);
  const organizacao =
    candidato.organizacao?.trim() ||
    (ehNomeDeFonte(nomeFonte) && ficha.instituicao ? ficha.instituicao : nomeFonte);
  const tipo = candidato.confiavel ? candidato.tipo : (fonte.tipoSugerido ?? candidato.tipo);
  const blob = `${ficha.titulo}\n${ficha.descricao}\n${candidato.areaHint ?? ""}\n${candidato.url}\n${fonte.titulo ?? ""}\n${fonte.url}`;
  const areaFallback = fonte.areaSugerida || "Multidisciplinar";
  const tagFonte = ehFonteSantanderOpenAcademy(fonte.url)
    ? "Santander Open Academy"
    : ehFonteMeetup(fonte.url)
      ? (fonte.titulo ?? "Meetup")
      : (fonte.titulo ?? hostnameLabel(fonte.url));
  return {
    titulo: enxugarTituloNoticia(ficha.titulo),
    subtitulo: gerarSubtitulo({
      titulo: enxugarTituloNoticia(ficha.titulo),
      descricao: limparTextoColetado(ficha.descricao),
      tipo,
      organizacao,
      prazoInscricao: candidato.prazo,
    }),
    tipo,
    organizacao,
    descricao: limparTextoColetado(ficha.descricao),
    area: inferArea(ficha.titulo, inferArea(blob, areaFallback)),
    nivel: inferNivel(blob, "todos"),
    modalidade:
      candidato.modalidade ??
      inferModalidade(
        blob,
        /fapesp\.br\/oportunidades/i.test(candidato.url) ? "presencial" : "remoto"
      ),
    pais: candidato.pais ?? inferPais(blob, /gov\.br|fapesp|faperj|fapemig|senac|senai|\.br\//i.test(fonte.url) ? "Brasil" : "Internacional"),
    cidade: ficha.cidade,
    beneficio: null,
    prazoInscricao: candidato.prazo,
    dataInicio: null,
    dataFim: null,
    urlInscricao: candidato.url,
    requisitos: [],
    tags: capitalizeTags([tagFonte]),
    vagas: null,
    origem: "coleta",
    fonteId: fonte.id,
    fonteUrl: fonte.url,
    imagemUrl: candidato.imagem,
    enriquecidoEm: null,
  };
}

function isFeed(contentType: string, body: string) {
  if (/rss|atom|xml/i.test(contentType) && !/html/i.test(contentType)) return true;
  const head = body.slice(0, 400).toLowerCase();
  return head.includes("<rss") || head.includes("<feed") || head.includes("<rdf:rdf");
}

async function imagemDaPagina(rawUrl: string): Promise<string | null> {
  try {
    const pagina = await fetchPublicPage(rawUrl);
    const $ = cheerio.load(pagina.body);
    return imagemNoDocumento($, pagina.finalUrl);
  } catch {
    return null;
  }
}

async function completarImagemEvento(candidato: Candidato, tipo: TipoOportunidade) {
  if (tipo !== "evento") return candidato;
  if (candidato.imagem && !ehCapaInutil(candidato.imagem)) return candidato;
  const imagem = await imagemDaPagina(candidato.url);
  return imagem ? { ...candidato, imagem } : candidato;
}

async function mapPool<T>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<void>
) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const current = index;
      index += 1;
      await fn(items[current]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, items.length) }, () => worker()));
}

export async function enriquecerCapasEventos() {
  const { data } = listOportunidades({ tipo: "evento", status: "todas", limit: 10_000 });
  let comCapa = 0;
  await mapPool(data, 5, async (item) => {
    if (item.imagemUrl && !ehCapaInutil(item.imagemUrl)) {
      comCapa += 1;
      return;
    }
    const imagem = await imagemDaPagina(item.urlInscricao);
    if (imagem) {
      updateOportunidade(item.id, { imagemUrl: imagem });
      comCapa += 1;
    }
  });
  persistNow();
  return { total: data.length, comCapa };
}

export async function coletarFonte(fonteId: string) {
  const fonte = getFonte(fonteId);
  if (!fonte) {
    throw new Error("Fonte não encontrada.");
  }

  try {
    const modoBlog = false;
    let candidatos: Candidato[] = [];
    let page$ = cheerio.load("");

    if (ehFonteSantanderOpenAcademy(fonte.url)) {
      try {
        candidatos = await coletarSantanderOpenAcademy();
        if (candidatos.length > 0) {
          updateFonte(fonte.id, { titulo: "Santander Open Academy" });
        }
      } catch {
        candidatos = [];
      }
    } else if (ehFonteMeetup(fonte.url)) {
      try {
        candidatos = await coletarMeetupGrupo(fonte.url);
      } catch {
        candidatos = [];
      }
    }

    if (candidatos.length === 0) {
      let pagina = await fetchPublicPage(fonte.url);

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
            const propria =
              !ehFonteSantanderOpenAcademy(fonte.url) && !ehFonteMeetup(fonte.url)
                ? candidatoDaPagina(page$, pagina.finalUrl, fonte.tipoSugerido)
                : null;
            candidatos = propria
              ? [...parseJsonLd(page$, fonte.tipoSugerido), propria]
              : [
                  ...parseJsonLd(page$, fonte.tipoSugerido),
                  ...parseHtmlLinks(page$, pagina.finalUrl, fonte.tipoSugerido, modoBlog),
                ];
          }
        }
      }
    }

    const unicos = new Map<string, Candidato>();
    for (const bruto of candidatos) {
      const titulo = tituloColetavel(bruto.titulo, bruto.descricao, bruto.url);
      if (!titulo) continue;
      const candidato = { ...bruto, titulo };
      if (
        !(
          candidato.confiavel ||
          pareceOportunidade({
            titulo: candidato.titulo,
            descricao: candidato.descricao,
            url: candidato.url,
          })
        )
      ) {
        continue;
      }
      if (unicos.has(candidato.url)) continue;
      if (
        [...unicos.values()].some((atual) =>
          mesmaOportunidade(
            { titulo: atual.titulo, descricao: atual.descricao },
            { titulo: candidato.titulo, descricao: candidato.descricao }
          )
        )
      ) {
        continue;
      }
      unicos.set(candidato.url, candidato);
    }

    const hoje = new Date().toISOString().slice(0, 10);
    const triados = [...unicos.values()];
    const abertos = triados.filter((item) => !item.prazo || item.prazo >= hoje);
    const usados = abertos.length > 0 ? abertos : triados.slice(0, 8);

    if (!fonte.titulo) {
      const pageTitle = page$("title").first().text().trim();
      if (pageTitle) updateFonte(fonte.id, { titulo: pageTitle.slice(0, 80) });
    }

    const salvos = [];
    for (const candidato of usados.slice(0, MAX_ITEMS)) {
      const current = getFonte(fonte.id) ?? fonte;
      const tipo = current.tipoSugerido ?? candidato.tipo;
      const completo = await completarImagemEvento(candidato, tipo);
      salvos.push(upsertColetada(toOportunidade(completo, current)));
    }

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
  try {
    const { enriquecerFichasPendentes } = await import("./enriquecer-ficha");
    await enriquecerFichasPendentes({ limit: 10 });
  } catch (error) {
    console.warn("[trilha] escrita das fichas falhou", error);
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
