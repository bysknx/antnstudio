"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "home" },       // <- au lieu de "work"
  { href: "/projects", label: "projects" },
  { href: "/contact", label: "contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-sm supports-[backdrop-filter]:bg-black/30">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between text-sm">
        {/* Logo / marque */}
        <Link href="/" className="font-medium text-zinc-200">
          antn.studio
        </Link>

        {/* Nav */}
        <div className="flex items-center gap-5">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className="relative text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <span className="opacity-90 hover:opacity-100">{l.label}</span>
                {active && (
                  <span className="absolute -bottom-[2px] left-0 right-0 h-px bg-zinc-200" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
