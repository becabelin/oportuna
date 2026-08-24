import { ImageResponse } from "next/og";

import { logoIconDataUrl } from "@/lib/brand-assets";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const iconSrc = await logoIconDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#1B2A4A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img src={iconSrc} width={28} height={28} alt="" />
      </div>
    ),
    { ...size }
  );
}
