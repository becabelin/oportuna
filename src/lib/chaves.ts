import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { getRedis } from "./kv";
import { LIMITES_API, LIMITE_PEDIDOS_POR_HORA } from "./limites-api";
import { checarHora, checarJanela } from "./rate-limit";

export type ChaveRegistro = {
  id: string;
  hash: string;
  prefixo: string;
  nome: string;
  email: string;
  projeto: string;
  status: "ativa" | "revogada";
  criadaEm: string;
  ultimoUsoEm: string | null;
  usos: number;
};

export type ChavePublica = Omit<ChaveRegistro, "hash">;

export type ChaveEmitida = ChavePublica & { chave: string };

const KEYS_PATH = path.join(process.cwd(), "data", "chaves.json");
const REDIS_IDS = "trilha:chaves";

type Store = {
  byHash: Map<string, ChaveRegistro>;
  byId: Map<string, ChaveRegistro>;
  hydrated: boolean;
};

const globalForKeys = globalThis as unknown as { __oportunaChaves?: Store };

function emptyStore(): Store {
  return { byHash: new Map(), byId: new Map(), hydrated: false };
}

function getStore(): Store {
  if (!globalForKeys.__oportunaChaves) {
    globalForKeys.__oportunaChaves = emptyStore();
  }
  return globalForKeys.__oportunaChaves;
}

function hashChave(valor: string) {
  return createHash("sha256").update(valor).digest("hex");
}

function prefixoDe(chave: string) {
  return chave.slice(0, 12);
}

function semHash(item: ChaveRegistro): ChavePublica {
  const { hash: _hash, ...rest } = item;
  return rest;
}

function remember(item: ChaveRegistro) {
  const store = getStore();
  store.byHash.set(item.hash, item);
  store.byId.set(item.id, item);
}

function all(): ChaveRegistro[] {
  return [...getStore().byId.values()].sort((a, b) => b.criadaEm.localeCompare(a.criadaEm));
}

type DiscoAntigo = Partial<ChaveRegistro> & { chave?: string };

function migrarRegistro(raw: DiscoAntigo): ChaveRegistro | null {
  if (typeof raw.id !== "string" || typeof raw.nome !== "string") return null;
  const plaintext =
    typeof raw.chave === "string" && raw.chave.startsWith("opt_") ? raw.chave : null;
  const hash =
    typeof raw.hash === "string" && raw.hash.length === 64
      ? raw.hash
      : plaintext
        ? hashChave(plaintext)
        : null;
  if (!hash) return null;
  const prefixo =
    typeof raw.prefixo === "string" && raw.prefixo.startsWith("opt_")
      ? raw.prefixo
      : plaintext
        ? prefixoDe(plaintext)
        : `opt_${raw.id.slice(0, 8)}`;
  return {
    id: raw.id,
    hash,
    prefixo,
    nome: raw.nome,
    email: typeof raw.email === "string" ? raw.email : "",
    projeto: typeof raw.projeto === "string" ? raw.projeto : "",
    status: raw.status === "revogada" ? "revogada" : "ativa",
    criadaEm: typeof raw.criadaEm === "string" ? raw.criadaEm : new Date().toISOString(),
    ultimoUsoEm: typeof raw.ultimoUsoEm === "string" ? raw.ultimoUsoEm : null,
    usos: typeof raw.usos === "number" ? raw.usos : 0,
  };
}

function loadFromDisk(): ChaveRegistro[] {
  try {
    if (!existsSync(KEYS_PATH)) return [];
    const parsed = JSON.parse(readFileSync(KEYS_PATH, "utf8")) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => migrarRegistro(item as DiscoAntigo))
      .filter((item): item is ChaveRegistro => Boolean(item));
  } catch {
    return [];
  }
}

function persistDisk() {
  try {
    mkdirSync(path.dirname(KEYS_PATH), { recursive: true });
    writeFileSync(KEYS_PATH, `${JSON.stringify(all(), null, 2)}\n`);
  } catch (error) {
    console.warn("[trilha] não foi possível gravar data/chaves.json", error);
  }
}

async function persistRedis(item: ChaveRegistro) {
  const redis = getRedis();
  if (!redis) return;
  await redis
    .pipeline()
    .set(`trilha:chave:id:${item.id}`, item)
    .set(`trilha:chave:hash:${item.hash}`, item)
    .sadd(REDIS_IDS, item.id)
    .exec();
}

async function ensureStore() {
  const store = getStore();
  if (store.hydrated) return store;
  const redis = getRedis();
  if (redis) {
    const ids = await redis.smembers(REDIS_IDS);
    if (ids.length > 0) {
      const records = (await redis.mget(
        ...ids.map((id) => `trilha:chave:id:${id}`)
      )) as (ChaveRegistro | null)[];
      for (const item of records) {
        if (item && item.id && item.hash) remember(item);
      }
    } else {
      for (const item of loadFromDisk()) {
        remember(item);
        await persistRedis(item);
      }
    }
  } else {
    for (const item of loadFromDisk()) remember(item);
  }
  store.hydrated = true;
  return store;
}

async function save(item: ChaveRegistro) {
  remember(item);
  persistDisk();
  await persistRedis(item);
}

export async function emitirChave(input: {
  nome: string;
  email: string;
  projeto: string;
}): Promise<ChaveEmitida> {
  await ensureStore();
  const agora = new Date().toISOString();
  const chave = `opt_${randomBytes(18).toString("hex")}`;
  const item: ChaveRegistro = {
    id: randomBytes(6).toString("hex"),
    hash: hashChave(chave),
    prefixo: prefixoDe(chave),
    nome: input.nome,
    email: input.email,
    projeto: input.projeto,
    status: "ativa",
    criadaEm: agora,
    ultimoUsoEm: null,
    usos: 0,
  };
  await save(item);
  return { ...semHash(item), chave };
}

export async function encontrarChave(valor: string | null): Promise<ChaveRegistro | null> {
  if (!valor) return null;
  const hash = hashChave(valor);
  await ensureStore();
  const local = getStore().byHash.get(hash);
  if (local) return local.status === "ativa" ? local : null;
  const redis = getRedis();
  if (redis) {
    const remote = await redis.get<ChaveRegistro>(`trilha:chave:hash:${hash}`);
    if (remote?.id) {
      remember(remote);
      return remote.status === "ativa" ? remote : null;
    }
  }
  return null;
}

export async function registrarUso(id: string) {
  await ensureStore();
  const item = getStore().byId.get(id);
  if (!item) return;
  item.usos += 1;
  item.ultimoUsoEm = new Date().toISOString();
  const redis = getRedis();
  if (redis) {
    await persistRedis(item);
    return;
  }
  persistDisk();
}

export async function listarChaves(): Promise<ChavePublica[]> {
  await ensureStore();
  return all().map(semHash);
}

export async function revogarChave(id: string): Promise<ChavePublica | null> {
  await ensureStore();
  let item = getStore().byId.get(id) ?? null;
  if (!item) {
    const redis = getRedis();
    if (redis) {
      item = (await redis.get<ChaveRegistro>(`trilha:chave:id:${id}`)) ?? null;
      if (item) remember(item);
    }
  }
  if (!item) return null;
  item.status = "revogada";
  await save(item);
  return semHash(item);
}

export async function checarLimite(chaveId: string) {
  return checarJanela("chave", chaveId, LIMITES_API);
}

export async function checarPedidoPorIp(ip: string) {
  const result = await checarHora("pedido-chave-hora", ip, LIMITE_PEDIDOS_POR_HORA);
  return result;
}

export { LIMITES_API };
