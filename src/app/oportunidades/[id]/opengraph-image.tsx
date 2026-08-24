import { ImageResponse } from "next/og";

import { logoIconDataUrl } from "@/lib/brand-assets";
import { SITE_NAME } from "@/lib/site";
import { getOportunidade } from "@/lib/store";
import { TIPO_LABEL } from "@/lib/taxonomia";

export const runtime = "nodejs";
export const alt = `Oportunidade na ${SITE_NAME}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpportunityOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getOportunidade(id);
  const titulo = item?.titulo ?? "Oportunidade";
  const extra = item
    ? `${TIPO_LABEL[item.tipo]} · ${item.organizacao}`
    : SITE_NAME;
  const iconSrc = await logoIconDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F6EEDC",
          color: "#1B2A4A",
          padding: 72,
          border: "16px solid #1B2A4A",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, fontWeight: 800 }}>
          <img src={iconSrc} width={48} height={48} alt="" />
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 22,
              fontWeight: 800,
              textTransform: "uppercase",
              background: "#F5B942",
              color: "#1B2A4A",
              padding: "8px 16px",
              alignSelf: "flex-start",
              border: "3px solid #1B2A4A",
            }}
          >
            {extra}
          </div>
          <div style={{ fontSize: 54, fontWeight: 800, lineHeight: 1.08, maxWidth: 1000 }}>
            {titulo.length > 110 ? `${titulo.slice(0, 107)}…` : titulo}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
