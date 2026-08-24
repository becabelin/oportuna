import { getRedis } from "./kv";

export type LimitesJanela = {
  porMinuto: number;
  porDia: number;
};

export type ResultadoLimite =
  | {
      ok: true;
      restanteMinuto: number;
      restanteDia: number;
      limiteMinuto: number;
      limiteDia: number;
    }
  | {
      ok: false;
      motivo: "minuto" | "hora" | "dia";
      limite: number;
      restanteMinuto: number;
      restanteDia: number;
      limiteMinuto: number;
      limiteDia: number;
      retryAfterSec: number;
    };

type Bucket = {
  minute: number;
  day: number;
  minuteCount: number;
  dayCount: number;
};

type HourBucket = { hour: number; count: number };

const globalFor = globalThis as unknown as {
  __trilhaRateBuckets?: Map<string, Bucket>;
  __trilhaHourBuckets?: Map<string, HourBucket>;
};

function buckets() {
  if (!globalFor.__trilhaRateBuckets) {
    globalFor.__trilhaRateBuckets = new Map();
  }
  return globalFor.__trilhaRateBuckets;
}

function hourBuckets() {
  if (!globalFor.__trilhaHourBuckets) {
    globalFor.__trilhaHourBuckets = new Map();
  }
  return globalFor.__trilhaHourBuckets;
}

function segundosAte(tamanhoMs: number, agora: number) {
  return Math.max(1, Math.ceil((tamanhoMs - (agora % tamanhoMs)) / 1000));
}

function resultado(
  minuteCount: number,
  dayCount: number,
  limites: LimitesJanela,
  agora: number
): ResultadoLimite {
  const restanteMinuto = Math.max(0, limites.porMinuto - minuteCount);
  const restanteDia = Math.max(0, limites.porDia - dayCount);
  if (minuteCount > limites.porMinuto) {
    return {
      ok: false,
      motivo: "minuto",
      limite: limites.porMinuto,
      restanteMinuto: 0,
      restanteDia,
      limiteMinuto: limites.porMinuto,
      limiteDia: limites.porDia,
      retryAfterSec: segundosAte(60_000, agora),
    };
  }
  if (dayCount > limites.porDia) {
    return {
      ok: false,
      motivo: "dia",
      limite: limites.porDia,
      restanteMinuto,
      restanteDia: 0,
      limiteMinuto: limites.porMinuto,
      limiteDia: limites.porDia,
      retryAfterSec: segundosAte(86_400_000, agora),
    };
  }
  return {
    ok: true,
    restanteMinuto,
    restanteDia,
    limiteMinuto: limites.porMinuto,
    limiteDia: limites.porDia,
  };
}

function memoryBucket(key: string, agora: number, increment: boolean) {
  const minute = Math.floor(agora / 60_000);
  const day = Math.floor(agora / 86_400_000);
  const map = buckets();
  const current = map.get(key) ?? {
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
  if (increment) {
    current.minuteCount += 1;
    current.dayCount += 1;
  }
  map.set(key, current);
  return current;
}

async function redisCounts(
  escopo: string,
  id: string,
  agora: number,
  increment: boolean
) {
  const redis = getRedis();
  if (!redis) return null;
  const minute = Math.floor(agora / 60_000);
  const day = Math.floor(agora / 86_400_000);
  const minuteKey = `trilha:rl:${escopo}:${id}:m:${minute}`;
  const dayKey = `trilha:rl:${escopo}:${id}:d:${day}`;
  if (!increment) {
    const values = (await redis.mget(minuteKey, dayKey)) as (number | null)[];
    return {
      minuteCount: Number(values[0] ?? 0),
      dayCount: Number(values[1] ?? 0),
    };
  }
  const [minuteCount, dayCount] = (await redis
    .pipeline()
    .incr(minuteKey)
    .expire(minuteKey, 120)
    .incr(dayKey)
    .expire(dayKey, 172_800)
    .exec()) as [number, unknown, number, unknown];
  return { minuteCount: Number(minuteCount), dayCount: Number(dayCount) };
}

export async function consultarJanela(
  escopo: string,
  id: string,
  limites: LimitesJanela
): Promise<ResultadoLimite> {
  const agora = Date.now();
  const fromRedis = await redisCounts(escopo, id, agora, false);
  if (fromRedis) {
    return resultado(fromRedis.minuteCount, fromRedis.dayCount, limites, agora);
  }
  const current = memoryBucket(`${escopo}:${id}`, agora, false);
  return resultado(current.minuteCount, current.dayCount, limites, agora);
}

export async function checarJanela(
  escopo: string,
  id: string,
  limites: LimitesJanela
): Promise<ResultadoLimite> {
  const agora = Date.now();
  const fromRedis = await redisCounts(escopo, id, agora, true);
  if (fromRedis) {
    return resultado(fromRedis.minuteCount, fromRedis.dayCount, limites, agora);
  }
  const current = memoryBucket(`${escopo}:${id}`, agora, true);
  return resultado(current.minuteCount, current.dayCount, limites, agora);
}

export async function checarHora(escopo: string, id: string, limite: number) {
  const agora = Date.now();
  const hour = Math.floor(agora / 3_600_000);
  const redis = getRedis();
  if (redis) {
    const key = `trilha:rl:${escopo}:${id}:h:${hour}`;
    const count = Number(await redis.incr(key));
    await redis.expire(key, 7_200);
    if (count > limite) {
      return {
        ok: false as const,
        retryAfterSec: segundosAte(3_600_000, agora),
      };
    }
    return { ok: true as const };
  }
  const map = hourBuckets();
  const key = `${escopo}:${id}`;
  const current = map.get(key) ?? { hour, count: 0 };
  if (current.hour !== hour) {
    current.hour = hour;
    current.count = 0;
  }
  current.count += 1;
  map.set(key, current);
  if (current.count > limite) {
    return {
      ok: false as const,
      retryAfterSec: segundosAte(3_600_000, agora),
    };
  }
  return { ok: true as const };
}

export function headersLimite(limite: ResultadoLimite): Record<string, string> {
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limite.limiteMinuto),
    "X-RateLimit-Remaining": String(limite.restanteMinuto),
    "X-RateLimit-Limit-Day": String(limite.limiteDia),
    "X-RateLimit-Remaining-Day": String(limite.restanteDia),
  };
  if (!limite.ok) {
    headers["Retry-After"] = String(limite.retryAfterSec);
  }
  return headers;
}
