// components/ChromeFrame.tsx
"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";
import GlCanvas from "@/components/GlCanvas";

export default function ChromeFrame({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div
      className="
        relative min-h-[100svh]
        /* grille de points (sobre, fixe) */
        bg-[#0b0b0b]
        [background-image:radial-gradient(circle,rgba(255,255,255,.08)_1.1px,transparent_1.11px)]
        [background-size:22px_22px]
        bg-fixed
        /* z neutre pour ne pas recouvrir le menu YEARS du pen */
        z-0
      "
    >
      {/* Couché FX (hors home pour éviter tout flash avant hydratation) */}
      {!isHome && (
        <div id="gl-layer" className="pointer-events-none fixed inset-0 z-0">
          <GlCanvas />
          {/* Ces classes supposent ton CSS global existant */}
          <div className="grain" />
          <div className="scanlines" />
        </div>
      )}

      {/* Contenu (au-dessus du fond/FX, mais sous la Nav globale rendue dans layout) */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
