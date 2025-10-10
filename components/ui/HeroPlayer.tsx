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
      // Important: on force les bons flags Vimeo (mute/autoplay/playsinline/controls off)
      src: `${it.embed!}&muted=1&autoplay=1&playsinline=1&controls=0&pip=1&transparent=0&background=1`,
      alt: it.title ?? "Untitled",
      durationMs: Math.max(5000, (it.duration ?? DEFAULT_DURATION_MS / 1000) * 1000),
    }));
}

export default function HeroPlayer({
  onReady,             // appelé sur le premier "play" du premier slide
  readyTimeoutMs = 3500, // filet de sécurité si Vimeo tarde
}: {
  onReady?: () => void;
  readyTimeoutMs?: number;
}) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);           // 0..1
  const [visible, setVisible] = useState(false);         // iframe visible après "play"
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const durationRef = useRef<number>(DEFAULT_DURATION_MS);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const firstPlaySentRef = useRef(false);
  const safetyTimeoutRef = useRef<number | null>(null);

  // Fetch strict depuis /api/vimeo
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

  // Lance la progression (raf) UNIQUEMENT après "play"
  const startProgress = () => {
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
        // slide suivant
        setIndex((i) => (i + 1) % slides.length);
        setProgress(0);
        // on relancera un nouveau cycle quand le prochain "play" arrivera
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  // Initialisation/gestion du player Vimeo pour le slide courant
  useEffect(() => {
    if (!slides.length) return;

    let cancelled = false;

    const init = async () => {
      // Reset visibilité & progression tant que le nouveau slide n'a pas démarré
      setVisible(false);
      setProgress(0);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      // Sécurité: si le "play" ne vient pas, on affiche quand même après timeout
      if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = window.setTimeout(() => {
        if (!cancelled) {
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.();
          }
          // On démarre quand même la progression
          startProgress();
        }
      }, readyTimeoutMs);

      // (ré)instancie le player sur l'iframe
      try {
        const { default: Player } = await import("@vimeo/player");
        if (!iframeRef.current) return;
        // Détruit l'ancien player si besoin
        try { await playerRef.current?.unload?.(); } catch {}
        playerRef.current = new Player(iframeRef.current);

        await playerRef.current.ready();
        try {
          await playerRef.current.setMuted(true);
          await playerRef.current.play();
        } catch {
          // Autoplay potentiellement bloqué → on laisse le timeout faire le job
        }

        // Sur vrai démarrage
        playerRef.current.on("play", () => {
          if (cancelled) return;
          if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
          setVisible(true);
          if (!firstPlaySentRef.current) {
            firstPlaySentRef.current = true;
            onReady?.(); // débloque l'overlay global la toute première fois
          }
          startProgress();
        });
      } catch {
        // Si erreur d'import ou player, on bascule en visible + progression par durée
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

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (safetyTimeoutRef.current) window.clearTimeout(safetyTimeoutRef.current);
      try {
        playerRef.current?.off?.("play");
        // on n'appelle pas destroy ici pour éviter des glitches, unload suffit
        playerRef.current?.unload?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides, index, readyTimeoutMs]);

  if (!slides.length) return null;
  const current = slides[index];

  const goTo = (i: number) => {
    if (!slides.length) return;
    // On coupe la progression en cours; le prochain useEffect relancera après "play"
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIndex(((i % slides.length) + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[100svh] w-full bg-black">
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
          allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          // 'loading="eager"' pour le premier affichage le plus rapide possible
          loading="eager"
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
