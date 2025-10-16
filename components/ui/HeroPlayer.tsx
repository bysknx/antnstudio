"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type VimeoItem = {
  id: string;
  title?: string;
  embed?: string;
  duration?: number;
};

type Slide = {
  src: string;
  alt: string;
  durationMs: number;
};

type HeroItem = {
  id: string;
  title?: string;
  embed?: string;
  duration?: number;
};

const DEFAULT_DURATION_MS = 15000;
const MAX_FEATURED = 6;
const WHEEL_THROTTLE_MS = 1000;

function buildSlide(embed?: string, title?: string): Slide | null {
  if (!embed || typeof embed !== "string") return null;
  try {
    const url = new URL(embed.trim(), "https://player.vimeo.com");
    const params = url.searchParams;
    const set = (key: string, value: string) => {
      params.set(key, value);
    };
    set("muted", "1");
    set("autoplay", "1");
    set("autopause", "0");
    set("loop", "1");
    set("playsinline", "1");
    set("controls", "0");
    set("pip", "1");
    set("title", "0");
    set("byline", "0");
    set("portrait", "0");
    set("transparent", "0");
    params.delete("background");
    return {
      src: url.toString(),
      alt: title ?? "Untitled",
      durationMs: DEFAULT_DURATION_MS,
    };
  } catch {
    return null;
  }
}

function toSlides(items: Array<Pick<HeroItem, "embed" | "title">>): Slide[] {
  return items
    .map((it) => buildSlide(it.embed, it.title))
    .filter((slide): slide is Slide => Boolean(slide))
    .slice(0, MAX_FEATURED);
}

export default function HeroPlayer({
  items,
  onReady,
  readyTimeoutMs = 3500,
}: {
  items?: HeroItem[];
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
        const apiItems: VimeoItem[] = Array.isArray(json?.items)
          ? json.items
          : [];
        if (!stop) {
          setSlides(toSlides(apiItems));
          setIndex(0);
        }
      } catch (err) {
        console.warn("[Hero] API /api/vimeo failed:", err);
        if (!stop) setSlides([]);
      }
    })();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(items?.map((i) => ({ id: i.id, embed: i.embed })))]);

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

    const run = async () => {
      setVisible(false);
      setProgress(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      if (safetyTimeoutRef.current)
        window.clearTimeout(safetyTimeoutRef.current);
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
        } catch {
          // ignore
        }

        playerRef.current = new Player(iframeRef.current);
        await playerRef.current.ready();

        try {
          await playerRef.current.setMuted(true);
          await playerRef.current.setVolume?.(0);
          await playerRef.current.play();
        } catch {
          // autoplay blocked; fallback handled by timeout
        }

        playerRef.current.on?.("play", () => {
          if (cancelled) return;
          if (safetyTimeoutRef.current)
            window.clearTimeout(safetyTimeoutRef.current);
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          startProgress();
        });

        playerRef.current.on?.("error", (err: unknown) => {
          console.warn("[Hero] Vimeo error:", err);
          if (cancelled) return;
          if (safetyTimeoutRef.current)
            window.clearTimeout(safetyTimeoutRef.current);
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          setIndex((i) => (i + 1) % slides.length);
        });
      } catch (err) {
        console.warn("[Hero] player init failed:", err);
        if (!cancelled) {
          if (safetyTimeoutRef.current)
            window.clearTimeout(safetyTimeoutRef.current);
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
      if (safetyTimeoutRef.current)
        window.clearTimeout(safetyTimeoutRef.current);
      try {
        playerRef.current?.off?.("play");
        playerRef.current?.off?.("error");
        playerRef.current?.unload?.();
      } catch {
        // ignore
      }
    };
  }, [slides, index, onReady, readyTimeoutMs, startProgress]);

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

  return (
    <section
      id="hero-root"
      className="relative h-[100svh] w-full overflow-hidden bg-black"
    >
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
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          loading="eager"
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
                  width: `${Math.min(
                    100,
                    Math.max(0, Math.round(pct * 100)),
                  )}%`,
                }}
              />
              <span className="absolute inset-0 rounded-full ring-0 group-focus-visible:ring-2 group-focus-visible:ring-white/70" />
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute left-6 bottom-[7rem] sm:bottom-[7.5rem] text-white/70 text-xs tracking-wide">
        {current.alt}
      </div>
    </section>
  );
}
