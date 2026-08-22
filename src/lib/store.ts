import { isOpen } from "./format";
import { slugify } from "./format";
import { persistOportunidades, readSnapshot } from "./persist";
import { SEED } from "./seed";
import type {
  FiltrosOportunidade,
  NovaOportunidade,
  Oportunidade,
  PaginaOportunidades,
} from "./types";
import { TIPOS } from "./types";

type Store = {
  items: Map<string, Oportunidade>;
};

const globalForStore = globalThis as unknown as { __oportunaStore?: Store };

function withOrigem(item: Omit<Oportunidade, "origem" | "fonteId" | "fonteUrl"> & Partial<Oportunidade>): Oportunidade {
  return {
    ...item,
    origem: item.origem ?? "manual",
    fonteId: item.fonteId ?? null,
    fonteUrl: item.fonteUrl ?? null,
  };
}

function createStore(): Store {
  const snapshot = readSnapshot();
  if (snapshot && snapshot.oportunidades.length > 0) {
    return {
      items: new Map(snapshot.oportunidades.map((item) => [item.id, withOrigem(item)])),
    };
  }
  return {
    items: new Map(SEED.map((item) => [item.id, withOrigem(item)])),
  };
}

function getStore(): Store {
  if (!globalForStore.__oportunaStore) {
    globalForStore.__oportunaStore = createStore();
    let added = false;
    for (const item of SEED) {
      if (!globalForStore.__oportunaStore.items.has(item.id)) {
        globalForStore.__oportunaStore.items.set(item.id, withOrigem(item));
        added = true;
      }
    }
    if (added) persistOportunidades([...globalForStore.__oportunaStore.items.values()]);
  }
  return globalForStore.__oportunaStore;
}

function allItems() {
  return [...getStore().items.values()];
}

function touch() {
  persistOportunidades(allItems());
}

function matchesQuery(item: Oportunidade, q?: string) {
  if (!q) return true;
  const haystack = [
    item.titulo,
    item.organizacao,
    item.descricao,
    item.area,
    item.cidade ?? "",
    ...item.tags,
    ...item.requisitos,
  ]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term));
}

function sortItems(
  items: Oportunidade[],
  ordenar: FiltrosOportunidade["ordenar"]
) {
  const copy = [...items];
  if (ordenar === "titulo") {
    copy.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
    return copy;
  }
  if (ordenar === "recentes") {
    copy.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
    return copy;
  }
  copy.sort((a, b) => {
    if (!a.prazoInscricao && !b.prazoInscricao) return a.titulo.localeCompare(b.titulo);
    if (!a.prazoInscricao) return 1;
    if (!b.prazoInscricao) return -1;
    return a.prazoInscricao.localeCompare(b.prazoInscricao);
  });
  return copy;
}

export function listOportunidades(
  filtros: FiltrosOportunidade = {}
): PaginaOportunidades {
  const {
    q,
    tipo,
    area,
    nivel,
    modalidade,
    pais,
    status = "abertas",
    ordenar = "prazo",
    fonteId,
    origem,
    page = 1,
    limit = 20,
  } = filtros;

  const tipos = tipo ? (Array.isArray(tipo) ? tipo : [tipo]) : null;

  let items = [...getStore().items.values()].filter((item) => {
    if (tipos && !tipos.includes(item.tipo)) return false;
    if (area && item.area !== area) return false;
    if (nivel && item.nivel !== nivel) return false;
    if (modalidade && item.modalidade !== modalidade) return false;
    if (pais && item.pais !== pais) return false;
    if (fonteId && item.fonteId !== fonteId) return false;
    if (origem && item.origem !== origem) return false;
    if (status === "abertas" && !isOpen(item)) return false;
    if (status === "encerradas" && isOpen(item)) return false;
    if (!matchesQuery(item, q)) return false;
    return true;
  });

  items = sortItems(items, ordenar);
  const total = items.length;
  const start = (page - 1) * limit;
  const data = items.slice(start, start + limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export function getOportunidade(id: string) {
  return getStore().items.get(id) ?? null;
}

function uniqueId(titulo: string) {
  const base = slugify(titulo) || "oportunidade";
  const store = getStore();
  if (!store.items.has(base)) return base;
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export function createOportunidade(input: NovaOportunidade): Oportunidade {
  const now = new Date().toISOString();
  const item: Oportunidade = {
    ...input,
    origem: input.origem ?? "manual",
    fonteId: input.fonteId ?? null,
    fonteUrl: input.fonteUrl ?? null,
    id: uniqueId(input.titulo),
    criadoEm: now,
    atualizadoEm: now,
  };
  getStore().items.set(item.id, item);
  touch();
  return item;
}

export function updateOportunidade(
  id: string,
  patch: Partial<NovaOportunidade>
): Oportunidade | null {
  const current = getStore().items.get(id);
  if (!current) return null;
  const updated: Oportunidade = {
    ...current,
    ...patch,
    id,
    criadoEm: current.criadoEm,
    atualizadoEm: new Date().toISOString(),
  };
  getStore().items.set(id, updated);
  touch();
  return updated;
}

export function deleteOportunidade(id: string) {
  const removed = getStore().items.delete(id);
  if (removed) touch();
  return removed;
}

export function findByUrlInscricao(url: string) {
  return [...getStore().items.values()].find((item) => item.urlInscricao === url) ?? null;
}

export function upsertColetada(input: NovaOportunidade): Oportunidade {
  const existing = findByUrlInscricao(input.urlInscricao);
  if (existing) {
    return (
      updateOportunidade(existing.id, {
        ...input,
        origem: "coleta",
        fonteId: input.fonteId,
        fonteUrl: input.fonteUrl,
      }) ?? existing
    );
  }
  return createOportunidade({ ...input, origem: "coleta" });
}

export function deleteByFonte(fonteId: string) {
  const store = getStore();
  for (const item of store.items.values()) {
    if (item.fonteId === fonteId) store.items.delete(item.id);
  }
  touch();
}

export function taxonomia() {
  const all = [...getStore().items.values()];
  const countBy = <T extends string>(key: (item: Oportunidade) => T, values: T[]) =>
    values.map((value) => ({
      id: value,
      total: all.filter((item) => key(item) === value).length,
    }));

  const areas = [...new Set(all.map((item) => item.area))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
  const paises = [...new Set(all.map((item) => item.pais))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  return {
    tipos: countBy((item) => item.tipo, [...TIPOS]),
    areas: areas.map((id) => ({
      id,
      total: all.filter((item) => item.area === id).length,
    })),
    niveis: countBy((item) => item.nivel, [
      "ensino-medio",
      "graduacao",
      "pos-graduacao",
      "todos",
    ]),
    modalidades: countBy((item) => item.modalidade, [
      "presencial",
      "remoto",
      "hibrido",
    ]),
    paises: paises.map((id) => ({
      id,
      total: all.filter((item) => item.pais === id).length,
    })),
    total: all.length,
    abertas: all.filter(isOpen).length,
  };
}

export function resetStore() {
  globalForStore.__oportunaStore = createStore();
  touch();
}
