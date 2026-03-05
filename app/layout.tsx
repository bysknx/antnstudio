// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

import LoadingAscii from "@/components/LoadingAscii";
import ClientFade from "@/components/ClientFade";
import ChromeFrame from "@/components/ChromeFrame";
import FooterMount from "@/components/FooterMount";
import Header from "./header";

const BOOT_SCRIPT = String.raw`(function () {
  try {
    var TTL = 15 * 60 * 1000;
    var k = "antn_ascii_loader_last_seen";
    var last = +localStorage.getItem(k);
    if (last && (Date.now() - last) <= TTL) {
      document.documentElement.removeAttribute("data-app-loading");
      return;
    }
    document.documentElement.setAttribute("data-booting", "");
    document.documentElement.setAttribute("data-app-loading", "visible");
    var box = document.createElement("div");
    box.id = "boot";
    box.style.cssText = "position:fixed;inset:0;background:#000;z-index:2147483647;opacity:0;transition:opacity 400ms ease-out";
    (document.body || document.documentElement).appendChild(box);
    requestAnimationFrame(function () { try { box.style.opacity = "1"; } catch (e) {} });
  } catch (e) {}
})();`;

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

        {/* Preloads the pen to smooth the first open */}
        <link rel="preload" href="/projects-pen.html" as="document" />

        {/* Préchargement du manifest vidéo */}
        <link rel="preload" href="/api/vimeo" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className="overflow-x-hidden">
        {/* Boot shell: first paint = loader screen. Hides the rest until dismissal. */}
        <script
          dangerouslySetInnerHTML={{
            __html: BOOT_SCRIPT,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html[data-booting] body > *:not(#boot){ visibility:hidden }`,
        }}
      />

        {/* Fullscreen ASCII loader */}
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
