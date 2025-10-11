"use client";

import Link from "next/link";

export default function FooterPen() {
  return (
    <footer
      aria-label="Site footer"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
        <div
          className={[
            "grid grid-cols-3 items-center",
            "text-xs sm:text-sm text-zinc-300",
            "py-3 sm:py-4",
          ].join(" ")}
        >
          {/* LEFT — Coordinates */}
          <div className="pointer-events-auto text-left font-semibold tracking-wide">
            48.7264° N, 2.2770° E
          </div>

          {/* CENTER — Socials */}
          <nav
            className="pointer-events-auto flex items-center justify-center gap-4 sm:gap-6 font-medium"
            aria-label="Social links"
          >
            <Link
              href="https://instagram.com/"
              target="_blank"
              className="hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
            >
              Instagram
            </Link>
            <span className="text-zinc-500 select-none">/</span>
            <Link
              href="https://twitter.com/"
              target="_blank"
              className="hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
            >
              X / Twitter
            </Link>
            <span className="text-zinc-500 select-none">/</span>
            <Link
              href="https://linkedin.com/"
              target="_blank"
              className="hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-white/30 rounded"
            >
              LinkedIn
            </Link>
          </nav>

          {/* RIGHT — Info */}
          <div className="pointer-events-auto text-right text-zinc-300/90">
            Est. 2025 • <span className="font-medium">antn.studio</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
