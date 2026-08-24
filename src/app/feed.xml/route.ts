import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import { listOportunidades } from "@/lib/store";

export const revalidate = 300;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const { data } = listOportunidades({ status: "abertas", limit: 80, ordenar: "prazo" });
  const items = data
    .map((item) => {
      const link = absoluteUrl(`/oportunidades/${item.id}`);
      return `    <item>
      <title>${escapeXml(item.titulo)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(item.subtitulo || item.descricao)}</description>
      <pubDate>${new Date(item.atualizadoEm).toUTCString()}</pubDate>
      <category>${escapeXml(item.tipo)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}: inscrições abertas</title>
    <link>${escapeXml(absoluteUrl("/"))}</link>
    <atom:link href="${escapeXml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml"/>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
