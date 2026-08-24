import { ImageResponse } from "next/og";

import { ogLockupDataUrl } from "@/lib/brand-assets";
import {
  loadOgFonts,
  OG_GOLD,
  OG_LOCKUP_SIZE,
  OG_NAVY,
  OG_SIZE,
  OG_WHITE,
} from "@/lib/og-brand";
import { SITE_NAME } from "@/lib/site";
import { getOportunidade } from "@/lib/store";
import { TIPO_LABEL } from "@/lib/taxonomia";

export const runtime = "nodejs";
export const alt = `Oportunidade na ${SITE_NAME}`;
export const size = OG_SIZE;
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
  const [logoSrc, fonts] = await Promise.all([ogLockupDataUrl(), loadOgFonts()]);
  const logoWidth = 520;
  const logoHeight = Math.round(
    (logoWidth * OG_LOCKUP_SIZE.height) / OG_LOCKUP_SIZE.width
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: OG_WHITE,
          color: OG_NAVY,
          padding: "56px 64px",
          fontFamily: "Fredoka",
        }}
      >
        <img
          src={logoSrc}
          alt={SITE_NAME}
          width={logoWidth}
          height={logoHeight}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: OG_GOLD,
              color: OG_NAVY,
              borderRadius: 999,
              padding: "10px 20px",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {extra.length > 72 ? `${extra.slice(0, 69)}…` : extra}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.12,
              maxWidth: 1040,
            }}
          >
            {titulo.length > 110 ? `${titulo.slice(0, 107)}…` : titulo}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
