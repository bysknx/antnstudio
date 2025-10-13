// components/FooterFromPen.tsx
"use client";

import Link from "next/link";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/antnstudio/" },
  { label: "X / Twitter", href: "https://x.com/antnstudio" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/antnstudio/" },
];

export default function FooterFromPen() {
  return (
    <footer
      className="
        fixed bottom-0 left-0 right-0
        z-[80]  /* > player backdrop */
        px-4 py-3
        pointer-events-none
      "
    >
      <div className="mx-auto max-w-[1400px] grid grid-cols-12 gap-4 items-center">
        <p
          className="col-span-4 pointer-events-auto text-xs"
          style={{ fontFamily: '"TheGoodMonolith", monospace' }}
        >
          48.7264° N, 2.2770° E
        </p>

        <div className="col-span-4 flex justify-center gap-6 pointer-events-auto">
          {SOCIALS.map((s) => (
            <a
              key={s.href}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="
                relative font-bold text-[13px] text-white
                after:absolute after:inset-0 after:w-0 after:bg-white after:transition-[width]
                hover:after:w-full hover:text-black
                transition-colors
              "
              style={{
                mixBlendMode: "difference",
              }}
            >
              {s.label}
            </a>
          ))}
        </div>

        <p
          className="col-span-4 text-right pointer-events-auto text-xs"
          style={{ fontFamily: '"TheGoodMonolith", monospace' }}
        >
          Est. 2025 • antn.studio
        </p>
      </div>
    </footer>
  );
}
