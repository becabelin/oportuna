import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";

import { A11yProvider } from "@/components/a11y-provider";
import { JsonLd } from "@/components/json-ld";
import { SkipLink } from "@/components/skip-link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PREFS_BOOTSTRAP } from "@/lib/a11y";
import { websiteSchema } from "@/lib/schema";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TAGLINE,
  siteUrl,
} from "@/lib/site";

import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  category: "education",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon/32", sizes: "32x32", type: "image/png" },
      { url: "/icon/192", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-icon",
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/feed.xml",
      "text/plain": "/llms.txt",
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${nunito.variable} ${fredoka.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_BOOTSTRAP }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <A11yProvider>
          <TooltipProvider delay={200}>
            <SkipLink />
            <JsonLd data={websiteSchema()} />
            <SiteHeader />
            <main id="conteudo" tabIndex={-1} className="flex flex-1 flex-col outline-none">
              {children}
            </main>
            <SiteFooter />
          </TooltipProvider>
        </A11yProvider>
      </body>
    </html>
  );
}
