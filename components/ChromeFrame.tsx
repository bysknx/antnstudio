// components/ChromeFrame.tsx
"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import GlCanvas from "@/components/GlCanvas";

export default function ChromeFrame({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const hideStaticDots = pathname === "/contact"; // ⬅️ pas de grille fixe sur /contact

  return (
    <div className="relative min-h-[100svh] bg-[#0b0b0b] z-0">
      {/* Grille de points (fixe, sobre) — masquée sur /contact */}
      {!hideStaticDots && (
        <div
          data-static-dots
          aria-hidden
          className="
            pointer-events-none fixed inset-0 -z-10
            [background-image:radial-gradient(circle,rgba(255,255,255,.08)_1.1px,transparent_1.11px)]
            [background-size:22px_22px]
            bg-fixed
          "
        />
      )}

      {/* Couche FX (hors home pour éviter tout flash avant hydratation) */}
      {!isHome && (
        <div id="gl-layer" className="pointer-events-none fixed inset-0 z-0">
          <GlCanvas />
          <div className="grain" />
          <div className="scanlines" />
        </div>
      )}

      {/* Contenu au-dessus */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
