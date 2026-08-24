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
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const [logoSrc, fonts] = await Promise.all([ogLockupDataUrl(), loadOgFonts()]);
  const logoWidth = 1040;
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
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: OG_WHITE,
          color: OG_NAVY,
          padding: "48px 64px",
          fontFamily: "Fredoka",
        }}
      >
        <div
          style={{
            display: "flex",
            height: 8,
            width: 88,
            borderRadius: 999,
            background: OG_GOLD,
          }}
        />
        <img
          src={logoSrc}
          alt={SITE_NAME}
          width={logoWidth}
          height={logoHeight}
        />
        <div
          style={{
            display: "flex",
            fontSize: 30,
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: -0.2,
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
