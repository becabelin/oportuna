import { ImageResponse } from "next/og";

import { logoFullDataUrl } from "@/lib/brand-assets";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logoSrc = await logoFullDataUrl();

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
        <img src={logoSrc} width={360} height={240} alt={SITE_NAME} />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>
            {SITE_TAGLINE}
          </div>
          <div style={{ fontSize: 26, maxWidth: 860 }}>
            Catálogo público de bolsas, eventos, estágios e intercâmbios. Confirme sempre no edital
            oficial.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
