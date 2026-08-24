import type { TipoOportunidade } from "./types";

/** Palavras que indicam edital, vaga ou chamada, não texto de blog. */
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

/** Sites de revista/blog que não publicam edital, só artigo. */
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

/** Índice genérico da Santander Open Academy, não um edital específico. */
export function ehHubSantanderOpenAcademy(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "santanderopenacademy.com" && !host.endsWith(".santanderopenacademy.com")) {
      return false;
    }
    return /\/sites\/(scholarships|courses)(\.html)?$/i.test(parsed.pathname);
  } catch {
    return false;
  }
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
  if (ehLixoDeColeta(input)) return false;

  const blob = blobDe(input);
  if (!SINAL_OPORTUNIDADE.test(blob)) return false;

  const artigo =
    CHEIRO_ARTIGO.test(blob) ||
    TITULO_ARTIGO.test(titulo) ||
    (input.url ? URL_ARTIGO.test(input.url) : false);

  if (artigo && !SINAL_FORTE.test(blob)) return false;
  return true;
}

/** RSS/blog que não é o edital: notícia, e-book, lixo de WordPress. */
export function ehLixoDeColeta(input: { titulo: string; descricao: string; url?: string }) {
  const titulo = input.titulo.trim();
  const blob = `${titulo}\n${input.descricao}\n${input.url ?? ""}`;
  if (/o post\s+.+\s+apareceu primeiro/i.test(blob)) return true;
  if (/the post\s+.+\s+appeared first/i.test(blob)) return true;
  if (/\]\]>/.test(input.descricao)) return true;
  if (/\be-?books?\b/i.test(titulo) && /download|formul[aá]rio|materiais/i.test(blob)) return true;
  if (input.url && /\/(materiais(?:-[a-z]+)?|ebooks?)(\/|$)/i.test(input.url)) return true;
  if (/^awards overview$/i.test(titulo)) return true;
  return false;
}

export function limparTextoColetado(texto: string) {
  return texto
    .replace(/\s*O post\s+.+\s+apareceu primeiro em\s+.+$/i, "")
    .replace(/\s*\]\]>\s*/g, "")
    .replace(/\s*saiba como participar\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function enxugarTituloNoticia(titulo: string) {
  return titulo
    .replace(/\s+est[aá] com inscri[cç][oõ]es abertas\.?$/i, "")
    .replace(/\s+inscri[cç][oõ]es abertas\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function nucleoDoTitulo(titulo: string) {
  return normalizarTexto(titulo)
    .replace(
      /\b(20\d{2}|esta com|inscricoes? abertas?|inscricoes? para|inscricoes?|chamada para|chamada|para o|para a|para os|edicao|award|premio de|premio)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function titulosParecidos(a: string, b: string) {
  const na = nucleoDoTitulo(a);
  const nb = nucleoDoTitulo(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return na.length >= 12 && nb.length >= 12;
  const ta = new Set(na.split(" ").filter((word) => word.length > 3));
  const tb = new Set(nb.split(" ").filter((word) => word.length > 3));
  if (ta.size < 2 || tb.size < 2) return false;
  const inter = [...ta].filter((word) => tb.has(word)).length;
  if (inter < 3) return false;
  return inter / new Set([...ta, ...tb]).size >= 0.7;
}

function soAnunciaInscricao(texto: string) {
  const n = normalizarTexto(texto);
  if (!n) return false;
  return /^(inscricoes?( para .+)? (estao )?abertas|esta com inscricoes abertas)/.test(n);
}

function normalizarTexto(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const RE_EMOJI =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}►▶👉]/gu;

function semEnfeite(frase: string) {
  return frase.replace(RE_EMOJI, " ").replace(/\s+/g, " ").trim();
}

const GANCHO_INICIO =
  /^(quer|voce quer|voce esta|gostaria|pronto para|ready to|want to|looking to|sonha|ja pensou|imagina|e se voce|vamos|venha|participe|inscreva se|nao perca|descubra|transforme|conquiste|impulsione|acelere|comece|prepare se|esta pronto|ola+|oi|hey|hello|meu nome e)\b/;

function ehSaudacaoOuBlog(frase: string) {
  const n = normalizarTexto(frase);
  return (
    /^(ola+|oi |hey |hello |meu nome e)/.test(`${n} `) ||
    /engajadinhos|turopom|decidi escrever este texto|pode me chamar de/.test(n)
  );
}

/** Slogan, pergunta de anúncio ou CTA: não descreve a oportunidade. */
export function ehGanchoMarketing(frase: string) {
  const limpa = semEnfeite(frase);
  const n = normalizarTexto(limpa);
  if (!n) return true;
  if (/\?$/.test(limpa.trim())) return true;
  if (ehSaudacaoOuBlog(limpa)) return true;
  if (GANCHO_INICIO.test(n)) return true;
  if (
    /inscricoes? ja (estao )?abertas|inscreva se( agora)?|nao perca essa oportunidade|clique aqui|saiba mais|assine agora/.test(
      n
    )
  ) {
    return true;
  }
  if (limpa.length < 70 && /!$/.test(limpa.trim())) return true;
  return false;
}

function pareceFato(frase: string) {
  return /vagas?|bolsas?|gratuito|gratuitas|curso|bootcamp|estagio|edital|programa|conferencia|congresso|hackathon|semanas|meses|oferece|oferecendo|para (estudantes|alunos|jovens|quem)|mestrado|doutorado|remoto|presencial|online|on line|certificado|mentoria|pesquisa|palestras|inscricao/.test(
    normalizarTexto(frase)
  );
}

function cortarFrase(frase: string, max = 180) {
  const limpa = semEnfeite(frase);
  if (limpa.length <= max) return limpa;
  const corte = limpa.slice(0, max);
  const lastSpace = corte.lastIndexOf(" ");
  const base = (lastSpace > 80 ? corte.slice(0, lastSpace) : corte).replace(/[,;:\s]+$/, "");
  return /[.!?]$/.test(base) ? base : `${base}.`;
}

export function pareceTitulo(frase: string, titulo: string) {
  const a = normalizarTexto(frase);
  const b = normalizarTexto(titulo);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.startsWith(b) || b.startsWith(a)) return true;
  return false;
}

const RE_INSTITUICAO = /\binstitu(?:i)?tion\s*:/i;
const RE_INSTITUICAO_PT = /\binstitui[cç][aã]o\s*:/i;
const RE_CIDADE = /\b(?:city|cidade)\s*:/i;
const RE_PRAZO = /\bdeadline(?:\s+for\s+submissions)?\s*:/i;
const RE_PRAZO_CURTO = /\sdeadl[a-z]{0,10}$/i;
const RE_CORTE_TITULO =
  /\b(?:institu(?:i)?tion|institui[cç][aã]o|city|cidade|deadline)\s*:/i;

function capturaApos(texto: string, inicio: RegExp, fins: RegExp[]) {
  const found = texto.match(inicio);
  if (!found || found.index === undefined) return null;
  const rest = texto.slice(found.index + found[0].length);
  let end = rest.length;
  for (const fin of fins) {
    const flags = fin.flags.replace("g", "");
    const m = rest.match(new RegExp(fin.source, flags));
    if (m && m.index !== undefined && m.index < end) end = m.index;
  }
  const value = rest
    .slice(0, end)
    .replace(/\s+/g, " ")
    .replace(RE_PRAZO_CURTO, "")
    .replace(/[\s|·•,;:.]+$/g, "")
    .trim();
  return value || null;
}

const RE_INICIO_PROGRAMA =
  /\s+(?:Level\s+\d|Doctorate|Master(?:'s)?|PhD|Fellowship|Technical Training)\b/i;

function extrairCampos(texto: string) {
  const instituicao =
    capturaApos(texto, RE_INSTITUICAO, [RE_CIDADE, RE_PRAZO, RE_INSTITUICAO_PT]) ||
    capturaApos(texto, RE_INSTITUICAO_PT, [RE_CIDADE, RE_PRAZO, RE_INSTITUICAO]);
  const cidade = capturaApos(texto, RE_CIDADE, [
    RE_PRAZO,
    RE_INSTITUICAO,
    RE_INSTITUICAO_PT,
    RE_INICIO_PROGRAMA,
  ]);
  return {
    instituicao: campoUtil(instituicao),
    cidade: limparCidade(cidade),
  };
}

function campoUtil(value: string | null) {
  if (!value) return null;
  if (value.length > 160) return null;
  if (/\b(fellowship|deadline|instituition|institution)\b/i.test(value)) return null;
  return value;
}

function limparCidade(value: string | null) {
  if (!value) return null;
  const cortado = value.replace(RE_INICIO_PROGRAMA, "").replace(RE_PRAZO_CURTO, "").trim();
  return campoUtil(cortado);
}

function escolherCampo(primario: string | null, secundario: string | null) {
  return campoUtil(primario) || campoUtil(secundario);
}

export function ehNomeDeFonte(nome: string) {
  const n = nome.trim();
  if (!n) return false;
  return /:\s*(oportunidades|bolsas)\b/i.test(n) || /\b(oportunidades|feed rss|rss feed)\b/i.test(n);
}

export type FichaEnxuta = {
  titulo: string;
  descricao: string;
  instituicao: string | null;
  cidade: string | null;
};

/** Separa título, instituição e cidade de fichas coladas (ex.: FAPESP). */
export function enxugarFicha(titulo: string, descricao = ""): FichaEnxuta {
  const tituloNorm = titulo.replace(/\s+/g, " ").trim();
  const descNorm = descricao.replace(/\s+/g, " ").trim();
  const temMarcador =
    RE_INSTITUICAO.test(tituloNorm) ||
    RE_INSTITUICAO.test(descNorm) ||
    RE_INSTITUICAO_PT.test(tituloNorm) ||
    RE_INSTITUICAO_PT.test(descNorm) ||
    RE_CIDADE.test(tituloNorm) ||
    RE_CIDADE.test(descNorm) ||
    RE_PRAZO.test(tituloNorm) ||
    RE_PRAZO.test(descNorm) ||
    RE_PRAZO_CURTO.test(tituloNorm);

  if (!temMarcador) {
    return {
      titulo: tituloNorm,
      descricao: descNorm,
      instituicao: null,
      cidade: null,
    };
  }

  const daDesc = extrairCampos(descNorm);
  const doTitulo = extrairCampos(tituloNorm);
  const instituicao = escolherCampo(daDesc.instituicao, doTitulo.instituicao);
  const cidade = escolherCampo(daDesc.cidade, doTitulo.cidade);

  const corte = tituloNorm.search(RE_CORTE_TITULO);
  let limpo = (corte > 0 ? tituloNorm.slice(0, corte) : tituloNorm)
    .replace(RE_PRAZO_CURTO, "")
    .replace(/(\d)-([A-Z])/g, "$1 $2")
    .replace(/[\s|·•,;:\-–—]+$/g, "")
    .trim();

  if (limpo.length < 8) limpo = tituloNorm.slice(0, 90).trim();

  const descCorta = descNorm
    .replace(/\binstitu(?:i)?tion\s*:.+?(?=\s+(?:city|cidade|deadline|institui[cç][aã]o)\b|$)/gi, " ")
    .replace(/\binstitui[cç][aã]o\s*:.+?(?=\s+(?:city|cidade|deadline|institu(?:i)?tion)\b|$)/gi, " ")
    .replace(/\b(?:city|cidade)\s*:.+?(?=\s+deadline\b|$)/gi, " ")
    .replace(/\bdeadline(?:\s+for\s+submissions)?\s*:\s*\S+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const ecoaTitulo =
    !descCorta || pareceTitulo(descCorta, limpo) || pareceTitulo(descNorm, tituloNorm);

  let desc = descNorm;
  if (instituicao || cidade) {
    const partes = [
      instituicao ? `Instituição: ${instituicao}` : "",
      cidade ? `Cidade: ${cidade}` : "",
    ].filter(Boolean);
    desc = `${limpo}. ${partes.join(". ")}.`;
  } else if (ecoaTitulo) {
    desc = limpo;
  } else {
    desc = descCorta;
  }

  return {
    titulo: limpo.slice(0, 140),
    descricao: desc.slice(0, 800),
    instituicao,
    cidade,
  };
}

const PREFIXO_TIPO =
  /^(bolsa|evento|curso com inscri[cç][aã]o aberta|est[aá]gio|interc[aâ]mbio|concurso ou pr[eê]mio|oportunidade)\s+da\s+/i;

function primeiraFraseUtil(texto: string, titulo: string) {
  const limpo = limparTextoColetado(texto)
    .replace(/How To Apply.*/gi, "")
    .replace(/\|\s*(Scholarship Region|Scholars4Dev|Scholars4dev).*/gi, "")
    .replace(/\bRead now\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!limpo) return "";

  const candidatas = limpo
    .split(/(?<=[.!?])\s+/)
    .map((item) => semEnfeite(item))
    .filter((item) => item.length >= 40)
    .filter((item) => !/home|about|contact|subscribe|privacy/i.test(item))
    .filter((item) => !pareceTitulo(item, titulo))
    .filter((item) => !PREFIXO_TIPO.test(item))
    .filter((item) => !soAnunciaInscricao(item))
    .filter((item) => !ehGanchoMarketing(item));

  const escolhida = candidatas.find(pareceFato) ?? candidatas[0];
  if (escolhida) return cortarFrase(escolhida);

  const recorte = cortarFrase(limpo, 160);
  if (
    recorte &&
    !pareceTitulo(recorte, titulo) &&
    !PREFIXO_TIPO.test(recorte) &&
    !soAnunciaInscricao(recorte) &&
    !ehGanchoMarketing(recorte)
  ) {
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
  if (soAnunciaInscricao(sub)) return false;
  if (ehGanchoMarketing(sub)) return false;
  if (/o post\s+.+\s+apareceu primeiro/i.test(sub)) return false;
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

export function gerarResumoCard(item: {
  titulo: string;
  descricao: string;
  subtitulo: string;
  organizacao: string;
  cidade: string | null;
}) {
  if (subtituloVisivel(item)) return item.subtitulo.trim();
  const desc = limparTextoColetado(item.descricao);
  if (desc && !pareceTitulo(desc, item.titulo) && !soAnunciaInscricao(desc)) {
    const frase = primeiraFraseUtil(desc, item.titulo);
    if (frase) return frase;
  }
  return [item.organizacao, item.cidade].filter((parte) => parte?.trim()).join(", ");
}

