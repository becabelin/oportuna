export const SITE_NAME = "Trilha da Oportunidade";
export const SITE_TAGLINE = "Bolsas, eventos e editais numa trilha só";
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
  "Trilha da Oportunidade",
];
export const SITE_GITHUB = "https://github.com/becabelin/trilha-da-oportunidade";

export function siteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return raw && raw.length > 0 ? raw : "http://127.0.0.1:3847";
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${siteUrl()}/`).toString();
}

/** Metadata compartilhada de páginas estáticas (canonical + OG URL corretos). */
export function pageSocial(path: string, title: string, description: string) {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website" as const,
      locale: "pt_BR",
      siteName: SITE_NAME,
      title,
      description,
      url,
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
    },
  };
}
