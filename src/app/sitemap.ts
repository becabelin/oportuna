import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { listOportunidades } from "@/lib/store";

export const revalidate = 300;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: absoluteUrl("/sobre"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/docs"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/chave"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  const abertas = listOportunidades({ status: "abertas", limit: 5000 });
  for (const item of abertas.data) {
    pages.push({
      url: absoluteUrl(`/oportunidades/${item.id}`),
      lastModified: item.atualizadoEm,
      changeFrequency: "daily",
      priority: 0.85,
    });
  }

  const encerradas = listOportunidades({ status: "encerradas", limit: 2000 });
  for (const item of encerradas.data) {
    pages.push({
      url: absoluteUrl(`/oportunidades/${item.id}`),
      lastModified: item.atualizadoEm,
      changeFrequency: "weekly",
      priority: 0.3,
    });
  }

  return pages;
}
