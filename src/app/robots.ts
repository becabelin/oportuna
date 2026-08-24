import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "Google-CloudVertexBot",
  "GoogleOther",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "DuckAssistBot",
  "meta-externalagent",
  "YouBot",
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
