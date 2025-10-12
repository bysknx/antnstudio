"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

/**
 * Monte *tel quel* le footer du projects-pen.html au-dessus de tout.
 * - même HTML / CSS (copiés ici)
 * - au-dessus des players & du contenu (z-index élevé)
 * - pas de "trou" dans la page (position:fixed; pas dans le flux)
 * - évite le doublon sur /projects (l'iframe contient déjà ce footer)
 */
export default function FooterFromPen() {
  const pathname = usePathname();
  // Ne pas monter sur /projects (l’iframe l’a déjà).
  if (pathname?.startsWith("/projects")) return null;
  if (typeof document === "undefined") return null;

  const node = document.getElementById("__pen_footer__") ?? (() => {
    const el = document.createElement("div");
    el.id = "__pen_footer__";
    document.body.appendChild(el);
    return el;
  })();

  return createPortal(<FooterMarkup />, node);
}

function FooterMarkup() {
  useEffect(() => {
    // Clean on unmount
    return () => {
      const el = document.getElementById("__pen_footer__");
      if (el) el.innerHTML = "";
    };
  }, []);

  return (
    <>
      <style>{`
:root{
  --color-text:#fff;
  --font-size-base:14px;
}
.__pen_footer{
  position:fixed;left:0;bottom:0;width:100vw;padding:1.2rem;
  z-index:10050;display:grid;grid-template-columns:repeat(12,1fr);column-gap:1rem;
  pointer-events:none; /* on n'active les events que sur les liens */
}
.__pen_footer .coordinates-section{
  grid-column:1 / span 4;font-family:"TheGoodMonolith",monospace;color:#fff;opacity:.92
}
.__pen_footer .links-section{
  grid-column:5 / span 4;display:flex;justify-content:center;gap:1rem;align-items:center
}
.__pen_footer .info-section{
  grid-column:9 / span 4;text-align:right;font-family:"TheGoodMonolith",monospace;color:#fff;opacity:.92
}
.__pen_footer a{
  position:relative;color:var(--color-text);text-decoration:none;font-weight:700;font-size:13px;
  pointer-events:auto; /* clickable */
}
.__pen_footer a::after{
  content:"";position:absolute;inset:0 0 0 auto;width:0;background:#fff;z-index:-1;
  transition:width .3s cubic-bezier(.34,1.56,.64,1)
}
.__pen_footer a:hover{color:#000;mix-blend-mode:difference}
.__pen_footer a:hover::after{width:100%}
@media (max-width:820px){
  .__pen_footer{padding:.9rem;column-gap:.6rem}
  .__pen_footer .coordinates-section{grid-column:1 / span 5}
  .__pen_footer .links-section{grid-column:6 / span 3}
  .__pen_footer .info-section{grid-column:9 / span 4}
}
      `}</style>

      <div className="__pen_footer" aria-hidden={false}>
        <div className="coordinates-section">
          <p>48.7264° N, 2.2770° E</p>
        </div>
        <div className="links-section">
          <a href="https://www.instagram.com/antnstudio/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://x.com/antnstudio" target="_blank" rel="noreferrer">X / Twitter</a>
          <a href="https://www.linkedin.com/in/antnstudio/" target="_blank" rel="noreferrer">LinkedIn</a>
        </div>
        <div className="info-section">
          <p>Est. 2025 • antn.studio</p>
        </div>
      </div>
    </>
  );
}
