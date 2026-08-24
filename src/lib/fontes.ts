import { persistFontes, readSnapshot } from "./persist";
import { slugify } from "./format";
import { deleteByFonte } from "./store";
import { ehHostDeArtigo } from "./triagem";
import type { Fonte, TipoOportunidade } from "./types";

type FontesStore = {
  items: Map<string, Fonte>;
};

const globalForFontes = globalThis as unknown as { __oportunaFontes?: FontesStore };

export const SEED_FONTES: Array<
  Pick<Fonte, "url" | "titulo" | "tipoSugerido"> & { areaSugerida?: string }
> = [
{
    url: "https://www.scholarshipregion.com/feed/",
    titulo: "Scholarship Region",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://www.scholars4dev.com/",
    titulo: "Scholars4Dev",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://www.gov.br/cnpq/pt-br",
    titulo: "CNPq",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://eventos.uxfor.com.br/",
    titulo: "UXFor Events Hub",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://www.listadeeventos.com.br/evento/dexconf-2026-conferencia-design-ux-sao-paulo",
    titulo: "DEXConf / Mergo",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://www.uxconf.com.br/",
    titulo: "UXConf BR",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://linkfestival.me/",
    titulo: "Link Festival",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://www.mulheresdeproduto.com/",
    titulo: "Mulheres de Produto",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://www.productcamp.com.br/",
    titulo: "Product Camp",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://worldusabilityday.org/",
    titulo: "World Usability Day",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://www.floripadesigndays.com/",
    titulo: "Floripa Design Days",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://nubank.com.br/nu-design-day",
    titulo: "Nu Design Day",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://designday.olx.com.br/",
    titulo: "Design Day OLX",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://www.lovableday.com.br/",
    titulo: "Lovable Day",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
  {
    url: "https://negocios.ifood.com.br/eventos/ifood-camp",
    titulo: "iFood Camp",
    tipoSugerido: "evento",
    areaSugerida: "UX e Produto",
  },
{
    url: "https://www.santanderopenacademy.com/pt_br/sites/scholarships.html",
    titulo: "Santander Open Academy — Bolsas",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://www.estudarfora.org.br/feed/",
    titulo: "Estudar Fora",
    tipoSugerido: "intercambio",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://partiuintercambio.org/feed/",
    titulo: "Partiu Intercâmbio",
    tipoSugerido: "intercambio",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://www.bolsamaisbrasil.com.br/",
    titulo: "Bolsa Mais Brasil",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://fundacaolemann.org.br/liderancas/bolsas-e-oportunidades/",
    titulo: "Fundação Lemann — Bolsas e oportunidades",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://www.programaria.org/feed/",
    titulo: "PrograMaria",
    tipoSugerido: "curso",
    areaSugerida: "Ciência da Computação",
  },
{
    url: "https://www.womakerscode.org/feed",
    titulo: "WoMakersCode",
    tipoSugerido: "curso",
    areaSugerida: "Ciência da Computação",
  },
{
    url: "https://oportunidadesinternacionais.ufsc.br/feed/",
    titulo: "UFSC — Oportunidades internacionais",
    tipoSugerido: "evento",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://cartadaterrainternacional.org/envolva-se/programa-jovens-lideres/",
    titulo: "Carta da Terra — Jovens Líderes",
    tipoSugerido: "curso",
    areaSugerida: "Meio Ambiente",
  },
{
    url: "https://www.rio2c.com/",
    titulo: "Rio2C",
    tipoSugerido: "evento",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://youth.europa.eu/go-abroad_pt",
    titulo: "Portal Europeu da Juventude — Ir para o estrangeiro",
    tipoSugerido: "intercambio",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://www.nmedu.com.br/portfolio/programas-de-ferias-para-jovens/",
    titulo: "NM Educação — Programas de férias",
    tipoSugerido: "intercambio",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://worldcreativityday.com/brazil",
    titulo: "World Creativity Day Brazil",
    tipoSugerido: "evento",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://www.worldcreativityfestival.com/",
    titulo: "Festival Mundial da Criatividade",
    tipoSugerido: "evento",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://hacktown.com.br/feed/",
    titulo: "HackTown",
    tipoSugerido: "evento",
    areaSugerida: "Ciência da Computação",
  },
{
    url: "https://www.visitejoinville.com.br/World-Creativity-Day",
    titulo: "World Creativity Day Joinville",
    tipoSugerido: "evento",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://www.premiobrasilcriativo.com.br/",
    titulo: "Prêmio Brasil Criativo",
    tipoSugerido: "concurso",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://ifdesign.com/en/if-design-award-2027-chamada-para-inscricoes",
    titulo: "iF Design Award 2027",
    tipoSugerido: "concurso",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://bdapremiobrasileirodesign.com.br/",
    titulo: "BDA — Prêmio Brasileiro de Design",
    tipoSugerido: "concurso",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://abimovel.com/premio-design/",
    titulo: "Prêmio Design Abimóvel",
    tipoSugerido: "concurso",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://dfbwaward.com/",
    titulo: "DFBW Award",
    tipoSugerido: "concurso",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://premiobornancini.com.br/",
    titulo: "Prêmio Bornancini de Design",
    tipoSugerido: "concurso",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://www.cbd.org.br/dfbwaward-2/",
    titulo: "Centro Brasil Design — DFBW Award",
    tipoSugerido: "concurso",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://www.dandad.org/",
    titulo: "D&AD",
    tipoSugerido: "concurso",
    areaSugerida: "Artes e Design",
  },
{
    url: "https://www.accessplus.com.br/",
    titulo: "Access+",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://latinamericanleadershipacademy.org/",
    titulo: "Latin American Leadership Academy",
    tipoSugerido: "bolsa",
    areaSugerida: "Negócios",
  },
{
    url: "https://www.risefortheworld.org/",
    titulo: "Rise",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
{
    url: "https://engajamundo.org/pt/",
    titulo: "Engajamundo",
    tipoSugerido: "curso",
    areaSugerida: "Meio Ambiente",
  },
{
    url: "https://www.programaprolider.com.br/",
    titulo: "ProLíder",
    tipoSugerido: "curso",
    areaSugerida: "Negócios",
  },
{
    url: "https://aiesec.org.br/",
    titulo: "AIESEC no Brasil",
    tipoSugerido: "intercambio",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://www.fipecafi.org/Mestrado-Profissional",
    titulo: "FIPECAFI — Mestrado Profissional",
    tipoSugerido: "bolsa",
    areaSugerida: "Negócios",
  },
  {
    url: "https://pep.ufc.br/pt/edital-n-o-01-2026-selecao-para-mestrado-profissional-em-economia-turma-2026-1-atualizacao-26-02-2026/",
    titulo: "UFC PEP — Mestrado Profissional em Economia 2026.1",
    tipoSugerido: "bolsa",
    areaSugerida: "Negócios",
  },
  {
    url: "https://mestrado-doutorado.fgv.br/curso/mestrado-profissional/sao-paulo/financas-e-economia",
    titulo: "FGV — Mestrado Profissional em Finanças e Economia",
    tipoSugerido: "bolsa",
    areaSugerida: "Negócios",
  },
  {
    url: "https://www.sp.senac.br/bolsas-de-estudo",
    titulo: "Senac São Paulo — Bolsas de estudo",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://tabula.com.br/blog/post/estudar-fora-paises-universidades-gratuitas-ou-com-bolsa-de-estudos",
    titulo: "Tábula — Universidades gratuitas e bolsas no exterior",
    tipoSugerido: "intercambio",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://partiuintercambio.org/bolsas-de-estudo-2026-intercambio-gratuito/",
    titulo: "Partiu Intercâmbio — Bolsas 2026",
    tipoSugerido: "intercambio",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://querobolsa.com.br/revista/senac-oferece-mais-de-45-mil-cursos-gratuitos",
    titulo: "Senac — Cursos gratuitos (Quero Bolsa)",
    tipoSugerido: "curso",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://noticias.portaldaindustria.com.br/noticias/educacao/petrobras-e-senai-abrem-480-vagas-em-cursos-tecnicos-gratuitos-com-bolsa-de-ate-r-858/",
    titulo: "Petrobras e SENAI — Cursos técnicos com bolsa",
    tipoSugerido: "curso",
    areaSugerida: "Engenharia",
  },
  {
    url: "https://www.icara.sc.gov.br/noticias/noticia?post=icara-oferece-bolsas-100-gratuitas-para-curso-de-fonoaudiologia-56406",
    titulo: "Içara (SC) — Bolsas de Fonoaudiologia",
    tipoSugerido: "bolsa",
    areaSugerida: "Saúde",
  },
  {
    url: "https://catracalivre.com.br/educacao/uniube-oferece-2-mil-bolsas-de-estudo-100-gratuitas/",
    titulo: "Uniube — 2 mil bolsas integrais",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://g1.globo.com/ba/bahia/blogdoemprego/noticia/2026/03/26/curso-gratuito-na-bahia.ghtml",
    titulo: "Cursos gratuitos na Bahia (G1)",
    tipoSugerido: "curso",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://forbes.com.br/carreira/2026/02/santander-e-alura-oferecem-36-mil-bolsas-de-estudo-em-tecnologia-e-ia/",
    titulo: "Santander e Alura — Bolsas em tecnologia e IA",
    tipoSugerido: "bolsa",
    areaSugerida: "Ciência da Computação",
  },
  {
    url: "https://www.cnnbrasil.com.br/educacao/mover-e-ef-abrem-11-mil-bolsas-gratuitas-de-6-idiomas-para-pessoas-negras/",
    titulo: "Mover e EF — Bolsas de idiomas para pessoas negras",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://meutudo.com.br/blog/universidade-gratuita/",
    titulo: "Universidades gratuitas no Brasil (Meu Tudo)",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://agendasorocaba.com.br/listas-novidades/senac-sorocaba-oferece-339-bolsas-de-estudo-gratuitas-ate-junho/",
    titulo: "Senac Sorocaba — Bolsas de estudo",
    tipoSugerido: "bolsa",
    areaSugerida: "Multidisciplinar",
  },
  {
    url: "https://itforum.com.br/noticias/novas-vagas-bolsas-estudo/",
    titulo: "IT Forum — Vagas e bolsas de estudo",
    tipoSugerido: "bolsa",
    areaSugerida: "Ciência da Computação",
  },
]

function createStore(): FontesStore {
  const snapshot = readSnapshot();
  if (snapshot && snapshot.fontes.length > 0) {
    return {
      items: new Map(
        snapshot.fontes.map((fonte) => [
          fonte.id,
          { ...fonte, areaSugerida: fonte.areaSugerida ?? null },
        ])
      ),
    };
  }
  const items = new Map<string, Fonte>();
  const now = new Date().toISOString();
  for (const seed of SEED_FONTES) {
    const id = slugify(seed.titulo ?? seed.url) || crypto.randomUUID().slice(0, 8);
    items.set(id, {
      id,
      url: seed.url,
      titulo: seed.titulo,
      tipoSugerido: seed.tipoSugerido,
      areaSugerida: seed.areaSugerida ?? null,
      status: "pendente",
      ultimaColeta: null,
      itensEncontrados: 0,
      itensAbertos: 0,
      erro: null,
      criadaEm: now,
    });
  }
  return { items };
}

function getStore() {
  if (!globalForFontes.__oportunaFontes) {
    globalForFontes.__oportunaFontes = createStore();
    ensureSeedFontes();
  }
  return globalForFontes.__oportunaFontes;
}

function touch() {
  persistFontes([...getStore().items.values()]);
}

export function listFontes() {
  ensureSeedFontes();
  return [...getStore().items.values()].sort((a, b) =>
    a.criadaEm.localeCompare(b.criadaEm)
  );
}

export function getFonte(id: string) {
  return getStore().items.get(id) ?? null;
}

export function findFonteByUrl(url: string) {
  const normalized = normalizeUrl(url);
  return (
    [...getStore().items.values()].find((fonte) => normalizeUrl(fonte.url) === normalized) ??
    null
  );
}

export function normalizeUrl(raw: string) {
  const url = new URL(raw);
  url.hash = "";
  if (url.pathname.endsWith("/") && url.pathname.length > 1) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
}

export function createFonte(input: {
  url: string;
  titulo?: string | null;
  tipoSugerido?: TipoOportunidade | null;
  areaSugerida?: string | null;
}): Fonte {
  const existing = findFonteByUrl(input.url);
  if (existing) return existing;
  const now = new Date().toISOString();
  const base = slugify(input.titulo || new URL(input.url).hostname);
  const id = getStore().items.has(base) ? `${base}-${crypto.randomUUID().slice(0, 6)}` : base;
  const fonte: Fonte = {
    id,
    url: input.url,
    titulo: input.titulo?.trim() || null,
    tipoSugerido: input.tipoSugerido ?? null,
    areaSugerida: input.areaSugerida?.trim() || null,
    status: "pendente",
    ultimaColeta: null,
    itensEncontrados: 0,
    itensAbertos: 0,
    erro: null,
    criadaEm: now,
  };
  getStore().items.set(id, fonte);
  touch();
  return fonte;
}

export function ensureSeedFontes() {
  for (const fonte of [...getStore().items.values()]) {
    if (ehHostDeArtigo(fonte.url) || /tech\.ifood\.com\.br/i.test(fonte.url)) {
      deleteByFonte(fonte.id);
      getStore().items.delete(fonte.id);
    }
  }
  touch();
  for (const seed of SEED_FONTES) {
    createFonte({
      url: seed.url,
      titulo: seed.titulo,
      tipoSugerido: seed.tipoSugerido,
      areaSugerida: seed.areaSugerida ?? null,
    });
  }
}

export function updateFonte(id: string, patch: Partial<Fonte>) {
  const current = getStore().items.get(id);
  if (!current) return null;
  const next = { ...current, ...patch, id };
  getStore().items.set(id, next);
  touch();
  return next;
}

export function deleteFonte(id: string) {
  const removed = getStore().items.delete(id);
  if (removed) touch();
  return removed;
}
