import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { LIMITES_API, LIMITE_PEDIDOS_POR_HORA } from "./limites-api";

export type ChaveApi = {
  id: string;
  chave: string;
  nome: string;
  email: string;
  projeto: string;
  status: "ativa" | "revogada";
  criadaEm: string;
  ultimoUsoEm: string | null;
  usos: number;
};

const KEYS_PATH = path.join(process.cwd(), "data", "chaves.json");

type Store = { items: Map<string, ChaveApi> };

const globalForKeys = globalThis as unknown as { __oportunaChaves?: Store };

const LIMITE_POR_MINUTO = LIMITES_API.porMinuto;
const LIMITE_POR_DIA = LIMITES_API.porDia;

type Bucket = { minute: number; day: number; minuteCount: number; dayCount: number };
const buckets = new Map<string, Bucket>();

function loadFromDisk(): ChaveApi[] {
  try {
    if (!existsSync(KEYS_PATH)) return [];
    const parsed = JSON.parse(readFileSync(KEYS_PATH, "utf8")) as unknown;
    return Array.isArray(parsed) ? (parsed as ChaveApi[]) : [];
  } catch {
    return [];
  }
}

function persist(items: ChaveApi[]) {
  try {
    mkdirSync(path.dirname(KEYS_PATH), { recursive: true });
    writeFileSync(KEYS_PATH, `${JSON.stringify(items, null, 2)}\n`);
  } catch (error) {
    console.warn("[trilha] não foi possível gravar data/chaves.json", error);
  }
}

function getStore(): Store {
  if (!globalForKeys.__oportunaChaves) {
    globalForKeys.__oportunaChaves = {
      items: new Map(loadFromDisk().map((item) => [item.chave, item])),
    };
  }
  return globalForKeys.__oportunaChaves;
}

function all() {
  return [...getStore().items.values()];
}

export function emitirChave(input: { nome: string; email: string; projeto: string }): ChaveApi {
  const agora = new Date().toISOString();
  const item: ChaveApi = {
    id: randomBytes(6).toString("hex"),
    chave: `opt_${randomBytes(18).toString("hex")}`,
    nome: input.nome,
    email: input.email,
    projeto: input.projeto,
    status: "ativa",
    criadaEm: agora,
    ultimoUsoEm: null,
    usos: 0,
  };
  getStore().items.set(item.chave, item);
  persist(all());
  return item;
}

export function encontrarChave(valor: string | null) {
  if (!valor) return null;
  return getStore().items.get(valor) ?? null;
}

export function registrarUso(chave: string) {
  const item = getStore().items.get(chave);
  if (!item) return;
  item.usos += 1;
  item.ultimoUsoEm = new Date().toISOString();
}

export function checarLimite(chaveId: string) {
  const agora = Date.now();
  const minute = Math.floor(agora / 60_000);
  const day = Math.floor(agora / 86_400_000);
  const current = buckets.get(chaveId) ?? {
    minute,
    day,
    minuteCount: 0,
    dayCount: 0,
  };
  if (current.minute !== minute) {
    current.minute = minute;
    current.minuteCount = 0;
  }
  if (current.day !== day) {
    current.day = day;
    current.dayCount = 0;
  }
  current.minuteCount += 1;
  current.dayCount += 1;
  buckets.set(chaveId, current);
  if (current.minuteCount > LIMITE_POR_MINUTO) {
    return { ok: false as const, motivo: "minuto" as const, limite: LIMITE_POR_MINUTO };
  }
  if (current.dayCount > LIMITE_POR_DIA) {
    return { ok: false as const, motivo: "dia" as const, limite: LIMITE_POR_DIA };
  }
  return {
    ok: true as const,
    restanteMinuto: Math.max(0, LIMITE_POR_MINUTO - current.minuteCount),
    restanteDia: Math.max(0, LIMITE_POR_DIA - current.dayCount),
    limiteMinuto: LIMITE_POR_MINUTO,
    limiteDia: LIMITE_POR_DIA,
  };
}

const pedidosPorIp = new Map<string, { hour: number; count: number }>();

export function checarPedidoPorIp(ip: string) {
  const hour = Math.floor(Date.now() / 3_600_000);
  const current = pedidosPorIp.get(ip) ?? { hour, count: 0 };
  if (current.hour !== hour) {
    current.hour = hour;
    current.count = 0;
  }
  current.count += 1;
  pedidosPorIp.set(ip, current);
  return current.count <= LIMITE_PEDIDOS_POR_HORA;
}

export { LIMITES_API };
