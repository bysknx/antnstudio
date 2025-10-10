// components/ui/HeroPlayer.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
const MAX_FEATURED = 6;
const WHEEL_THROTTLE_MS = 1000;

function toSlides(items: VimeoItem[]): Slide[] {
  return items
    .filter((it) => typeof it.embed === "string" && it.embed.length > 0)
    .slice(0, MAX_FEATURED)
    .map((it) => ({
      // Flags Vimeo pour bg autoplay silencieux
      src: `${it.embed!}&muted=1&autoplay=1&playsinline=1&controls=0&pip=1&transparent=0&background=1`,
      alt: it.title ?? "Untitled",
      durationMs: DEFAULT_DURATION_MS,
    }));
}

export default function HeroPlayer({
  onReady,
  readyTimeoutMs = 3500,
}: {
  onReady?: () => void;
  readyTimeoutMs?: number;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const firstPlaySentRef = useRef(false);
  const safetyTimeoutRef = useRef<number | null>(null);
  const wheelLockRef = useRef<number>(0);
  const touchStartY = useRef<number | null>(null);

  // Fetch depuis /api/vimeo
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

  // Lancer la progression pour ce slide
  const startProgress = useCallback(() => {
    if (!slides.length) return;
    const dur = slides[index]?.durationMs ?? DEFAULT_DURATION_MS;
    setProgress(0);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / dur);
      setProgress(p);
      if (p >= 1) {
        setIndex((i) => (i + 1) % slides.length);
        return; // le prochain cycle repartira au "play" suivant
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [slides, index]);

  // Init Vimeo player pour le slide courant
  useEffect(() => {
    if (!slides.length) return;

    let cancelled = false;

    const run = async () => {
      setVisible(false);
      setProgress(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = window.setTimeout(() => {
        if (!cancelled) {
          // fallback si pas de "play" (privacy/autoplay)
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          startProgress();
        }
      }, readyTimeoutMs);

      try {
        const { default: Player } = await import("@vimeo/player");
        if (!iframeRef.current) return;

        // Détruire proprement l’ancien si présent
        try { await playerRef.current?.unload?.(); } catch {}

        playerRef.current = new Player(iframeRef.current);
        await playerRef.current.ready();

        // Tentative d’autoplay
        try {
          await playerRef.current.setMuted(true);
          await playerRef.current.play();
        } catch (e) {
          // Autoplay peut être bloqué : on laisse le timeout faire
        }

        // Démarrage effectif
        playerRef.current.on("play", () => {
          if (cancelled) return;
          if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          startProgress();
        });

        // Gestion d’erreur Vimeo → on passe au suivant
        playerRef.current.on("error", (err: any) => {
          // eslint-disable-next-line no-console
          console.warn("Vimeo error:", err);
          if (cancelled) return;
          if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          // Skip au prochain directement
          setIndex((i) => (i + 1) % slides.length);
        });
      } catch (e) {
        // Import du player KO → fallback
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

  const goTo = (i: number) => {
    if (!slides.length) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIndex(((i % slides.length) + slides.length) % slides.length);
  };

  // Wheel / swipe → step slides (throttle 1s)
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
      // Empêche le scroll page et navigue dans les slides
      e.preventDefault();
      const dir = e.deltaY > 0 ? 1 : -1;
      step(dir as 1 | -1);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY.current == null) return;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(dy) > 40) step(dy < 0 ? 1 : -1);
      touchStartY.current = null;
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

  return (
    <section id="hero-root" className="relative h-[100svh] w-full overflow-hidden bg-black">
      {/* Media plein écran (masqué tant que pas "play") */}
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

      {/* Vignette douce pour du relief */}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_240px_rgba(0,0,0,0.55)]" />

      {/* BARRES HORIZONTALES (à droite) */}
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
              {/* remplissage gauche→droite */}
              <span
                className="absolute left-0 top-0 bottom-0 bg-white/90 group-hover:bg-white"
                style={{ width: `${Math.round(pct * 100)}%` }}
              />
              {/* focus ring visible clavier */}
              <span className="absolute inset-0 rounded-full ring-0 group-focus-visible:ring-2 group-focus-visible:ring-white/70" />
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
