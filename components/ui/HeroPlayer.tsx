// components/ui/HeroPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type VimeoItem = {
  id: string;
  title?: string;
  embed?: string;     // fourni par /api/vimeo
  duration?: number;  // secondes si dispo
};

type Slide = {
  src: string;        // url d’embed vimeo complet
  alt: string;
  durationMs: number;
};

const DEFAULT_DURATION_MS = 15000;

function toSlides(items: VimeoItem[]): Slide[] {
  return items
    .filter((it) => typeof it.embed === "string" && it.embed.length > 0)
    .map((it) => ({
      src: `${it.embed!}&muted=1&autoplay=1&playsinline=1&controls=0&pip=1&transparent=0&background=1`,
      alt: it.title ?? "Untitled",
      durationMs: Math.max(5000, (it.duration ?? DEFAULT_DURATION_MS / 1000) * 1000),
    }));
}

export default function HeroPlayer() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const durationRef = useRef<number>(DEFAULT_DURATION_MS);

  // Fetch strictement depuis /api/vimeo
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const items: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
        if (!stop) {
          const mapped = toSlides(items);
          setSlides(mapped);
          setIndex(0);
        }
      } catch {
        if (!stop) setSlides([]);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  // Progression + auto-advance
  useEffect(() => {
    if (!slides.length) return;
    durationRef.current = slides[index]?.durationMs ?? DEFAULT_DURATION_MS;
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const dur = durationRef.current;
      const p = Math.min(1, elapsed / dur);
      setProgress(p);
      if (p >= 1) {
        setIndex((i) => (i + 1) % slides.length);
        startRef.current = performance.now();
        setProgress(0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [slides, index]);

  if (!slides.length) return null;
  const current = slides[index];

  const goTo = (i: number) => {
    if (!slides.length) return;
    setIndex(((i % slides.length) + slides.length) % slides.length);
    startRef.current = performance.now();
    setProgress(0);
  };

  return (
    <section className="relative h-[100svh] w-full bg-black">
      {/* Media plein écran */}
      <div className="absolute inset-0">
        <iframe
          key={index}
          className="absolute inset-0 h-full w-full"
          src={current.src}
          title={current.alt}
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>

      {/* Vignette douce pour du relief */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_240px_rgba(0,0,0,0.55)]" />

      {/* Sélecteurs verticaux (droite) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[5]">
        {slides.map((_, i) => {
          const active = i === index;
          const pct = active ? progress : i < index ? 1 : 0;
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={[
                "group relative h-28 w-[4px] overflow-hidden rounded-full",
                "bg-white/25 transition-transform",
                active ? "scale-x-[1.35]" : "hover:scale-x-[1.2]",
              ].join(" ")}
            >
              <span
                className="absolute bottom-0 left-0 right-0 bg-white"
                style={{ height: `${Math.round(pct * 100)}%` }}
              />
            </button>
          );
        })}
      </div>

      {/* Légende discrète (optionnelle) */}
      <div className="pointer-events-none absolute left-6 bottom-6 text-white/70 text-xs tracking-wide">
        {current.alt}
      </div>
    </section>
  );
}
