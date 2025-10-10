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
    setIndex(((i % slides.length) + slides.length) %
