// app/header.tsx
"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/about", label: "about" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  // Précharger /projects en arrière-plan quand on est sur home ou about
  useEffect(() => {
    if (pathname === "/" || pathname === "/about") {
      router.prefetch("/projects");
    }
  }, [pathname]);

  if (pathname != null && pathname.startsWith("/admin")) return null;

  return (
    // Fixed, translucent header that stays on top of the viewport.
    <header className="header pointer-events-none fixed top-4 inset-x-0 z-50">
      {/* Interactive navbar container with rounded background and blur effect. */}
      <nav className="pointer-events-auto mx-auto max-w-5xl px-3 py-2 rounded-full bg-black/40 ring-1 ring-white/10 backdrop-blur-md flex items-center justify-between">
        {/* Brand link back to the home page. */}
        <Link
          href="/"
          className="text-zinc-200 text-sm font-medium px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          antn.studio
        </Link>
        <div className="flex items-center gap-2">
          {LINKS.map((l) => {
            // Mark link active when the current route matches its href (home is exact match).
            const active =
              l.href === "/"
                ? pathname === "/"
                : (pathname?.startsWith(l.href) ?? false);
            return (
              <Link
                key={l.href}
                href={l.href}
                prefetch={true}
                onMouseEnter={() =>
                  l.href === "/projects"
                    ? router.prefetch("/projects")
                    : undefined
                }
                className={`px-3 py-1 rounded-full text-sm transition ${
                  active
                    ? "bg-white text-black"
                    : "text-zinc-300 hover:bg-white/10"
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
