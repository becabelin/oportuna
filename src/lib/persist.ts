import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { Fonte, Oportunidade } from "./types";

export type Snapshot = {
  oportunidades: Oportunidade[];
  fontes: Fonte[];
};

const DB_PATH = path.join(process.cwd(), "data", "base.json");

let pending: Partial<Snapshot> = {};
let timer: ReturnType<typeof setTimeout> | null = null;

export function dbPath() {
  return DB_PATH;
}

export function readSnapshot(): Snapshot | null {
  try {
    if (!existsSync(DB_PATH)) return null;
    const parsed = JSON.parse(readFileSync(DB_PATH, "utf8")) as Partial<Snapshot>;
    if (!Array.isArray(parsed.oportunidades) && !Array.isArray(parsed.fontes)) {
      return null;
    }
    return {
      oportunidades: parsed.oportunidades ?? [],
      fontes: parsed.fontes ?? [],
    };
  } catch {
    return null;
  }
}

function flush() {
  timer = null;
  const current = readSnapshot() ?? { oportunidades: [], fontes: [] };
  const next: Snapshot = {
    oportunidades: pending.oportunidades ?? current.oportunidades,
    fontes: pending.fontes ?? current.fontes,
  };
  pending = {};
  try {
    mkdirSync(path.dirname(DB_PATH), { recursive: true });
    writeFileSync(DB_PATH, `${JSON.stringify(next, null, 2)}\n`);
  } catch (error) {
    console.warn("[oportuna] não foi possível gravar data/base.json", error);
  }
}

export function persistOportunidades(items: Oportunidade[]) {
  pending.oportunidades = items;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 120);
}

export function persistFontes(items: Fonte[]) {
  pending.fontes = items;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 120);
}

export function persistNow() {
  if (timer) {
    clearTimeout(timer);
    flush();
  }
}
