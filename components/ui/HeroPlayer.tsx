// components/ui/HeroPlayer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type VimeoItem = {
  id: string;
  title?: string;
  embed?: string;        // généré par la route
  link?: string;
  duration?: number;     // en secondes si dispo (sinon undefined)
};

type Slide = {
  type: "vimeo";
  src: string;           // url d’embed vimeo
  title: string;
  durationMs: number;
};

function toSlides(items: VimeoItem[]): Slide[] {
  // tri et mapping → fallback 15s si pas de durée
  return items
    .filter((it) => it.embed)
    .map((it) => ({
      type: "vimeo" as const,
      src: `${it.embed!}&muted=1&autoplay=1&playsinline=1&controls=0&pip=1&transparent=0`,
      title: it.title || "Untitled",
      durationMs: Math.max(5000, (it.duration ?? 15) * 1000),
    }));
}

export default function HeroPlayer() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  // fetch Vimeo → slides
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const items: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
        if (!stop) setSlides(toSlides(items));
      } catch {
        if (!stop) setSlides([]);
      }
    })();
    return () => { stop = true; };
  }, []);

  // avance automatique
  useEffect(() => {
    if (!slides.length) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const delay = slides[idx]?.durationMs ?? 15000;
    timerRef.current = window.setTimeout(() => {
      setIdx((p) => (p + 1) % slides.length);
    }, delay) as unknown as number;
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [slides, idx]);

  if (!slides.length) return null;
  const current = slides[idx];

  return (
    <section className="relative">
      <div className="relative w-full pb-[56.25%] overflow-hidden rounded-xl border border-white/10 bg-black">
        <iframe
          key={idx} // force le reload à chaque slide
          className="absolute inset-0 h-full w-full"
          src={current.src}
          title={current.title}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      {/* mini UI d’état (facultatif) */}
      <div className="absolute right-3 top-3 flex gap-2 opacity-80">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-4 rounded-full ${i === idx ? "bg-white/90" : "bg-white/30"}`}
          />
        ))}
      </div>
    </section>
  );
}
