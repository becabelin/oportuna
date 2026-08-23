import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  const allowAi = AI_BOTS.map((userAgent) => ({
    userAgent,
    allow: "/",
    disallow: ["/fontes", "/cadastrar", "/api/"],
  }));

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/fontes", "/cadastrar", "/api/"],
      },
      ...allowAi,
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
