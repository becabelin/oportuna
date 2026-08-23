import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";
import { listOportunidades } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/sobre"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/docs"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/chave"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/feed.xml"), changeFrequency: "hourly", priority: 0.5 },
    { url: absoluteUrl("/llms.txt"), changeFrequency: "hourly", priority: 0.4 },
    { url: absoluteUrl("/llms-full.txt"), changeFrequency: "hourly", priority: 0.4 },
  ];

  const { data } = listOportunidades({ status: "todas", limit: 5000 });
  for (const item of data) {
    pages.push({
      url: absoluteUrl(`/oportunidades/${item.id}`),
      lastModified: item.atualizadoEm,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  return pages;
}
