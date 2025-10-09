"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Slide =
  | { type: "image"; src: string; alt?: string; durationMs?: number }
  | { type: "video"; src: string }
  | { type: "vimeo"; src: string };

const IMAGE_DEFAULT = 10_000;
const SCROLL_LOCK_MS = 1000;
const LINES_GAP = 10;
const LINE_W = 28;
const LINE_W_ACTIVE = 84;
const LINE_H = 2;

const isVimeo = (src: string) => /player\.vimeo\.com\/video\//.test(src);
const withVimeoParams = (src: string) => {
  try {
    const u = new URL(src, "https://player.vimeo.com");
    const p = u.searchParams;
    p.set("autoplay", "1");
    p.set("muted", "1");
    p.set("autopause", "0");
    p.set("controls", "1");     // tu peux mettre "0" si tu préfères sans
    p.set("title", "0");
    p.set("byline", "0");
    p.set("portrait", "0");
    return u.toString();
  } catch {
    return src;
  }
};

export default function FullBleedPlayer({ items }: { items: Slide[] }) {
  const slides = useMemo(() => items?.filter(Boolean) ?? [], [items]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);

  const rafId = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startedAt = useRef<number>(0);
  const imgDuration = useRef<number>(IMAGE_DEFAULT);
  const scrollLocked = useRef(false);

  const clearRAF = () => { if (rafId.current != null) cancelAnimationFrame(rafId.current); rafId.current = null; };
  const go = useCallback((i: number) => setIndex((i + slides.length) % Math.max(1, slides.length)), [slides.length]);

  const startImageTimer = useCallback((durationMs: number) => {
    clearRAF();
    imgDuration.current = durationMs;
    startedAt.current = performance.now();
    const tick = (t: number) => {
      if (paused) { rafId.current = requestAnimationFrame(tick); return; }
      const p = Math.min(1, (t - startedAt.current) / imgDuration.current);
      setProgress(p);
      if (p >= 1) go(index + 1);
      else rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);
  }, [go, index, paused]);

  useEffect(() => {
    setProgress(0);
    clearRAF();

    const current = slides[index];
    if (!current) return;

    if (current.type === "video") {
      const v = videoRef.current;
      if (!v) return;

      const onLoaded = () => { v.currentTime = 0; if (!paused) v.play().catch(() => {}); };
      const onTime = () => { if (!v.duration || isNaN(v.duration)) return; setProgress(Math.min(1, v.currentTime / v.duration)); };
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

    // image or vimeo → timer for images only
    if (current.type === "image") startImageTimer(current.durationMs ?? IMAGE_DEFAULT);

    return () => clearRAF();
  }, [index, slides, go, startImageTimer, paused]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (slides[index]?.type !== "video") return;
    if (paused) v.pause(); else v.play().catch(() => {});
  }, [paused, index, slides]);

  // step-by-step scroll
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (scrollLocked.current) return;
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      scrollLocked.current = true;
      go(index + (dir > 0 ? 1 : -1));
      setTimeout(() => (scrollLocked.current = false), SCROLL_LOCK_MS);
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dy) < 30 || scrollLocked.current) return;
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

  return (
    <section
      className="relative h-[100svh] w-full overflow-hidden bg-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label="Featured works"
    >
      {/* FULL BLEED LAYER */}
      <div className="absolute inset-0">
        {slides.map((item, i) => {
          const visible = i === index;

          return (
            <div
              key={i}
              className={
                "absolute inset-0 transition-all duration-500 " +
                (visible ? "opacity-100" : "opacity-0")
              }
              aria-hidden={!visible}
            >
              {/* Cover wrapper: crops content to fill the viewport */}
              <div className="absolute inset-0 overflow-hidden">
                {item.type === "image" && (
                  <img
                    src={item.src}
                    alt={item.alt ?? ""}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                )}

                {item.type === "video" && (
                  <video
                    ref={visible ? videoRef : undefined}
                    src={item.src}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    autoPlay
                    controls
                  />
                )}

                {item.type === "vimeo" && (
                  // iframes can't object-fit: cover → oversize a bit + center
                  <div className="absolute inset-0">
                    <iframe
                      src={withVimeoParams(item.src)}
                      className="absolute left-1/2 top-1/2 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      title="Vimeo player"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* right indicators */}
      <div
        className="pointer-events-auto absolute right-6 top-1/2 -translate-y-1/2 flex flex-col items-end"
        style={{ gap: LINES_GAP }}
      >
        {slides.map((_, i) => {
          const active = i === index;
          const baseW = active ? LINE_W_ACTIVE : LINE_W;

          return (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Aller à l’élément ${i + 1}`}
              className="relative cursor-pointer outline-none"
              style={{ padding: "6px 10px", marginRight: "-10px" }}
            >
              <span
                className={[
                  "block origin-right rounded-[2px] transition-all",
                  "hover:scale-x-[1.35] hover:scale-y-[1.6] focus:scale-x-[1.35] focus:scale-y-[1.6]",
                  active ? "bg-white/30" : "bg-white/18 hover:bg-white",
                ].join(" ")}
                style={{ width: baseW, height: LINE_H }}
              />
              {active && (
                <span
                  className="pointer-events-none absolute left-[10px] top-[6px] h-[2px] rounded-[2px] bg-white transition-[width] ease-linear"
                  style={{ width: `${Math.max(0, Math.min(1, progress)) * baseW}px` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
