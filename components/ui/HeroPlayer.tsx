// components/ui/HeroPlayer.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type ExternalSlide = {
  type: "embed" | "video" | "image";
  src: string;
  alt?: string;
  durationMs?: number; // optionnel si tu fournis des slides à la main
};

type VimeoItem = {
  id: string;
  title?: string;
  embed?: string;
  duration?: number; // en secondes si dispo
};

type Props = {
  /** Slides fournis par la page.
   *  Peut être un tableau direct OU un objet { items: [...] } (patch de robustesse). */
  items?: ExternalSlide[] | { items: ExternalSlide[] } | unknown;
};

// --- helpers ---
function normalizeSlides(input: Props["items"]): ExternalSlide[] {
  if (Array.isArray((input as any)?.items)) return (input as any).items as ExternalSlide[];
  if (Array.isArray(input)) return input as ExternalSlide[];
  return [];
}

function toSlidesFromVimeo(items: VimeoItem[]): ExternalSlide[] {
  return items
    .filter((it) => it.embed)
    .map((it) => ({
      type: "embed" as const,
      src: `${it.embed!}&muted=1&autoplay=1&playsinline=1&controls=0&pip=1&transparent=0`,
      alt: it.title ?? "Untitled",
      durationMs: Math.max(5000, (it.duration ?? 15) * 1000),
    }));
}

export default function HeroPlayer({ items }: Props) {
  // source des slides : props normalisées → sinon API
  const initial = normalizeSlides(items);
  const [slides, setSlides] = useState<ExternalSlide[]>(initial);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<number | null>(null);

  // réagit aux changements de props (quelle que soit la forme reçue)
  useEffect(() => {
    const normalized = normalizeSlides(items);
    if (normalized.length) {
      setSlides(normalized);
      setIdx(0);
      return;
    }

    // sinon, fetch Vimeo
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const vimeoItems: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
        if (!stop) {
          setSlides(toSlidesFromVimeo(vimeoItems));
          setIdx(0);
        }
      } catch {
        if (!stop) setSlides([]);
      }
    })();

    return () => {
      stop = true;
    };
  }, [items]);

  // avance auto
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

  // supporte video/image/embed
  const isEmbed = current.type === "embed";
  const isVideo = current.type === "video";
  const isImage = current.type === "image";

  return (
    <section className="relative">
      <div className="relative w-full pb-[56.25%] overflow-hidden rounded-xl border border-white/10 bg-black">
        {isEmbed && (
          <iframe
            key={idx}
            className="absolute inset-0 h-full w-full"
            src={current.src}
            title={current.alt ?? "Slide"}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        )}

        {isVideo && (
          <video
            key={idx}
            className="absolute inset-0 h-full w-full object-cover"
            src={current.src}
            autoPlay
            muted
            playsInline
            loop={false}
          />
        )}

        {isImage && (
          <img
            key={idx}
            className="absolute inset-0 h-full w-full object-cover"
            src={current.src}
            alt={current.alt ?? "Slide"}
          />
        )}
      </div>

      {/* indicateurs */}
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
