"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

const ITEMS: Item[] = [
  { href: "/", label: "home" },
  { href: "/projects", label: "projects" },
  { href: "/contact", label: "contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // ferme le menu mobile quand on change de route
  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav
      className="
        fixed top-0 left-0 z-[60] w-full
        border-b border-white/10
        bg-black/20 backdrop-blur-md
      "
      role="navigation"
      aria-label="Main"
    >
      {/* conteneur centré et fluide */}
      <div className="mx-auto w-[min(94vw,1100px)] px-2 sm:px-4">
        <div className="flex items-center justify-between py-2 sm:py-3">
          {/* Brand : pastille façon “champ” */}
          <Link
            href="/"
            className="
              group inline-flex h-9 items-center rounded-full
              bg-white/5 px-3 sm:px-4 text-xs sm:text-sm
              text-zinc-200 border border-white/10 shadow-inner
              transition-colors hover:bg-white/10
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
            "
          >
            <span className="opacity-90 group-hover:opacity-100">
              antn.studio
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden gap-1 sm:flex">
            {ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "inline-flex h-9 items-center rounded-full px-3 text-sm transition-colors",
                    "border border-white/10",
                    active
                      ? "bg-white/15 text-white"
                      : "text-zinc-300 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Burger (mobile) */}
          <button
            className="
              sm:hidden inline-flex h-9 w-9 items-center justify-center
              rounded-full border border-white/10 text-zinc-200
              bg-white/5 hover:bg-white/10 transition-colors
              focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
            "
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d={open ? "M6 6l12 12M18 6L6 18" : "M3 6h18M3 12h18M3 18h18"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Drawer mobile */}
        {open && (
          <div
            className="
              sm:hidden pb-2
              animate-in fade-in slide-in-from-top-2
            "
          >
            <div
              className="
                rounded-2xl border border-white/10 bg-black/40
                backdrop-blur-md p-1
              "
            >
              {ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "block rounded-xl px-3 py-2 text-sm",
                      active
                        ? "bg-white/15 text-white"
                        : "text-zinc-300 hover:text-white hover:bg-white/10",
                    ].join(" ")}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
