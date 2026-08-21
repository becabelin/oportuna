import { slugify } from "./format";
import type { Fonte, TipoOportunidade } from "./types";

type FontesStore = {
  items: Map<string, Fonte>;
};

const globalForFontes = globalThis as unknown as { __oportunaFontes?: FontesStore };

export const SEED_FONTES: Array<Pick<Fonte, "url" | "titulo" | "tipoSugerido">> = [
  {
    url: "https://www.scholars4dev.com/feed/",
    titulo: "Scholars4Dev",
    tipoSugerido: "bolsa",
  },
  {
    url: "https://www.chevening.org/scholarships/",
    titulo: "Chevening Scholarships",
    tipoSugerido: "bolsa",
  },
  {
    url: "https://www.gov.br/cnpq/pt-br",
    titulo: "CNPq",
    tipoSugerido: "bolsa",
  },
];

function createStore(): FontesStore {
  const items = new Map<string, Fonte>();
  const now = new Date().toISOString();
  for (const seed of SEED_FONTES) {
    const id = slugify(seed.titulo ?? seed.url) || crypto.randomUUID().slice(0, 8);
    items.set(id, {
      id,
      url: seed.url,
      titulo: seed.titulo,
      tipoSugerido: seed.tipoSugerido,
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
  }
  return globalForFontes.__oportunaFontes;
}

export function listFontes() {
  return [...getStore().items.values()].sort((a, b) =>
    a.criadaEm.localeCompare(b.criadaEm)
  );
}

export function getFonte(id: string) {
  return getStore().items.get(id) ?? null;
}

export function findFonteByUrl(url: string) {
  const normalized = normalizeUrl(url);
  return listFontes().find((fonte) => normalizeUrl(fonte.url) === normalized) ?? null;
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
    status: "pendente",
    ultimaColeta: null,
    itensEncontrados: 0,
    itensAbertos: 0,
    erro: null,
    criadaEm: now,
  };
  getStore().items.set(id, fonte);
  return fonte;
}

export function updateFonte(id: string, patch: Partial<Fonte>) {
  const current = getStore().items.get(id);
  if (!current) return null;
  const next = { ...current, ...patch, id };
  getStore().items.set(id, next);
  return next;
}

export function deleteFonte(id: string) {
  return getStore().items.delete(id);
}
