// START PATCH
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import GlCanvas from "@/components/GlCanvas";
import LoadingAscii from "@/components/LoadingAscii";
import ClientFade from "@/components/ClientFade";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "antn.studio — Anthony",
  description:
    "Front-end & DA minimale. Expériences web sobres, performantes, accessibles.",
  metadataBase: new URL("https://antn.studio"),
  openGraph: {
    title: "antn.studio — Anthony",
    description:
      "Front-end & DA minimale. Expériences web sobres, performantes, accessibles.",
    url: "https://antn.studio",
    siteName: "antn.studio",
    images: [{ url: "/cover.jpg", width: 1200, height: 630, alt: "antn.studio" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "antn.studio — Anthony",
    description:
      "Front-end & DA minimale. Expériences web sobres, performantes, accessibles.",
    images: ["/cover.jpg"],
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      {/* Hints réseau pour accélérer Vimeo (fonctionne avec l'App Router) */}
      <head>
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <link rel="dns-prefetch" href="https://i.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://f.vimeocdn.com" />
      </head>

      <body>
        {/* Loader ASCII (TTL ~ 1h si ajusté dans LoadingAscii) */}
        <LoadingAscii />

        {/* Le reste peut être animé en douceur */}
        <ClientFade>
          {/* Fond interactif + overlays d’ambiance */}
          <GlCanvas />
          <div className="grain" />
          <div className="scanlines" />

          {/* Nav au-dessus du canvas */}
          <div className="relative z-20">
            <Nav />
          </div>

          {/* Contenu principal */}
          <div className="page relative z-10">{children}</div>
        </ClientFade>
      </body>
    </html>
  );
}
// END PATCH
