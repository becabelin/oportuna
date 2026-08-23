export const SITE_NAME = "Oportuna";
export const SITE_TAGLINE = "Bolsas, eventos e editais num mural só";
export const SITE_DESCRIPTION =
  "Catálogo público de bolsas de estudo, eventos, cursos, estágios, intercâmbios e concursos. Consulte o mural de graça. Para plugar no app, peça uma chave da API.";
export const SITE_KEYWORDS = [
  "bolsas de estudo",
  "editais",
  "intercâmbio",
  "estágio",
  "concursos estudantis",
  "eventos acadêmicos",
  "oportunidades para estudantes",
  "API de bolsas",
  "CNPq",
  "CAPES",
  "Chevening",
  "Fulbright",
];

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return raw && raw.length > 0 ? raw : "http://127.0.0.1:3847";
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${siteUrl()}/`).toString();
}
