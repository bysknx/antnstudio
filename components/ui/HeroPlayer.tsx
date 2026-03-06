"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VideoItem = {
  id: string;
  title?: string;
  url?: string;
  embed?: string;
  duration?: number | null;
  client?: string;
  year?: number | null;
};

type Slide = {
  src: string;
  alt: string;
  durationMs: number;
  durationSeconds?: number;
};

const DEFAULT_DURATION_MS = 15000;
const MAX_FEATURED = 6;
const WHEEL_THROTTLE_MS = 1000;

function buildSlide(item: VideoItem): Slide | null {
  const src = item.url || item.embed;
  if (!src || typeof src !== "string") return null;

  const durationMs =
    typeof item.duration === "number" && item.duration > 0
      ? item.duration * 1000
      : DEFAULT_DURATION_MS;

  return {
    src,
    alt: item.title ?? "Untitled",
    durationMs,
    durationSeconds:
      typeof item.duration === "number" && item.duration > 0
        ? item.duration
        : undefined,
  };
}

function toSlides(items: VideoItem[]): Slide[] {
  return items
    .map((it) => buildSlide(it))
    .filter((slide): slide is Slide => Boolean(slide))
    .slice(0, MAX_FEATURED);
}

export default function HeroPlayer({
  items,
  onReady,
  readyTimeoutMs = 3500,
}: {
  items?: VideoItem[];
  onReady?: () => void;
  readyTimeoutMs?: number;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const firstReadySentRef = useRef(false);
  const safetyTimeoutRef = useRef<number | null>(null);
  const wheelLockRef = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    if (items && items.length) {
      setSlides(toSlides(items));
      setIndex(0);
      return;
    }
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const apiItems: VideoItem[] = Array.isArray(json?.items)
          ? json.items
          : [];
        if (!stop) {
          setSlides(toSlides(apiItems));
          setIndex(0);
        }
      } catch (err) {
        console.warn("[Hero] Manifest vidéo (API) failed:", err);
        if (!stop) setSlides([]);
      }
    })();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(
      items?.map((i) => ({ id: i.id, url: i.url, duration: i.duration })),
    ),
  ]);

  const startProgress = useCallback(() => {
    if (!slides.length) return;
    const target = slides[index]?.durationMs ?? DEFAULT_DURATION_MS;
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - startRef.current) / target);
      setProgress(p);
      if (p >= 1) {
        setIndex((i) => (i + 1) % slides.length);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [slides, index]);

  useEffect(() => {
    if (!slides.length) return;

    let cancelled = false;
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);

    // Safety timeout: afficher quoi qu'il arrive après readyTimeoutMs
    safetyTimeoutRef.current = window.setTimeout(() => {
      if (!cancelled) {
        setVisible(true);
        if (!firstReadySentRef.current) {
          firstReadySentRef.current = true;
          onReady?.();
        }
        startProgress();
      }
    }, readyTimeoutMs);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
    };
  }, [slides, index, onReady, readyTimeoutMs, startProgress]);

  const handleVideoCanPlay = useCallback(() => {
    if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
    setVisible(true);
    if (!firstReadySentRef.current) {
      firstReadySentRef.current = true;
      onReady?.();
      // Signal the loading screen
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("antn:video-ready"));
      }
    }
    startProgress();
  }, [onReady, startProgress]);

  const totalSlides = slides.length;

  const goTo = useCallback(
    (i: number) => {
      if (!totalSlides) return;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setIndex(((i % totalSlides) + totalSlides) % totalSlides);
    },
    [totalSlides],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      if (!totalSlides) return;
      const now = Date.now();
      if (now - wheelLockRef.current < WHEEL_THROTTLE_MS) return;
      wheelLockRef.current = now;
      goTo(index + dir);
    },
    [index, totalSlides, goTo],
  );

  useEffect(() => {
    if (!totalSlides) return;
    const root = document.getElementById("hero-root");
    if (!root) return;

    const onWheel = (event: WheelEvent) => {
      try {
        event.preventDefault();
        step((event.deltaY > 0 ? 1 : -1) as 1 | -1);
      } catch (err) {
        console.warn("[Hero] wheel handler error:", err);
      }
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchEnd = (event: TouchEvent) => {
      try {
        if (touchStartY.current == null) return;
        const dy = event.changedTouches[0]?.clientY - touchStartY.current;
        if (Math.abs(dy) > 40) step(dy < 0 ? 1 : -1);
      } finally {
        touchStartY.current = null;
      }
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      root.removeEventListener("wheel", onWheel as EventListener);
      root.removeEventListener("touchstart", onTouchStart as EventListener);
      root.removeEventListener("touchend", onTouchEnd as EventListener);
    };
  }, [totalSlides, step]);

  if (!totalSlides) return null;
  const current = slides[index];

  const runtimeSeconds =
    current.durationSeconds ?? Math.round(current.durationMs / 1000);
  const minutes = Math.floor(runtimeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(runtimeSeconds % 60)
    .toString()
    .padStart(2, "0");
  const stats = [
    { label: "Now Playing", value: current.alt },
    { label: "Duration", value: `${minutes}:${seconds}` },
    { label: "Slide", value: `${index + 1}/${totalSlides}` },
  ] as { label: string; value: string }[];

  return (
    <section
      id="hero-root"
      className="relative h-[100svh] w-full overflow-hidden bg-black"
    >
      <div className="absolute inset-0">
        <video
          key={index}
          ref={videoRef}
          data-cover
          className={`hero-iframe transition-opacity duration-300 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
          src={current.src}
          autoPlay
          muted
          loop
          playsInline
          onCanPlay={handleVideoCanPlay}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_240px_rgba(0,0,0,0.55)]" />

      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex w-[160px] flex-col gap-3 z-[5]">
        {slides.map((_, i) => {
          const active = i === index;
          const pct = active ? progress : 0;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Afficher le projet ${i + 1}`}
              className={[
                "group relative w-full overflow-hidden rounded-full cursor-pointer transition-all",
                active
                  ? "h-[11px] bg-white/35 ring-1 ring-white/60"
                  : "h-[7px] bg-white/12 hover:bg-white/22",
              ].join(" ")}
            >
              <span
                className="absolute inset-y-0 left-0 bg-white/90 transition-all duration-200 group-hover:bg-white"
                style={{
                  width: `${Math.min(100, Math.max(0, Math.round(pct * 100)))}%`,
                }}
              />
              <span className="absolute inset-0 rounded-full ring-0 group-focus-visible:ring-2 group-focus-visible:ring-white/70" />
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[6.5rem] flex justify-center px-4 sm:bottom-[7rem]">
        <div className="pointer-events-auto max-w-[280px] rounded border border-white/10 bg-black/50 px-3 py-2 text-[10px] backdrop-blur-sm">
          <ul className="flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono">
            {stats.map((entry) => (
              <li key={entry.label} className="flex items-baseline gap-1.5">
                <span className="uppercase tracking-wider text-white/45">
                  {entry.label}
                </span>
                <span className="text-white/80 truncate max-w-[140px]">
                  {entry.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
