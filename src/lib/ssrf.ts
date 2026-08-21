import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.internal",
]);

function ipv4ToInt(ip: string) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return null;
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isPrivateIPv4(ip: string) {
  const n = ipv4ToInt(ip);
  if (n === null) return false;
  return (
    n <= 0xffffffff &&
    (n >>> 24 === 10 ||
      n >>> 24 === 127 ||
      n >>> 24 === 0 ||
      (n >>> 24 === 169 && ((n >>> 16) & 0xff) === 254) ||
      (n >>> 24 === 172 && ((n >>> 16) & 0xff) >= 16 && ((n >>> 16) & 0xff) <= 31) ||
      (n >>> 24 === 192 && ((n >>> 16) & 0xff) === 168) ||
      (n >>> 24 === 100 && ((n >>> 16) & 0xff) >= 64 && ((n >>> 16) & 0xff) <= 127))
  );
}

function isPrivateIPv6(ip: string) {
  const lower = ip.toLowerCase();
  return (
    lower === "::1" ||
    lower.startsWith("fe80:") ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("::ffff:")
  );
}

export function isPrivateAddress(address: string) {
  const version = isIP(address);
  if (version === 4) return isPrivateIPv4(address);
  if (version === 6) return isPrivateIPv6(address);
  return false;
}

export async function assertPublicHttpUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("URL inválida.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Use uma URL http ou https.");
  }
  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("Este endereço não pode ser coletado.");
  }
  if (isPrivateAddress(host)) {
    throw new Error("Este endereço não pode ser coletado.");
  }
  try {
    const resolved = await lookup(host, { all: true });
    if (resolved.some((entry) => isPrivateAddress(entry.address))) {
      throw new Error("Este endereço não pode ser coletado.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("não pode ser coletado")) {
      throw error;
    }
    throw new Error("Não foi possível resolver o domínio da URL.");
  }
  return url;
}
