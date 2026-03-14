// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";

import { getAdminConfig } from "@/lib/admin-config";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getAdminConfig();
  const sc = config.siteConfig;
  const title = sc?.title ?? "antn.studio — Anthony";
  const description =
    sc?.description ??
    "Front-end & DA minimale. Expériences web sobres, performantes, accessibles.";
  const ogImage = sc?.ogImage ?? "/cover.jpg";

  return {
    title,
    description,
    metadataBase: new URL("https://antn.studio"),
    openGraph: {
      title,
      description,
      url: "https://antn.studio",
      siteName: "antn.studio",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "antn.studio" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    icons: [{ rel: "icon", url: "/favicon.ico" }],
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        {/* Polices du footer (alignées sur le pen projects) */}
        <link
          href="https://fonts.cdnfonts.com/css/thegoodmonolith"
          rel="stylesheet"
        />
        <link
          href="https://fonts.cdnfonts.com/css/pp-neue-montreal"
          rel="stylesheet"
        />

        {/* Preconnect vers le CDN média self-hosted */}
        <link rel="preconnect" href="https://media.antn.studio" />
        <link rel="dns-prefetch" href="https://media.antn.studio" />

        {/* Préchargement du manifest vidéo */}
        <link
          rel="preload"
          href="/api/videos"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${GeistSans.className} overflow-x-hidden`}>
        {children}
      </body>
    </html>
  );
}
