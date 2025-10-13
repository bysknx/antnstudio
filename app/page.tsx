// app/page.tsx
import FullBleedPlayer from "@/components/ui/FullBleedPlayer";
import { fetchVimeoWorks } from "@/lib/vimeo";
import { parseVimeoTitle } from "@/lib/parseVimeoTitle";
import PreloadVimeo from "@/components/PreloadVimeo";
import { Suspense } from "react";

type Item = {
  id: string;
  title: string;
  createdAt: string | null;
  thumbnail?: string;
  poster?: string;
  embed?: string;
  link?: string;
};

export const dynamic = "force-static";

export default async function HomePage() {
  // on évite tout HTTP et on tape directement la lib serveur
  const { items } = await fetchVimeoWorks({});
  const normalized: Item[] = (items || []).map((it: any) => {
    const parsed = parseVimeoTitle(it?.title ?? "");
    const display =
      parsed?.title ? (parsed.client ? `${parsed.client} — ${parsed.title}` : parsed.title) : (it?.title ?? "Untitled");

    return {
      id: String(it.id),
      title: display,
      createdAt: it.createdAt ?? null,
      thumbnail: it.thumbnail ?? it.poster ?? "",
      poster: it.thumbnail ?? it.poster ?? "",
      embed: it.embed ?? "",
      link: it.link ?? "",
    };
  });

  // derniers 5 par date
  const latest = normalized
    .sort((a, b) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()))
    .slice(0, 5);

  return (
    <main className="relative min-h-[100svh]">
      {/* Préchargement des données projects en tâche de fond */}
      <Suspense fallback={null}>
        <PreloadVimeo />
      </Suspense>

      {/* HERO plein écran */}
      <HeroSection items={latest} />
    </main>
  );
}

/* ---------- Hero (server wrapper + client player) ---------- */
"use client";
import { useState } from "react";

function HeroSection({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Item | null>(items?.[0] ?? null);

  if (!items?.length) {
    return <div className="h-[100svh] w-full" />; // garde la mise en page si pas encore de data
  }

  const main = current || items[0];
  const others = items.filter((x) => x.id !== main.id);

  return (
    <>
      <section className="relative min-h-[100svh] grid grid-rows-[1fr_auto]">
        {/* visuel principal */}
        <button
          onClick={() => setOpen(true)}
          className="relative overflow-hidden"
          aria-label={`Play ${main.title}`}
        >
          {/* poster */}
          <img
            src={main.poster || main.thumbnail || ""}
            alt={main.title}
            className="h-[70svh] w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 text-xl font-semibold tracking-tight">
            {main.title}
          </div>
        </button>

        {/* mini-vignettes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
          {others.map((it) => (
            <button
              key={it.id}
              onClick={() => {
                setCurrent(it);
                setOpen(true);
              }}
              className="relative rounded-xl overflow-hidden ring-1 ring-white/10 hover:ring-white/30 transition"
              aria-label={`Play ${it.title}`}
            >
              <img src={it.thumbnail || ""} alt={it.title} className="aspect-[16/10] w-full object-cover" />
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition" />
              <div className="absolute bottom-2 left-2 right-2 text-xs font-medium line-clamp-2">{it.title}</div>
            </button>
          ))}
        </div>
      </section>

      {/* player plein écran */}
      <FullBleedPlayer
        open={open}
        onClose={() => setOpen(false)}
        title={main.title}
        poster={main.poster || main.thumbnail}
        embed={main.embed}
      />
    </>
  );
}
