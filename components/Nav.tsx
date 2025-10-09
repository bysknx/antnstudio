"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/contact", label: "contact" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[min(92rem,92vw)] px-3">
      <nav className="glass rounded-full h-12 px-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center h-8 px-2 text-sm leading-none tracking-tight text-zinc-200 hover:text-white transition"
        >
          antn.studio
        </Link>

        <ul className="flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`inline-flex items-center h-8 px-3 text-sm leading-none rounded-full transition
                    text-zinc-300 hover:text-white hover:bg-white/5
                    ${active ? "bg-white/10 text-white" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
