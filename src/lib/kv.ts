import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;
let warned = false;

export function temKv() {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  if (!temKv()) {
    client = null;
    if (process.env.VERCEL && !warned) {
      warned = true;
      console.warn(
        "[trilha] sem Upstash Redis: chaves e cotas ficam só nesta instância. Defina UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN."
      );
    }
    return null;
  }
  client = Redis.fromEnv();
  return client;
}
