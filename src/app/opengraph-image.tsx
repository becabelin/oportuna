import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F4E9D2",
          color: "#2A1810",
          padding: 72,
          border: "16px solid #2A1810",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 28,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: "#C2410C",
              color: "#FFF8EC",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              border: "4px solid #2A1810",
              transform: "rotate(-6deg)",
            }}
          >
            Ó
          </div>
          {SITE_NAME}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.05, maxWidth: 980 }}>
            {SITE_TAGLINE}
          </div>
          <div style={{ fontSize: 28, maxWidth: 860 }}>
            Catálogo público de bolsas, eventos, estágios e intercâmbios. Confirme sempre no edital oficial.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
