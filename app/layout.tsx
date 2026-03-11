// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";

import LoadingAscii from "@/components/LoadingAscii";
import ClientFade from "@/components/ClientFade";
import ChromeFrame from "@/components/ChromeFrame";
import FooterMount from "@/components/FooterMount";
import Header from "./header";
import { getAdminConfig } from "@/lib/admin-config";

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

        {/* Preloads the pen to smooth the first open */}
        <link rel="preload" href="/projects-pen.html" as="document" />

        {/* Préchargement du manifest vidéo */}
        <link
          rel="preload"
          href="/api/videos"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${GeistSans.className} overflow-x-hidden`}>
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
