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
    var TTL = 15 * 60 * 1000; // 15 minutes
    var k = "antn_ascii_loader_last_seen";
    var last = +localStorage.getItem(k);
    var should = !last || (Date.now() - last) > TTL;
    if (!should) {
      document.documentElement.removeAttribute("data-app-loading");
      return;
    }

    document.documentElement.setAttribute("data-booting", "");
    document.documentElement.setAttribute("data-app-loading", "visible");

    // Full-screen boot: black, centered ASCII logo with progressive opacity (old PC boot feel)
    var box = document.createElement("div");
    box.id = "boot";
    box.style.cssText = "position:fixed;inset:0;background:#000;color:#e5e7eb;z-index:2147483647;display:grid;place-items:center;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\\\"Liberation Mono\\\",\\\"Courier New\\\",monospace;opacity:0;transition:opacity 800ms ease-out";
    var art = [
      "░▒▓██████▓▒░░▒▓███████▓▒░▒▓████████▓▒░▒▓███████▓▒░  ",
      "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
      "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
      "░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
      "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
      "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
      "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
    ].join("\\n");
    box.innerHTML = '<div class="boot-grid" style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);background-size:24px 24px;pointer-events:none"></div>' +
      '<pre id="bootAscii" style="margin:0;line-height:1.08;letter-spacing:.04em;font-size:clamp(12px,4.2vw,22px);color:rgba(229,231,235,.98);opacity:0;transition:opacity 1s ease-out;white-space:pre;text-align:center">' + art + '</pre>';

    (document.body || document.documentElement).appendChild(box);

    // Progressive opacity: logo fades in like an old CRT
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        try {
          box.style.opacity = "1";
          var pre = document.getElementById("bootAscii");
          if (pre) pre.style.opacity = "1";
        } catch (e) {}
      });
    });
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
