"use client";

import Link from "next/link";

export default function SiteFooter() {
  return (
    <div
      className="
        antn-footer
        fixed inset-x-0 bottom-0 z-40
        px-4 md:px-6
      "
      role="contentinfo"
      aria-label="Footer"
    >
      <div
        className="
          mx-auto w-full max-w-[1400px]
          flex items-center justify-between gap-6
          text-[12px] md:text-[13px] leading-none text-zinc-300
        "
      >
        {/* Gauche : coordonnées */}
        <div className="coordinates-section whitespace-nowrap">
          <p>48.7264° N, 2.2770° E</p>
        </div>

        {/* Centre : liens sociaux */}
        <div className="links-section flex items-center gap-6" id="socials">
          <a
            className="hover:text-white transition-colors"
            href="https://instagram.com/antnstudio" target="_blank" rel="noreferrer"
          >
            Instagram
          </a>
          <span className="opacity-40">/</span>
          <a
            className="hover:text-white transition-colors"
            href="https://x.com/antnstudio" target="_blank" rel="noreferrer"
          >
            X / Twitter
          </a>
          <span className="opacity-40">/</span>
          <a
            className="hover:text-white transition-colors"
            href="https://linkedin.com/in/antnstudio" target="_blank" rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>

        {/* Droite : info */}
        <div className="info-section whitespace-nowrap">
          <p>
            Est. 2025 •{" "}
            <Link
              href="/"
              className="hover:text-white transition-colors"
              aria-label="antn.studio"
            >
              antn.studio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
