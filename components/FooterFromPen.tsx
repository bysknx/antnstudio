"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Monte le footer *original* du projects-pen.html via iframe
 * -> identique pixel-perfect, aucune re-implémentation.
 * Masqué sur /projects pour éviter le doublon (le pen affiche déjà son footer).
 */
export default function FooterFromPen() {
  const pathname = usePathname();
  const hide = pathname.startsWith("/projects"); // évite le doublon sur /projects
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(56); // hauteur approximative, puis auto-ajustée

  useEffect(() => {
    const onLoad = () => {
      // on mesure la hauteur du footer dans l’iframe
      try {
        const doc = ref.current?.contentDocument;
        const footer = doc?.querySelector(".footer") as HTMLElement | null;
        if (footer) setH(footer.getBoundingClientRect().height);
      } catch {
        /* cross-origin safeguards */
      }
    };
    const el = ref.current;
    el?.addEventListener("load", onLoad);
    return () => el?.removeEventListener("load", onLoad);
  }, []);

  if (hide) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: h,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <iframe
        ref={ref}
        src="/projects-pen.html?embed=footer"
        title="pen-footer"
        style={{
          width: "100%",
          height: "100%",
          border: "0",
          display: "block",
          pointerEvents: "none",
          background: "transparent",
        }}
      />
    </div>
  );
}
