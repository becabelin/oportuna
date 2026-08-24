import type { TipoOportunidade } from "./types";

/** Palavras que indicam edital, vaga ou chamada — não texto de blog. */
export const SINAL_OPORTUNIDADE =
  /bolsa|bolsas|scholarship|scholarships|fellow(?:s|ship)?|edital|editais|inscri[cç][oõ]es|inscri[cç][aã]o|candidat(?:ura|e-se|as)|prazo de inscri|application deadline|apply now|how to apply|grant\b|funding|internship|internships|est[aá]gio|est[aá]gios|trainee|interc[aâ]mbio|exchange program|erasmus|mobilidade acad|hackathon|hack ?day|congresso|confer[eê]ncia|call for (?:papers|entries|application|proposals)|open call|chamada|concurso|olimp[ií]ada|pr[eê]mio|award|prize|fully funded|tuition(?:-|\s)?free|summer school|winter school|bootcamp|processo seletivo|vagas? (?:abertas|remuneradas)|mentoria com inscri|programa de bolsas|programa de est[aá]gio|youth (?:summit|forum|program)|volunteer (?:program|opportunity)|curso(?:s)? gratuit|universidade(?:s)? gratuita|vagas? em cursos?|mestrado|doutorado|p[oó]s-?gradua[cç][aã]o|inicia[cç][aã]o cient[ií]fica|pibic|prouni|fies|jovem aprendiz|para jovens|juventude/i;

const SINAL_FORTE =
  /bolsa|scholarship|fellowship|edital|inscri[cç]|fully funded|internship|est[aá]gio|interc[aâ]mbio|exchange program|hackathon|call for applications|processo seletivo|candidat|open call|chamada p[uú]blica|programa de bolsas|youth program|curso(?:s)? gratuit|universidade(?:s)? gratuita|mestrado|doutorado|olimp[ií]ada/i;

const CHEIRO_ARTIGO =
  /newsletter|podcast|case study|estudo de caso|opini[aã]o|opinion piece|thoughts on|what we learned|behind the (?:design|scenes)|cheat sheet|design system|figma plugin|ui kit|tutorial de|how we redesigned|a week in (?:the )?life|our latest (?:release|update)|product update|changelog/i;

const TITULO_ARTIGO =
  /^(how to (?!apply)|why |what is |what the |is the future|the future of|a guide to|introducing |rethinking |\d+\s+(?:ways|tips|things|mistakes|lessons)|lessons from )/i;

const URL_ARTIGO =
  /\/(blog|articles?|stories|news|noticias|podcast|literature|tag|category|insights|resources\/article)(\/|$)/i;

/** Sites de revista/blog que não publicam edital — só artigo. */
export const HOSTS_ARTIGO = [
  "uxdesign.cc",
  "uxplanet.org",
  "uxmag.com",
  "nngroup.com",
  "interaction-design.org",
  "uxdesignweekly.com",
  "figma.com",
  "miro.com",
  "notion.com",
  "notion.so",
  "framer.com",
  "claude.com",
  "anthropic.com",
  "medium.com",
];

export function hostDeUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export function ehHostDeArtigo(url: string) {
  const host = hostDeUrl(url);
  if (!host) return false;
  return HOSTS_ARTIGO.some((item) => host === item || host.endsWith(`.${item}`));
}

function blobDe(input: { titulo: string; descricao: string; url?: string }) {
  return `${input.titulo}\n${input.descricao}\n${input.url ?? ""}`;
}

export function pareceOportunidade(input: {
  titulo: string;
  descricao: string;
  url?: string;
}) {
  const titulo = input.titulo.trim();
  const descricao = input.descricao.trim();
  if (titulo.length < 12) return false;
  if (input.url && ehHostDeArtigo(input.url)) return false;

  const blob = blobDe(input);
  if (!SINAL_OPORTUNIDADE.test(blob)) return false;

  const artigo =
    CHEIRO_ARTIGO.test(blob) ||
    TITULO_ARTIGO.test(titulo) ||
    (input.url ? URL_ARTIGO.test(input.url) : false);

  if (artigo && !SINAL_FORTE.test(blob)) return false;
  return true;
}

function normalizarTexto(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function pareceTitulo(frase: string, titulo: string) {
  const a = normalizarTexto(frase);
  const b = normalizarTexto(titulo);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.startsWith(b) || b.startsWith(a)) return true;
  return false;
}

const PREFIXO_TIPO =
  /^(bolsa|evento|curso com inscri[cç][aã]o aberta|est[aá]gio|interc[aâ]mbio|concurso ou pr[eê]mio|oportunidade)\s+da\s+/i;

function primeiraFraseUtil(texto: string, titulo: string) {
  const limpo = texto
    .replace(/How To Apply.*/gi, "")
    .replace(/\|\s*(Scholarship Region|Scholars4Dev|Scholars4dev).*/gi, "")
    .replace(/\bRead now\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!limpo) return "";

  const frases = limpo
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 40 && item.length <= 180)
    .filter((item) => !/home|about|contact|subscribe|privacy/i.test(item))
    .filter((item) => !pareceTitulo(item, titulo))
    .filter((item) => !PREFIXO_TIPO.test(item));

  if (frases[0]) return frases[0];
  const recorte = limpo.length >= 40 ? limpo.slice(0, 160).trim() : "";
  if (recorte && !pareceTitulo(recorte, titulo) && !PREFIXO_TIPO.test(recorte)) {
    return recorte;
  }
  return "";
}

function capitalizar(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function ehSubtituloMolde(texto: string) {
  return PREFIXO_TIPO.test(texto.trim());
}

export function subtituloVisivel(item: {
  titulo: string;
  descricao: string;
  subtitulo: string;
}) {
  const sub = item.subtitulo.trim();
  if (!sub) return false;
  if (ehSubtituloMolde(sub)) return false;
  if (pareceTitulo(sub, item.titulo)) return false;
  const desc = item.descricao.trim();
  const subBase = sub.replace(/[.!?]+$/, "");
  if (desc.startsWith(subBase)) return false;
  return true;
}

export function gerarSubtitulo(input: {
  titulo: string;
  descricao: string;
  tipo: TipoOportunidade;
  organizacao: string;
  prazoInscricao: string | null;
}) {
  const frase = primeiraFraseUtil(input.descricao, input.titulo);
  if (!frase) return "";
  const corpo = /[.!?]$/.test(frase) ? frase : `${frase}.`;
  return capitalizar(corpo.replace(/\s+/g, " ").trim()).slice(0, 220);
}

