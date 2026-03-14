"use client";

import { PropsWithChildren } from "react";
import { usePathname } from "next/navigation";

export default function ChromeFrame({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isProjects = pathname?.startsWith("/projects");
  const isAbout = pathname === "/about";
  // Pas de grille sur home, about ni projects (le pen a son propre fond)
  const hideStaticDots = isHome || isAbout || isProjects;
  // Page about : grain seul (pas de grille réactive)
  const showGrainOnly = isAbout;

  return (
    <div className="relative min-h-[100svh] bg-[#0b0b0b] z-0">
      {/* Grille de points fixe : désactivée sur home, contact, projects */}
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

      {/* About : fond grain léger uniquement (pas de grille réactive) */}
      {showGrainOnly && (
        <div
          id="gl-layer"
          className="pointer-events-none fixed inset-0 z-0"
          aria-hidden
        >
          <div className="grain" />
        </div>
      )}

      {/* Contenu (site-content seulement pour public, admin a admin-shell__content) */}
      <div
        className={`relative z-10 ${!pathname?.startsWith("/admin") ? "site-content" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}
