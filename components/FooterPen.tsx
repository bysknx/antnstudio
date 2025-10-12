"use client";

import { useEffect, useRef, useState } from "react";

/** Monte le bloc footer présent dans /projects-pen.html en le copiant tel quel. */
export default function FooterPen() {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/projects-pen.html", { cache: "force-cache" });
        const html = await res.text();
        if (stop) return;

        // Parse le HTML et récupère LE footer exact
        const tpl = document.createElement("template");
        tpl.innerHTML = html;
        const footer = tpl.content.querySelector(".footer");
        if (!footer) return;

        // Nettoie l'ancienne monture si re-rendu
        if (ref.current) ref.current.innerHTML = "";

        // clone + attache
        const clone = footer.cloneNode(true) as HTMLElement;

        // important : neutraliser les interactions (la page Projects s'en charge déjà)
        clone.style.pointerEvents = "none";

        ref.current?.appendChild(clone);
        setMounted(true);
      } catch {}
    })();
    return () => { stop = true; };
  }, []);

  // conteneur collé en bas
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[40]"
      ref={ref}
    />
  );
}
