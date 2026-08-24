export const SITE_NAME = "Trilha da Oportunidade";
export const SITE_TAGLINE = "Bolsas, eventos e editais numa trilha só";
export const SITE_TITLE = `${SITE_NAME}. ${SITE_TAGLINE}`;
export const SITE_DESCRIPTION =
  "Catálogo público de bolsas de mestrado, editais abertos, cursos, estágios, intercâmbios e iniciativas para jovens em todas as áreas de estudo, não só tecnologia. Consulte o mural de graça.";
export const SITE_KEYWORDS = [
  "bolsas de estudo",
  "bolsas de mestrado",
  "editais abertos",
  "iniciativas para jovens",
  "intercâmbio",
  "estágio",
  "concursos estudantis",
  "eventos acadêmicos",
  "oportunidades para estudantes",
  "CAPES",
  "FAPESP",
  "CNPq",
  "ProUni",
  "OBMEP",
  "Trilha da Oportunidade",
];
export const SITE_GITHUB = "https://github.com/becabelin/trilha-da-oportunidade";

function stripTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function siteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return stripTrailingSlash(explicit);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    return `https://${stripTrailingSlash(host)}`;
  }
  return "http://127.0.0.1:3847";
}

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalized, `${siteUrl()}/`).toString();
}

/** Metadata compartilhada de páginas estáticas (canonical + OG URL corretos). */
const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: SITE_TITLE,
} as const;

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
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [OG_IMAGE.url],
    },
  };
}
