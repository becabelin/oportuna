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

function discoGravavel() {
  return process.env.VERCEL !== "1";
}

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
  if (!discoGravavel()) {
    pending = {};
    return;
  }
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
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code?: unknown }).code)
        : "";
    if (code === "EROFS" || code === "EPERM" || code === "EACCES") return;
    console.warn("[trilha] não foi possível gravar data/base.json", error);
  }
}

export function persistOportunidades(items: Oportunidade[]) {
  if (!discoGravavel()) return;
  pending.oportunidades = items;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 120);
}

export function persistFontes(items: Fonte[]) {
  if (!discoGravavel()) return;
  pending.fontes = items;
  if (timer) clearTimeout(timer);
  timer = setTimeout(flush, 120);
}

export function persistNow() {
  if (!discoGravavel()) {
    pending = {};
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    return;
  }
  if (timer) {
    clearTimeout(timer);
    flush();
  }
}
