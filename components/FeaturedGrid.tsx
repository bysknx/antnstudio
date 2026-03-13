"use client";

import Link from "next/link";

type FeaturedItem = {
  id: string;
  title: string;
  year?: number | null;
  thumbnail?: string;
  url?: string;
};

export default function FeaturedGrid({ items }: { items: FeaturedItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-[#222222] bg-[#0a0a0a] px-6 py-12 md:py-16">
      <div className="shell mx-auto max-w-4xl">
        <h2 className="mb-8 text-sm font-mono uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          Featured projects
        </h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href="/projects"
                className="group block text-left transition-colors duration-200 ease-in-out"
              >
                <div className="overflow-hidden rounded-sm border border-[#222222] bg-[#111111] transition-[border-color,background-color] duration-200 ease-in-out group-hover:border-[#333333] group-hover:bg-[#161616]">
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-200 ease-in-out group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs font-mono text-[var(--text-tertiary)]">
                          —
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-[#222222] px-3 py-2">
                    <p className="truncate text-sm font-mono text-[var(--text-primary)]">
                      {item.title}
                    </p>
                    {item.year != null && (
                      <p className="mt-0.5 text-xs font-mono text-[var(--text-secondary)]">
                        {item.year}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6">
          <Link
            href="/projects"
            className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--text-secondary)] underline transition-colors duration-200 ease-in-out hover:text-[var(--text-primary)]"
          >
            Voir tous les projets
          </Link>
        </p>
      </div>
    </section>
  );
}
