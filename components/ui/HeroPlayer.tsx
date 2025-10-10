"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** ---- Types ---- */
type VimeoItem = {
  id: string;
  title?: string;
  embed?: string;     // fourni par /api/vimeo
  duration?: number;  // secondes si dispo
};

type Slide = {
  src: string;        // URL d’embed vimeo complet (avec query)
  alt: string;
  durationMs: number;
};

/** ---- Constantes ---- */
const DEFAULT_DURATION_MS = 15000;
const MAX_FEATURED = 6;
const WHEEL_THROTTLE_MS = 1000;

/** ---- Mapping API->slides ---- */
function toSlides(items: VimeoItem[]): Slide[] {
  return items
    .filter((it) => typeof it.embed === "string" && it.embed.length > 0)
    .slice(0, MAX_FEATURED)
    .map((it) => ({
      src: `${it.embed!}&muted=1&autoplay=1&playsinline=1&controls=0&pip=1&transparent=0&background=1`,
      alt: it.title ?? "Untitled",
      durationMs: DEFAULT_DURATION_MS,
    }));
}

/** ---- Composant ---- */
export default function HeroPlayer({
  onReady,
  readyTimeoutMs = 3500,
}: {
  onReady?: () => void;
  readyTimeoutMs?: number;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);

  const firstPlaySentRef = useRef(false);
  const safetyTimeoutRef = useRef<number | null>(null);
  const wheelLockRef = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);

  /** Fetch Vimeo items */
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
      } catch (e) {
        console.warn("[Hero] API /api/vimeo failed:", e);
        if (!stop) setSlides([]);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  /** Lancer la progression pour le slide courant */
  const startProgress = useCallback(() => {
    if (!slides.length) return;
    const dur = slides[index]?.durationMs ?? DEFAULT_DURATION_MS;
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / dur);
      setProgress(p);
      if (p >= 1) {
        setIndex((i) => (i + 1) % slides.length);
        return; // le prochain cycle redémarre quand le prochain "play" arrive
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [slides, index]);

  /** Initialise le player Vimeo pour le slide courant */
  useEffect(() => {
    if (!slides.length) return;

    let cancelled = false;

    const run = async () => {
      setVisible(false);
      setProgress(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      // Filet si aucun "play" ne vient
      if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = window.setTimeout(() => {
        if (!cancelled) {
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          startProgress();
        }
      }, readyTimeoutMs);

      try {
        const mod = await import("@vimeo/player");
        const Player = mod.default;
        if (!iframeRef.current) throw new Error("iframeRef null");

        try {
          await playerRef.current?.unload?.();
        } catch {}

        playerRef.current = new Player(iframeRef.current);
        await playerRef.current.ready();

        try {
          await playerRef.current.setMuted(true);
          await playerRef.current.play();
        } catch {
          // autoplay peut être bloqué: le timeout fera le job
        }

        playerRef.current.on?.("play", () => {
          if (cancelled) return;
          if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          startProgress();
        });

        playerRef.current.on?.("error", (err: any) => {
          console.warn("[Hero] Vimeo error:", err);
          if (cancelled) return;
          if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          // Skip au prochain
          setIndex((i) => (i + 1) % slides.length);
        });
      } catch (e) {
        console.warn("[Hero] player init failed:", e);
        if (!cancelled) {
          if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          startProgress();
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
      try {
        playerRef.current?.off?.("play");
        playerRef.current?.off?.("error");
        playerRef.current?.unload?.();
      } catch {}
    };
  }, [slides, index, onReady, readyTimeoutMs, startProgress]);

  if (!slides.length) return null;
  const current = slides[index];

  /** Navigation manuelle */
  const goTo = (i: number) => {
    if (!slides.length) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIndex(((i % slides.length) + slides.length) % slides.length);
  };

  /** Wheel / swipe (throttle) */
  const step = useCallback(
    (dir: 1 | -1) => {
      const now = Date.now();
      if (now - wheelLockRef.current < WHEEL_THROTTLE_MS) return;
      wheelLockRef.current = now;
      goTo(index + dir);
    },
    [index],
  );

  useEffect(() => {
    const el = document.getElementById("hero-root");
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      try {
        e.preventDefault();
        step((e.deltaY > 0 ? 1 : -1) as 1 | -1);
      } catch (err) {
        console.warn("[Hero] wheel handler error:", err);
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (e: TouchEvent) => {
      try {
        if (touchStartY.current == null) return;
        const dy = e.changedTouches[0]?.clientY - touchStartY.current;
        if (Math.abs(dy) > 40) step(dy < 0 ? 1 : -1);
      } finally {
        touchStartY.current = null;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel as any);
      el.removeEventListener("touchstart", onTouchStart as any);
      el.removeEventListener("touchend", onTouchEnd as any);
    };
  }, [step]);

  /** UI */
  return (
    <section id="hero-root" className="relative h-[100svh] w-full overflow-hidden bg-black">
      {/* Media plein écran */}
      <div className="absolute inset-0">
        <iframe
          key={index}
          ref={iframeRef}
          className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          src={current.src}
          title={current.alt}
          allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
        />
      </div>

      {/* Vignette douce */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_240px_rgba(0,0,0,0.55)]" />

      {/* Barres horizontales (droite) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[5] w-[160px]">
        {slides.map((_, i) => {
          const active = i === index;
          const pct = active ? progress : i < index ? 1 : 0;
          return (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Aller au projet ${i + 1}`}
              className={[
                "group relative h-[8px] w-full overflow-hidden rounded-full",
                "bg-white/15 transition-all",
                active ? "ring-1 ring-white/40" : "hover:bg-white/25",
              ].join(" ")}
            >
              <span
                className="absolute left-0 top-0 bottom-0 bg-white/90 group-hover:bg-white"
                style={{ width: `${Math.round(pct * 100)}%` }}
              />
              <span className="absolute inset-0 rounded-full ring-0 group-focus-visible:ring-2 group-focus-visible:ring-white/70" />
            </button>
          );
        })}
      </div>

      {/* Légende courte */}
      <div className="pointer-events-none absolute left-6 bottom-6 text-white/70 text-xs tracking-wide">
        {current.alt}
      </div>
    </section>
  );
}
