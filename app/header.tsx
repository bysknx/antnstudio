// app/header.tsx
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
    <header className="pointer-events-none fixed top-4 inset-x-0 z-50">
      <nav className="pointer-events-auto mx-auto max-w-5xl px-3 py-2 rounded-full bg-black/40 ring-1 ring-white/10 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="text-zinc-200 text-sm font-medium px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition">
          antn.studio
        </Link>
        <div className="flex items-center gap-2">
          {LINKS.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  active ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
