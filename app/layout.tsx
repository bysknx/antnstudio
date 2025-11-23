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

    var css = "position:fixed;inset:0;background:#000;color:#e5e7eb;z-index:2147483647;display:grid;place-items:center;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\\\"Liberation Mono\\\",\\\"Courier New\\\",monospace";
    var box = document.createElement("div");
    box.id = "boot";
    box.style.cssText = css;
    var art = String.raw`
      ___        _            _        _
     / _ \ _   _| |_ ___  ___| |_ __ _| |_ ___  _ __
    / /_)/ | | | __/ _ \/ __| __/ _\` | __/ _ \| '__|
   / ___/| |_| | ||  __/\__ \ || (_| | || (_) | |
   \/     \__,_|\__\___||___/\__\__,_|\__\___/|_|
    `.trim();
    box.innerHTML = '<div style="padding:24px;text-align:left">'+
      '<pre style="margin:0;line-height:1.05;letter-spacing:.02em;font-size:clamp(14px,6vw,24px);opacity:.95">'+ art + '\\n\\n</pre>'+
      '<div style="margin-top:16px;font-size:12px;opacity:.9">booting interface '+
      '<span style="display:inline-block;vertical-align:middle;height:12px;width:160px;overflow:hidden;border:1px solid rgba(255,255,255,.4);background:rgba(0,0,0,.4)"><span id="bootBar" style="display:block;height:100%;width:0;background:rgba(16,185,129,.9);background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.18) 0 6px,transparent 6px 12px);transition:width 120ms linear"></span></span>'+
      ' <span id="bootPct" style="font-variant-numeric:tabular-nums">0%</span></div>'+
      '</div>';

    (document.body || document.documentElement).appendChild(box);

    var p = 0;
    var pctEl = document.getElementById("bootPct");
    var barEl = document.getElementById("bootBar");
    var t = setInterval(function () {
      p = Math.min(99, p + 1 + Math.random() * 3);
      if (barEl) barEl.style.width = Math.round(p) + "%";
      if (pctEl) pctEl.textContent = Math.round(p) + "%";
    }, 120);
    window.__antnBootTick = t;
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
        {/* Preconnect/DNS-prefetch pour Vimeo */}
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
        <link rel="dns-prefetch" href="https://i.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://f.vimeocdn.com" />

        {/* Preloads the pen to smooth the first open */}
        <link rel="preload" href="/projects-pen.html" as="document" />

        {/* Preload Vimeo API client-side (browser hint) */}
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
