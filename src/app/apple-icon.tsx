import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#001A4C",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="16" fill="#001A4C" />
          <path
            d="M8 52c10-3 15-14 22-24 7-10 14-15 26-20"
            stroke="#5E2EC4"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M10 54c10-3 15-14 22-24 7-10 14-15 26-20"
            stroke="#FDB409"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M44 8.2 46.7 16.1 55.3 16.4 48.5 21.6 50.8 29.8 44 25.1 37.2 29.8 39.5 21.6 32.7 16.4 41.3 16.1 Z"
            fill="#FDB409"
            stroke="#FDB409"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
