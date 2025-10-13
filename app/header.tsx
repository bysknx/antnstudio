"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/contact", label: "contact" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="pointer-events-none fixed top-4 z-[60] w-full">
      <nav
        className="
          pointer-events-auto mx-auto max-w-[980px]
          rounded-full border border-white/8 bg-black/40 px-4 py-2
          backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,.04)] 
          flex items-center justify-between
        "
      >
        {/* marque */}
        <Link
          href="/"
          className="rounded-full px-3 py-1 text-[13px] font-medium text-zinc-200 hover:text-white"
        >
          antn.studio
        </Link>

        {/* nav */}
        <div className="flex items-center gap-2">
          {LINKS.map((l) => {
            const active = l.href === "/"
              ? pathname === "/"
              : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`
                  relative rounded-full px-3 py-1 text-[13px] font-medium
                  transition-colors
                  ${active ? "text-black" : "text-zinc-300 hover:text-white"}
                `}
              >
                {/* pill fill */}
                <span
                  aria-hidden
                  className={`
                    absolute inset-0 -z-[1] rounded-full transition-all
                    ${active ? "bg-white" : "bg-white/0 hover:bg-white/10"}
                  `}
                />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
