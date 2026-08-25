import { capitalizeTags, isOpen, slugify } from "./format";
import {
  ehGanchoMarketing,
  ehHubSantanderOpenAcademy,
  ehLixoDeColeta,
  ehNomeDeFonte,
  ehSubtituloMolde,
  enxugarFicha,
  enxugarTituloNoticia,
  gerarSubtitulo,
  limparTextoColetado,
  pareceOportunidade,
  pareceTitulo,
  titulosParecidos,
} from "./triagem";
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

const globalForStore = globalThis as unknown as { __trilhaGeminiEstudantes2026?: Store };

function withOrigem(
  item: Omit<Oportunidade, "origem" | "fonteId" | "fonteUrl" | "subtitulo" | "imagemUrl" | "enriquecidoEm"> &
    Partial<Oportunidade>
): Oportunidade {
  const tags = capitalizeTags(
    (item.tags ?? []).filter((tag) => tag.toLowerCase() !== "coletada")
  );
  const base = {
    origem: item.origem ?? "manual",
    fonteId: item.fonteId ?? null,
    fonteUrl: item.fonteUrl ?? null,
    imagemUrl: item.imagemUrl ?? null,
    enriquecidoEm: item.enriquecidoEm ?? null,
    tags,
  };

  if (item.enriquecidoEm) {
    return {
      ...item,
      ...base,
      titulo: item.titulo,
      descricao: limparTextoColetado(item.descricao),
      subtitulo: item.subtitulo?.trim() || "",
    };
  }

  const ficha = enxugarFicha(item.titulo, item.descricao);
  const organizacao =
    ehNomeDeFonte(item.organizacao) && ficha.instituicao
      ? ficha.instituicao
      : item.organizacao;
  const cidadeGuardada = item.cidade?.trim() || "";
  const cidade =
    ficha.cidade ||
    (cidadeGuardada && !/\b(fellowship|level \d)\b/i.test(cidadeGuardada) ? cidadeGuardada : null);
  const titulo = enxugarTituloNoticia(ficha.titulo);
  const descricao = limparTextoColetado(ficha.descricao);
  const atual = item.subtitulo?.trim() ?? "";
  const manterAtual =
    Boolean(atual) &&
    !ehSubtituloMolde(atual) &&
    !pareceTitulo(atual, titulo) &&
    !pareceTitulo(atual, item.titulo) &&
    !ehGanchoMarketing(atual) &&
    !/\binstitu(?:i)?tion\s*:/i.test(atual) &&
    !/\binstitui[cç][aã]o\s*:/i.test(atual) &&
    !/\b(fellowship|level \d|doctorate|technical training)\b/i.test(atual) &&
    !/o post\s+.+\s+apareceu primeiro/i.test(atual);
  const resumoFicha = [ficha.instituicao, ficha.cidade].filter(Boolean).join(", ");
  const gerado = gerarSubtitulo({
    titulo,
    descricao,
    tipo: item.tipo,
    organizacao,
    prazoInscricao: item.prazoInscricao,
  });
  return {
    ...item,
    titulo,
    descricao,
    organizacao,
    cidade,
    subtitulo: manterAtual ? atual : gerado || resumoFicha,
    ...base,
  };
}

function mesmaUrl(a: string, b: string) {
  const cortar = (value: string) => {
    try {
      const url = new URL(value);
      return `${url.origin}${url.pathname}`.replace(/\/+$/, "").toLowerCase();
    } catch {
      return value.replace(/\/+$/, "").toLowerCase();
    }
  };
  return cortar(a) === cortar(b);
}

function valeNoMural(item: Oportunidade) {
  if (ehHubSantanderOpenAcademy(item.urlInscricao)) return false;
  if (item.origem !== "coleta") return true;
  if (item.fonteUrl && mesmaUrl(item.urlInscricao, item.fonteUrl)) return false;
  if (ehLixoDeColeta(item)) return false;
  return pareceOportunidade({
    titulo: item.titulo,
    descricao: item.descricao,
    url: item.urlInscricao || item.fonteUrl || undefined,
  });
}

function pontuacaoDeItem(item: Oportunidade) {
  return (
    (item.origem === "manual" ? 10 : 0) +
    (item.descricao.length > 120 ? 2 : 0) +
    (item.prazoInscricao ? 1 : 0) +
    (item.subtitulo.length > 40 ? 1 : 0)
  );
}

function removerDuplicatas(store: Store) {
  const ordered = [...store.items.values()].sort(
    (a, b) => pontuacaoDeItem(b) - pontuacaoDeItem(a)
  );
  const kept: Oportunidade[] = [];
  let mudou = false;
  for (const item of ordered) {
    if (kept.some((atual) => titulosParecidos(atual.titulo, item.titulo))) {
      store.items.delete(item.id);
      mudou = true;
      continue;
    }
    kept.push(item);
  }
  return mudou;
}

function createStore(): Store {
  const snapshot = readSnapshot();
  if (snapshot && snapshot.oportunidades.length > 0) {
    return {
      items: new Map(
        snapshot.oportunidades
          .filter((item) => valeNoMural(item))
          .map((item) => [item.id, withOrigem(item)])
      ),
    };
  }
  return {
    items: new Map(SEED.map((item) => [item.id, withOrigem(item)])),
  };
}

function sanitizar(store: Store) {
  let mudou = false;
  for (const [id, item] of [...store.items.entries()]) {
    if (!valeNoMural(item)) {
      store.items.delete(id);
      mudou = true;
      continue;
    }
    const next = withOrigem(item);
    if (
      next.subtitulo !== item.subtitulo ||
      next.tags.join("|") !== item.tags.join("|") ||
      next.titulo !== item.titulo ||
      next.descricao !== item.descricao ||
      next.cidade !== item.cidade ||
      next.organizacao !== item.organizacao
    ) {
      store.items.set(id, next);
      mudou = true;
    }
  }
  if (removerDuplicatas(store)) mudou = true;
  if (mudou) persistOportunidades([...store.items.values()]);
}

function getStore(): Store {
  if (!globalForStore.__trilhaGeminiEstudantes2026) {
    globalForStore.__trilhaGeminiEstudantes2026 = createStore();
    sanitizar(globalForStore.__trilhaGeminiEstudantes2026);
    const seedIds = new Set(SEED.map((item) => item.id));
    const seedUrls = new Set(SEED.map((item) => item.urlInscricao));
    let added = false;
    for (const item of SEED) {
      const current = globalForStore.__trilhaGeminiEstudantes2026.items.get(item.id);
      globalForStore.__trilhaGeminiEstudantes2026.items.set(
        item.id,
        withOrigem({
          ...item,
          imagemUrl: current?.imagemUrl ?? null,
        })
      );
      added = true;
    }
    for (const [id, item] of [...globalForStore.__trilhaGeminiEstudantes2026.items.entries()]) {
      if (seedIds.has(id)) continue;
      if (seedUrls.has(item.urlInscricao)) {
        globalForStore.__trilhaGeminiEstudantes2026.items.delete(id);
        added = true;
      }
    }
    if (removerDuplicatas(globalForStore.__trilhaGeminiEstudantes2026)) added = true;
    if (added) persistOportunidades([...globalForStore.__trilhaGeminiEstudantes2026.items.values()]);
  }
  return globalForStore.__trilhaGeminiEstudantes2026;
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
    item.subtitulo,
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
  const item = withOrigem({
    ...input,
    id: uniqueId(input.titulo),
    criadoEm: now,
    atualizadoEm: now,
  });
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

export function listFichasPendentesDeLeitura() {
  return allItems()
    .filter((item) => item.origem === "coleta" && !item.enriquecidoEm)
    .sort((a, b) => (a.prazoInscricao ?? "9999").localeCompare(b.prazoInscricao ?? "9999"));
}

export function upsertColetada(input: NovaOportunidade): Oportunidade {
  const existing = findByUrlInscricao(input.urlInscricao);
  if (existing?.origem === "manual") {
    return existing;
  }
  const rival = [...getStore().items.values()].find((item) =>
    titulosParecidos(item.titulo, input.titulo)
  );
  if (rival?.origem === "manual") return rival;
  if (existing) {
    if (existing.enriquecidoEm) {
      return (
        updateOportunidade(existing.id, {
          prazoInscricao: input.prazoInscricao ?? existing.prazoInscricao,
          imagemUrl: input.imagemUrl || existing.imagemUrl,
          origem: "coleta",
          fonteId: input.fonteId,
          fonteUrl: input.fonteUrl,
        }) ?? existing
      );
    }
    return (
      updateOportunidade(existing.id, {
        ...input,
        origem: "coleta",
        fonteId: input.fonteId,
        fonteUrl: input.fonteUrl,
        imagemUrl: input.imagemUrl || existing.imagemUrl,
        enriquecidoEm: null,
      }) ?? existing
    );
  }
  if (rival) return rival;
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
  globalForStore.__trilhaGeminiEstudantes2026 = createStore();
  touch();
}
