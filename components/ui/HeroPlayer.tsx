"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Item = {
  type: "image" | "video" | "embed"; // ← ajout embed (Vimeo / iframe)
  src: string;
  alt?: string;
  /** Optionnel: durée d'affichage si image/embed (ms). Par défaut 10000 (image) / 15000 (embed) */
  durationMs?: number;
};

const IMAGE_DEFAULT = 10_000; // 10s (images)
const EMBED_DEFAULT = 15_000; // 15s (iframe / Vimeo simulé)
const GAP = 10;               // écart entre lignes (px)
const LINE_W = 28;            // largeur lignes inactives
const LINE_W_ACTIVE = 84;     // largeur ligne active
const LINE_H = 2;             // épaisseur lignes
const SCROLL_LOCK_MS = 1000;  // throttle du scroll (1s)

/* Petit cadre blanc avec 1px de "jour" autour du média */
function WhiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-white/90 shadow-[0_0_0_0.5px_rgba(255,255,255,0.6)]">
      <div className="bg-black p-[1px]">{children}</div>
    </div>
  );
}

export default function HeroPlayer({ items }: { items: Item[] }) {
  const slides = useMemo(() => items?.filter(Boolean) ?? [], [items]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const [paused, setPaused] = useState(false);

  const rafId = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startedAt = useRef<number>(0);
  const imgDuration = useRef<number>(IMAGE_DEFAULT);
  const scrollLocked = useRef(false);

  const clearRAF = () => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    rafId.current = null;
  };

  const go = useCallback(
    (i: number) => setIndex((i + slides.length) % Math.max(1, slides.length)),
    [slides.length]
  );

  // Gestion timer (images + embed/iframe)
  const startTimedProgress = useCallback(
    (durationMs: number) => {
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
    },
    [go, index, paused]
  );

  // Quand l’index change, (re)configure selon type
  useEffect(() => {
    setProgress(0);
    clearRAF();

    const current = slides[index];
    if (!current) return;

    // EMBED (ex: Vimeo) → on simule la durée
    if (current.type === "embed") {
      startTimedProgress(current.durationMs ?? EMBED_DEFAULT);
      return () => clearRAF();
    }

    // VIDÉO
    if (current.type === "video") {
      const v = videoRef.current;
      if (!v) return;

      const onLoaded = () => {
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

      return () => {
        v.pause();
        v.removeEventListener("loadedmetadata", onLoaded);
        v.removeEventListener("timeupdate", onTime);
        v.removeEventListener("ended", onEnded);
      };
    }

    // IMAGE
    startTimedProgress(current.durationMs ?? IMAGE_DEFAULT);
    return () => clearRAF();
  }, [index, slides, go, startTimedProgress, paused]);

  // Pause/reprise (vidéo uniquement ; image/embed gérés par RAF)
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (slides[index]?.type !== "video") return;

    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused, index, slides]);

  // Scroll step-by-step + throttle 1s (smooth via transitions)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault(); // on gère nous-mêmes le step
      if (scrollLocked.current) return;
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      scrollLocked.current = true;
      go(index + (dir > 0 ? 1 : -1));
      setTimeout(() => (scrollLocked.current = false), SCROLL_LOCK_MS);
    };

    // Support tactile (swipe vertical)
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dy) < 30) return;
      if (scrollLocked.current) return;
      scrollLocked.current = true;
      go(index + (dy < 0 ? 1 : -1));
      setTimeout(() => (scrollLocked.current = false), SCROLL_LOCK_MS);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("wheel", onWheel as any);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [go, index]);

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
      {/* Media plein écran avec transition smooth */}
      <div className="absolute inset-0 grid place-items-center">
        {slides.map((item, i) => {
          const visible = i === index;
          return (
            <div
              key={i}
              className={`absolute transition-all duration-600 ease-[cubic-bezier(.2,.8,.2,1)]
                          ${visible ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-[.985] blur-[4px]"}
                          max-h-[84svh] max-w-[88vw]`}
              aria-hidden={!visible}
            >
              <WhiteFrame>
                {item.type === "image" && (
                  <img
                    src={item.src}
                    alt={item.alt ?? ""}
                    className="block max-h-[84svh] max-w-[88vw] object-contain bg-black select-none"
                    draggable={false}
                  />
                )}

                {item.type === "video" && (
                  <video
                    ref={visible ? videoRef : undefined}
                    src={item.src}
                    className="block max-h-[84svh] max-w-[88vw] bg-black"
                    muted
                    playsInline
                    autoPlay
                    controls={true}
                  />
                )}

                {item.type === "embed" && (
                  <iframe
                    src={item.src}
                    title={item.alt ?? "Embedded player"}
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="block aspect-video max-h-[84svh] max-w-[88vw] bg-black"
                    width="3840"
                    height="2160"
                    frameBorder={0}
                  />
                )}
              </WhiteFrame>
            </div>
          );
        })}
      </div>

      {/* Overlay léger pour la lisibilité */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/25 via-black/10 to-black/40" />

      {/* Indicateurs : petites lignes à droite (hit-area large + hover visible) */}
      <div
        className="pointer-events-auto absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end"
        style={{ gap: GAP }}
      >
        {slides.map((_, i) => {
          const active = i === index;
          const w = active ? LINE_W_ACTIVE : LINE_W;

          return (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Aller à l’élément ${i + 1}`}
              aria-pressed={active}
              className="group relative cursor-pointer select-none"
              style={{ padding: "8px 10px" }} // zone cliquable accrue
            >
              {/* ligne de fond (devient blanche + grossit en hover) */}
              <span
                className={[
                  "block rounded-[1px] origin-right transform transition-all duration-200 ease-out",
                  active ? "bg-white/80" : "bg-white/20 group-hover:bg-white",
                  "group-hover:scale-x-110 group-hover:scale-y-150", // longueur + épaisseur
                ].join(" ")}
                style={{ width: w, height: LINE_H }}
              />

              {/* remplissage si active (barre de progression) */}
              {active && (
                <span
                  className="absolute left-[10px] top-1/2 -translate-y-1/2 h-[2px] bg-white rounded-[1px] transition-[width] ease-linear"
                  style={{ width: `${Math.max(0, Math.min(1, progress)) * w}px` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
