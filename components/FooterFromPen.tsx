"use client";

import { useEffect, useState } from "react";

/**
 * Récupère le HTML de /projects-pen.html, extrait .footer
 * et l’injecte tel quel (sans les séparateurs/traits).
 */
export default function FooterFromPen() {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/projects-pen.html", { cache: "force-cache" });
        const text = await res.text();
        if (!alive) return;

        const doc = new DOMParser().parseFromString(text, "text/html");
        // On cible la racine du module footer du pen
        const root =
          (doc.querySelector(".footer") as HTMLElement | null) ||
          (doc.querySelector("#footer") as HTMLElement | null);

        if (!root) return;

        // 1) Supprimer toute ligne/séparateur éventuel
        root.querySelectorAll("hr, .separator, .line, .divider").forEach((el) => el.remove());

        // 2) S’assurer que les liens s’ouvrent dans un nouvel onglet
        root.querySelectorAll("a").forEach((a) => {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        });

        // 3) On sérialise uniquement le contenu utile (innerHTML) dans notre wrapper
        setHtml(root.innerHTML);
      } catch (e) {
        console.error("[FooterFromPen] fetch/parse error:", e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (!html) return null;

  return (
    <div className="pen-footer-mount">
      <div className="footer" dangerouslySetInnerHTML={{ __html: html }} />
      <style jsx>{`
        .pen-footer-mount {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 40; /* au-dessus du contenu, sous la nav si besoin */
          pointer-events: none; /* laisse cliquer à travers sauf liens socials */
        }
        .pen-footer-mount .footer {
          pointer-events: auto; /* réactive les clics sur les liens socials */
        }
        /* Pas de traits/lines, fond transparent (on garde le look du pen) */
        .pen-footer-mount .footer::before,
        .pen-footer-mount .footer::after {
          display: none !important;
        }
        .pen-footer-mount .footer {
          background: transparent !important;
          border: 0 !important;
        }

        /* Optionnel: assure une lisibilité minimale */
        .pen-footer-mount .footer a {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
