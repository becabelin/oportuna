import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self'",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
    : []),
];

const assetCache = {
  key: "Cache-Control",
  value: "public, max-age=86400, stale-while-revalidate=604800",
};

const nextConfig: NextConfig = {
  // Cursor / proxy previews hit the app as a cross-origin host in dev.
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "*.cursor.sh",
    "*.cursorusercontent.com",
  ],
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/llms.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300" },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
      {
        source: "/.well-known/llms.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300" },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
      {
        source: "/llms-full.txt",
        headers: [
          { key: "Cache-Control", value: "public, max-age=300" },
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
        ],
      },
      {
        source: "/feed.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=300" }],
      },
      {
        source: "/sitemap.xml",
        headers: [{ key: "Cache-Control", value: "public, max-age=300" }],
      },
      {
        source: "/robots.txt",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600" }],
      },
      { source: "/favicon.svg", headers: [assetCache] },
      { source: "/logo-trilha-da-oportunidade.svg", headers: [assetCache] },
      { source: "/logo-trilha-da-oportunidade-escuro.svg", headers: [assetCache] },
      { source: "/logo-icon-trilha.svg", headers: [assetCache] },
      { source: "/logo-icon-trilha-escuro.svg", headers: [assetCache] },
      { source: "/og-lockup.png", headers: [assetCache] },
      { source: "/hero-mesh.jpg", headers: [assetCache] },
      { source: "/hero-poster.jpg", headers: [assetCache] },
      { source: "/hero-sky.mp4", headers: [assetCache] },
      { source: "/covers/:path*", headers: [assetCache] },
    ];
  },
};

export default nextConfig;
