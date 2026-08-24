import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

import { ehCapaFraca, ehCapaInutil, limparUrlImagem } from "./imagem-url";
import { parsePublicHttpUrl } from "./ssrf";

const SKIP_IMAGE =
  /favicon|apple-touch|sprite|pixel|1x1|tracking|wp-includes\/images|gravatar|placeholder/i;

export function resolverImagemUrl(raw: string | undefined | null, baseUrl: string): string | null {
  if (!raw) return null;
  const trimmed = limparUrlImagem(raw.split(/\s+/)[0] ?? "");
  if (!trimmed) return null;
  let absolute: URL;
  try {
    absolute = new URL(trimmed, baseUrl);
  } catch {
    return null;
  }
  if (absolute.protocol === "http:") absolute.protocol = "https:";
  if (SKIP_IMAGE.test(absolute.pathname) || SKIP_IMAGE.test(absolute.href)) return null;
  const safe = parsePublicHttpUrl(absolute.toString());
  if (!safe || ehCapaInutil(safe.toString())) return null;
  return safe.toString();
}

function imagemJsonLd(value: unknown, baseUrl: string): string | null {
  if (typeof value === "string") return resolverImagemUrl(value, baseUrl);
  if (Array.isArray(value)) {
    for (const entry of value) {
      const found = imagemJsonLd(entry, baseUrl);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === "object" && "url" in value) {
    return resolverImagemUrl(String((value as { url?: unknown }).url ?? ""), baseUrl);
  }
  return null;
}

function maiorNoSrcset(srcset: string | undefined, baseUrl: string): string | null {
  if (!srcset) return null;
  let best: { url: string; width: number } | null = null;
  for (const part of srcset.split(",")) {
    const [rawUrl, descriptor] = part.trim().split(/\s+/);
    if (!rawUrl) continue;
    const width = descriptor?.endsWith("w") ? Number.parseInt(descriptor, 10) : 0;
    if (!best || width >= best.width) best = { url: rawUrl, width };
  }
  return best ? resolverImagemUrl(best.url, baseUrl) : null;
}

function primeiraImg($root: cheerio.Cheerio<AnyNode>, baseUrl: string): string | null {
  const img = $root.find("img").first();
  return (
    maiorNoSrcset(img.attr("srcset") || img.attr("data-srcset"), baseUrl) ??
    resolverImagemUrl(
      img.attr("src") ||
        img.attr("data-src") ||
        img.attr("data-lazy-src") ||
        img.attr("data-original"),
      baseUrl
    )
  );
}

export function imagemNoDocumento($: CheerioAPI, baseUrl: string): string | null {
  const metas = [
    $("meta[property='og:image']").attr("content"),
    $("meta[property='og:image:url']").attr("content"),
    $("meta[name='twitter:image']").attr("content"),
    $("meta[name='twitter:image:src']").attr("content"),
    $("link[rel='image_src']").attr("href"),
  ];
  for (const value of metas) {
    const resolved = resolverImagemUrl(value, baseUrl);
    if (resolved) return resolved;
  }

  let jsonLd: string | null = null;
  $('script[type="application/ld+json"]').each((_, node) => {
    try {
      const parsed = JSON.parse($(node).text()) as unknown;
      const stack = Array.isArray(parsed) ? parsed : [parsed];
      for (const raw of stack) {
        if (!raw || typeof raw !== "object") continue;
        const record = raw as Record<string, unknown>;
        const nodes = Array.isArray(record["@graph"]) ? record["@graph"] : [record];
        for (const nodeItem of nodes) {
          if (!nodeItem || typeof nodeItem !== "object") continue;
          const found = imagemJsonLd((nodeItem as { image?: unknown }).image, baseUrl);
          if (found) {
            jsonLd = found;
            return false;
          }
        }
      }
    } catch {
      // JSON-LD malformado
    }
  });
  if (jsonLd) return jsonLd;

  const featured = $("img.wp-post-image, img.attachment-post-thumbnail, article img, main img").first();
  return (
    resolverImagemUrl(
      featured.attr("src") || featured.attr("data-src") || featured.attr("data-lazy-src"),
      baseUrl
    ) ?? primeiraImg($.root(), baseUrl)
  );
}

export function imagemNoItemFeed($: CheerioAPI, node: AnyNode, baseUrl: string): string | null {
  const el = $(node);
  const candidatos: Array<string | undefined> = [];

  el.find("enclosure").each((_, enclosure) => {
    const type = $(enclosure).attr("type") ?? "";
    if (/^image\//i.test(type)) candidatos.push($(enclosure).attr("url"));
  });
  el.find("media\\:content, media\\:thumbnail, content[url]").each((_, media) => {
    const type = $(media).attr("type") ?? $(media).attr("medium") ?? "";
    if (!type || /image/i.test(type)) {
      candidatos.push($(media).attr("url") || $(media).attr("href"));
    }
  });
  candidatos.push(el.find("itunes\\:image, image").first().attr("href"));
  candidatos.push(el.find("itunes\\:image, image").first().attr("url"));

  for (const value of candidatos) {
    const resolved = resolverImagemUrl(value, baseUrl);
    if (resolved) return resolved;
  }

  const encoded =
    el.find("content\\:encoded, content, description, summary").first().html() ??
    el.find("description, summary").first().text();
  if (encoded) {
    return primeiraImg(cheerio.load(encoded).root(), baseUrl);
  }
  return null;
}

export function imagemNoCard($: CheerioAPI, anchor: AnyNode, baseUrl: string): string | null {
  const card = $(anchor).closest("article, li, .post, .card, .evento, tr");
  return primeiraImg(card.length > 0 ? card : $(anchor).parent(), baseUrl);
}

export function imagemNoJsonFeedItem(item: Record<string, unknown>, baseUrl: string): string | null {
  const direto = imagemJsonLd(item.image ?? item.banner_image ?? item.photo, baseUrl);
  if (direto) return direto;
  const attachments = Array.isArray(item.attachments) ? item.attachments : [];
  for (const raw of attachments) {
    if (!raw || typeof raw !== "object") continue;
    const attachment = raw as Record<string, unknown>;
    const mime = String(attachment.mime_type ?? "");
    if (mime.startsWith("image/") || !mime) {
      const found = resolverImagemUrl(String(attachment.url ?? ""), baseUrl);
      if (found) return found;
    }
  }
  return null;
}
