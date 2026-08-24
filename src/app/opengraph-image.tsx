import { ImageResponse } from "next/og";

import { ogLockupDataUrl } from "@/lib/brand-assets";
import {
  loadOgFonts,
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
  const logoWidth = 980;
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
          gap: 36,
          background: OG_WHITE,
          color: OG_NAVY,
          padding: "56px 72px",
          fontFamily: "Lexend",
        }}
      >
        <img
          src={logoSrc}
          alt={SITE_NAME}
          width={logoWidth}
          height={logoHeight}
        />
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 600,
            lineHeight: 1.3,
            letterSpacing: -0.2,
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
