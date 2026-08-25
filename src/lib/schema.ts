import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "./site";
import { TIPO_LABEL } from "./taxonomia";
import type { Oportunidade, TipoOportunidade } from "./types";

const SCHEMA_BY_TIPO: Record<TipoOportunidade, string> = {
  bolsa: "Scholarship",
  evento: "Event",
  curso: "Course",
  estagio: "JobPosting",
  intercambio: "EducationalOccupationalProgram",
  concurso: "Event",
};

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${absoluteUrl("/")}#organizacao`,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    slogan: SITE_TAGLINE,
    inLanguage: "pt-BR",
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo-trilha-da-oportunidade.svg"),
      width: 2048,
      height: 768,
    },
    image: absoluteUrl("/og-lockup.png"),
    founder: {
      "@type": "Person",
      name: "Rebeca Sousa",
      url: absoluteUrl("/#sobre-a-criadora"),
      image: absoluteUrl("/rebeca-sousa.jpg"),
    },
    sameAs: ["https://github.com/becabelin/trilha-da-oportunidade"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      {
        "@type": "WebSite",
        "@id": `${absoluteUrl("/")}#site`,
        name: SITE_NAME,
        url: absoluteUrl("/"),
        description: SITE_DESCRIPTION,
        inLanguage: "pt-BR",
        publisher: { "@id": `${absoluteUrl("/")}#organizacao` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${absoluteUrl("/")}?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Dataset",
        "@id": `${absoluteUrl("/")}#base`,
        name: `Base de oportunidades da ${SITE_NAME}`,
        description:
          "Acervo de bolsas, eventos, cursos, estágios, intercâmbios e concursos com inscrição aberta ou recente. O resumo fica no mural; prazo e regras, no site da organização.",
        url: absoluteUrl("/"),
        license: "https://creativecommons.org/licenses/by/4.0/",
        creator: { "@id": `${absoluteUrl("/")}#organizacao` },
        usageInfo: absoluteUrl("/sobre"),
        isAccessibleForFree: true,
        inLanguage: "pt-BR",
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "application/rss+xml",
            contentUrl: absoluteUrl("/feed.xml"),
            description: "RSS das oportunidades com inscrição aberta.",
          },
          {
            "@type": "DataDownload",
            encodingFormat: "text/plain",
            contentUrl: absoluteUrl("/llms-full.txt"),
            description: "Inventário em texto para modelos e citação.",
          },
        ],
      },
    ],
  };
}

export function itemListSchema(items: Oportunidade[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Oportunidades em inscrição",
    itemListElement: items.slice(0, 20).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/oportunidades/${item.id}`),
      name: item.titulo,
    })),
  };
}

export function faqSchema(pairs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function opportunitySchema(item: Oportunidade) {
  const url = absoluteUrl(`/oportunidades/${item.id}`);
  const base = {
    "@context": "https://schema.org",
    "@type": SCHEMA_BY_TIPO[item.tipo],
    "@id": `${url}#item`,
    name: item.titulo,
    description: item.subtitulo || item.descricao,
    url,
    inLanguage: "pt-BR",
    identifier: item.id,
    keywords: [TIPO_LABEL[item.tipo], item.area, ...item.tags].join(", "),
    mainEntityOfPage: url,
    image: item.imagemUrl ?? undefined,
    provider: {
      "@type": "Organization",
      name: item.organizacao,
    },
    isAccessibleForFree: true,
  };

  if (item.tipo === "evento" || item.tipo === "concurso") {
    return {
      ...base,
      startDate: item.dataInicio ?? item.prazoInscricao,
      endDate: item.dataFim ?? item.prazoInscricao,
      eventAttendanceMode:
        item.modalidade === "remoto"
          ? "https://schema.org/OnlineEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
      location:
        item.modalidade === "remoto"
          ? { "@type": "VirtualLocation", url: item.urlInscricao }
          : {
              "@type": "Place",
              name: [item.cidade, item.pais].filter(Boolean).join(", ") || item.pais,
              address: { "@type": "PostalAddress", addressCountry: item.pais },
            },
      organizer: { "@type": "Organization", name: item.organizacao },
    };
  }

  if (item.tipo === "estagio") {
    const remoto = item.modalidade === "remoto";
    return {
      ...base,
      title: item.titulo,
      hiringOrganization: { "@type": "Organization", name: item.organizacao },
      employmentType: "INTERN",
      datePosted: item.criadoEm.slice(0, 10),
      validThrough: item.prazoInscricao ?? undefined,
      jobLocationType: remoto ? "TELECOMMUTE" : undefined,
      jobLocation: remoto
        ? undefined
        : {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: item.cidade ?? undefined,
              addressCountry: item.pais,
            },
          },
      applicantLocationRequirements: {
        "@type": "Country",
        name: item.pais,
      },
    };
  }

  return {
    ...base,
    educationalLevel: item.nivel,
    offers: {
      "@type": "Offer",
      url: item.urlInscricao,
      availability: "https://schema.org/InStock",
      validThrough: item.prazoInscricao ?? undefined,
    },
  };
}

export function breadcrumbSchema(parts: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: parts.map((part, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: part.name,
      item: absoluteUrl(part.path),
    })),
  };
}
