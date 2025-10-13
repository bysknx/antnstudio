"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FooterFromPen() {
  const pathname = usePathname();

  // Ne pas monter sur /projects : l’iframe a déjà ce footer
  if (pathname?.startsWith("/projects")) return null;

  useEffect(() => {
    // injecte la font du pen si absente
    const id = "font-goodmono";
    if (!document.getElementById(id)) {
      const l = document.createElement("link");
      l.id = id;
      l.rel = "stylesheet";
      l.href = "https://fonts.cdnfonts.com/css/thegoodmonolith";
      document.head.appendChild(l);
    }
  }, []);

  return (
    <div
      className="
        pointer-events-none fixed inset-x-0 bottom-0 z-[10050]
        grid grid-cols-12 gap-4 px-5 py-3
      "
      style={{ fontSynthesisWeight: "none" }}
    >
      {/* Coordonnées à gauche */}
      <div className="col-span-12 md:col-span-4 pointer-events-auto select-none font-[TheGoodMonolith,monospace] text-[12px] tracking-tight text-white/90">
        48.7264° N, 2.2770° E
      </div>

      {/* Liens centraux */}
      <div className="col-span-12 md:col-span-4 flex items-center justify-center gap-6 pointer-events-auto">
        {[
          { label: "Instagram", href: "https://www.instagram.com/antnstudio/" },
          { label: "X / Twitter", href: "https://x.com/antnstudio" },
          { label: "LinkedIn", href: "https://www.linkedin.com/in/antnstudio/" },
        ].map((s) => (
          <a
            key={s.href}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className="group relative overflow-hidden font-semibold text-[13px] text-white"
          >
            <span className="relative z-10 mix-blend-difference transition-colors duration-300">
              {s.label}
            </span>
            <span
              aria-hidden
              className="
                absolute inset-0 -z-[1] translate-x-full bg-white
                transition-transform duration-300 ease-out
                group-hover:translate-x-0
              "
            />
          </a>
        ))}
      </div>

      {/* Signature à droite */}
      <div className="col-span-12 md:col-span-4 pointer-events-auto select-none text-right font-[TheGoodMonolith,monospace] text-[12px] tracking-tight text-white/90">
        Est. 2025 • antn.studio
      </div>
    </div>
  );
}
