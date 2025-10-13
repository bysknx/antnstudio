// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import LoadingAscii from "@/components/LoadingAscii";
import ClientFade from "@/components/ClientFade";
import ChromeFrame from "@/components/ChromeFrame";
import FooterMount from "@/components/FooterMount";
import Header from "./header";

export const metadata: Metadata = {
  title: "antn.studio — Anthony",
  description: "Front-end & DA minimale. Expériences web sobres, performantes, accessibles.",
  metadataBase: new URL("https://antn.studio"),
  openGraph: {
    title: "antn.studio — Anthony",
    description: "Front-end & DA minimale. Expériences web sobres, performantes, accessibles.",
    url: "https://antn.studio",
    siteName: "antn.studio",
    images: [{ url: "/cover.jpg", width: 1200, height: 630, alt: "antn.studio" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "antn.studio — Anthony",
    description: "Front-end & DA minimale. Expériences web sobres, performantes, accessibles.",
    images: ["/cover.jpg"],
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        {/* Preconnect/DNS-prefetch pour Vimeo */}
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <link rel="dns-prefetch" href="https://i.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://f.vimeocdn.com" />

        {/* Précharge le pen pour lisser l’ouverture */}
        <link rel="preload" href="/projects-pen.html" as="document" />

        {/* Précharge l’API Vimeo côté nav client (hint pour le navigateur) */}
        <link rel="preload" href="/api/vimeo" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="overflow-x-hidden">
        {/* Loader ASCII (plein écran, z-max) */}
        <LoadingAscii />

        {/* Header global (nav) */}
        <Header />

        {/* Transitions de page + chrome visuel */}
        <ClientFade>
          <ChromeFrame>{children}</ChromeFrame>
        </ClientFade>

        {/* Footer global issu du pen (fixed via son propre style) */}
        <FooterMount />
      </body>
    </html>
  );
}
