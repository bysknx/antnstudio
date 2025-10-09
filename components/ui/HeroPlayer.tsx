"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Item = {
  type: "image" | "video";
  src: string;
  alt?: string;
  /** Optionnel: durée d'affichage si image (ms). Par défaut 10000 */
  durationMs?: number;
};

const IMAGE_DEFAULT = 10_000; // 10s
const GAP = 10;               // écart entre lignes (px)
const LINE_W = 28;            // largeur lignes inactives
const LINE_W_ACTIVE = 84;     // largeur ligne active
const LINE_H = 2;             // épaisseur lignes

export default function HeroPlayer({ items }: { items: Item[] }) {
  const slides = useMemo(() => items?.filter(Boolean) ?? [], [items]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const [paused, setPaused] = useState(false);

  const rafId = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startedAt = useRef<number>(0);
  const imgDuration = useRef<number>(IMAGE_DEFAULT);

  const clearRAF = () => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  };

  const go = useCallback(
    (i: number) => setIndex((i + slides.length) % Math.max(1, slides.length)),
    [slides.length]
  );

  // Gestion des images (progression par RAF)
  const startImageTimer = useCallback((durationMs: number) => {
    clearRAF();
    imgDuration.current = durationMs;
    startedAt.current = performance.now();
    const tick = (t: number) => {
      if (paused) {
        rafId.current = requestAnimationFrame(tick);
        return;
      }
      const d = imgDuration.current;
      const p = Math.min(1, (t - startedAt.current) / d);
      setProgress(p);
      if (p >= 1) {
        go(index + 1);
      } else {
        rafId.current = requestAnimationFrame(tick);
      }
    };
    rafId.current = requestAnimationFrame(tick);
  }, [go, index, paused]);

  // Quand l’index change, (re)configure selon type
  useEffect(() => {
    setProgress(0);
    clearRAF();

    const current = slides[index];
    if (!current) return;

    // Si vidéo
    if (current.type === "video") {
      const v = videoRef.current;
      if (!v) return;

      const onLoaded = () => {
        // autoplay (sans loop pour pouvoir avancer à la fin)
        v.currentTime = 0;
        if (!paused) v.play().catch(() => {});
      };
      const onTime = () => {
        if (!v.duration || isNaN(v.duration)) return;
        setProgress(Math.min(1, v.currentTime / v.duration));
      };
      const onEnded = () => go(index + 1);

      v.addEventListener("loadedmetadata", onLoaded);
      v.addEventListener("timeupdate", onTime);
      v.addEventListener("ended", onEnded);

      // cleanup
      return () => {
        v.pause();
        v.removeEventListener("loadedmetadata", onLoaded);
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("ended", onEnded);
      };
    }

    // Si image
    startImageTimer(current.durationMs ?? IMAGE_DEFAULT);

    return () => clearRAF();
  }, [index, slides, go, startImageTimer, paused]);

  // Pause/reprise (vidéo + image)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (slides[index]?.type !== "video") return;

    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, index, slides]);

  if (!slides.length) return null;

  const current = slides[index];

  return (
    <section
      className="relative min-h-[100svh] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Featured works"
    >
      {/* Media plein écran */}
      <div className="absolute inset-0">
        {slides.map((item, i) => {
          const visible = i === index;
          return (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-500 ${
                visible ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={!visible}
            >
              {item.type === "image" ? (
                <img
                  src={item.src}
                  alt={item.alt ?? ""}
                  className="h-full w-full object-cover select-none"
                  draggable={false}
                />
              ) : (
                <video
                  ref={visible ? videoRef : undefined}
                  src={item.src}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                  autoPlay
                  controls={false}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Overlay léger pour la lisibilité (facile à retoucher ou retirer) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/40 pointer-events-none" />

      {/* Indicateurs : petites lignes à droite */}
      <div
        className="pointer-events-auto absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end"
        style={{ gap: GAP }}
      >
        {slides.map((_, i) => {
          const active = i === index;
          const w = active ? LINE_W_ACTIVE : LINE_W;
          const bg = active ? "bg-white/30" : "bg-white/18";

          return (
            <button
              key={i}
              onClick={() => go(i)}
              className="relative"
              aria-label={`Aller à l’élément ${i + 1}`}
              style={{ width: w, height: LINE_H }}
            >
              {/* ligne de fond */}
              <span className={`absolute inset-0 ${bg} rounded-[1px]`} />
              {/* remplissage si active */}
              {active && (
                <span
                  className="absolute left-0 top-0 h-full bg-white/90 rounded-[1px] transition-[width] ease-linear"
                  style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
