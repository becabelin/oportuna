export function limparUrlImagem(raw: string): string {
  let trimmed = raw.trim().replace(/^["']+|["']+$/g, "");
  trimmed = trimmed.replace(/^%22|%22$/g, "");
  const quoted = trimmed.match(/%22(https?:\/\/.+?)(?:%22|$)/i);
  if (quoted) trimmed = quoted[1];
  const nested = [...trimmed.matchAll(/https?:\/\/[^\s"'<>]+/g)].map((match) => match[0]);
  if (nested.length > 1) trimmed = nested[nested.length - 1];
  else if (nested.length === 1) trimmed = nested[0];
  trimmed = trimmed.replace(/\/?%22$/, "").replace(/^http:\/\//, "https://");
  trimmed = trimmed.replace(/\.pagespeed\.[a-z0-9._-]+$/i, "");
  trimmed = trimmed.replace(/-\d{2,4}x\d{2,4}(?=\.(?:jpe?g|png|webp|gif|avif)(?:$|\?))/i, "");
  return trimmed;
}

/** Pixel, favicon e tracking: nunca usar de capa. */
export function ehCapaInutil(url: string): boolean {
  const value = url.toLowerCase();
  return /favicon|apple-touch|sprite|pixel|1x1|tracking|gravatar|placeholder|-16x16|-32x32|\.ico(?:$|\?)/i.test(
    value
  );
}

/** Miniaturas, logos e thumbs que não servem de capa genérica. */
export function ehCapaFraca(url: string): boolean {
  const value = url.toLowerCase();
  return (
    ehCapaInutil(url) ||
    /\/icons?\/|\/icon[-_/]|[_/-]logo|logo[_/-]|\blogos?\b|logotype|-150x150|-100x100|-48x48|-50x50|-64x64|\.50x50|\/x240\/|\/x\d{2,3}\/|\.svg(?:$|\?)|\.gif(?:$|\?)/i.test(
      value
    )
  );
}
