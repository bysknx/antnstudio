// components/LoadingAscii.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SEEN_KEY = "antn_ascii_loader_seen"; // 1 fois par session
const CACHE_KEY_VIMEO = "antn_vimeo_cache_v1";

const TOTAL_MS = 2200;
const FADE_IN_MS = 180;
const FADE_OUT_MS = 260;
// filet global : si tout va mal, on ferme en ~4s
const ABSOLUTE_TIMEOUT_MS = 4000;

type Stage = "hidden" | "visible" | "fading";

const ASCII_ART = String.raw`
      ___        _            _        _           
     / _ \ _   _| |_ ___  ___| |_ __ _| |_ ___  _ __ 
    / /_)/ | | | __/ _ \/ __| __/ _\` | __/ _ \| '__|
   / ___/| |_| | ||  __/\__ \ || (_| | || (_) | |   
   \/     \__,_|\__\___||___/\__\__,_|\__\___/|_|   
`;

export default function LoadingAscii({ force = false }: { force?: boolean } = {}) {
  const router = useRouter();

  const [stage, setStage] = useState<Stage>("hidden");
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const hardRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const startRef = useRef(0);
  const loadedRef = useRef(false);
  const armedRef = useRef(false); // evite double-armement

  const applyStageToRoot = useCallback((value: Stage) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (value === "hidden") root.removeAttribute("data-app-loading");
    else root.setAttribute("data-app-loading", value);
  }, []);

  const requestClose = useCallback(() => {
    if (typeof window === "undefined") return;
    if (doneRef.current) return;
    doneRef.current = true;
    if (fadeTimerRef.current) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    setStage("fading");
    applyStageToRoot("fading");
    fadeTimerRef.current = window.setTimeout(() => {
      setStage("hidden");
      applyStageToRoot("hidden");
    }, FADE_OUT_MS + 140);
  }, [applyStageToRoot]);

  useEffect(() => {
    const dismantleBootShell = () => {
      if (typeof window === "undefined") return;
      try {
        const w = window as Window & { __antnBootTick?: number };
        if (typeof w.__antnBootTick === "number") {
          window.clearInterval(w.__antnBootTick);
          delete w.__antnBootTick;
        }
        const doc = window.document;
        doc.documentElement.removeAttribute("data-booting");
        const boot = doc.getElementById("boot");
        if (boot) {
          boot.style.transition = "opacity 180ms ease-out";
          boot.style.opacity = "0";
          window.setTimeout(() => boot.remove(), 220);
        }
        try {
          localStorage.setItem("antn_ascii_loader_last_seen", String(Date.now()));
        } catch {
          /* ignore */
        }
      } catch {
        /* ignore */
      }
    };

    dismantleBootShell();

    // ne s'affiche qu'une fois / session, sauf force
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let show = !reduce;
    if (!force) {
      try {
        if (sessionStorage.getItem(SEEN_KEY)) show = false;
        else sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // si sessionStorage HS, on affiche quand meme
      }
    }

    if (!show) {
      setStage("hidden");
      applyStageToRoot("hidden");
      return;
    }

    setProgress(0);
    setStage("visible");
    applyStageToRoot("visible");
    doneRef.current = false;
    armedRef.current = false;
    loadedRef.current = false;
    startRef.current = performance.now();

    // Prechargements utiles
    (async () => {
      try {
        router.prefetch?.("/projects");
        router.prefetch?.("/contact");
        const cached = sessionStorage.getItem(CACHE_KEY_VIMEO);
        if (!cached) {
          const res = await fetch("/api/vimeo", { cache: "no-store" });
          const json = await res.json().catch(() => ({}));
          sessionStorage.setItem(CACHE_KEY_VIMEO, JSON.stringify(json));
        }
      } catch {
        /* network/cache issues non bloquantes */
      }
    })();

    const onWindowLoad = () => {
      loadedRef.current = true;
    };
    window.addEventListener("load", onWindowLoad, { passive: true });

    // filet dur : quoi qu'il arrive, on ferme
    hardRef.current = window.setTimeout(() => {
      requestClose();
    }, ABSOLUTE_TIMEOUT_MS);

    // boucle d'animation
    const tick = (now: number) => {
      if (doneRef.current) return;

      const elapsed = now - startRef.current;
      const ramp = Math.min(0.9, elapsed / Math.max(1, TOTAL_MS - FADE_OUT_MS));
      const target = loadedRef.current ? 1 : ramp;

      setProgress((p) => {
        const next = p + (target - p) * 0.22;
        return next > 0.999 ? 1 : next;
      });

      // on arme la fermeture UNE seule fois quand on a atteint la duree cible
      if (!armedRef.current && elapsed >= TOTAL_MS) {
        armedRef.current = true;
        window.setTimeout(() => {
          requestClose();
        }, FADE_OUT_MS);
      }

      if (!doneRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("load", onWindowLoad);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (hardRef.current) window.clearTimeout(hardRef.current);
      if (fadeTimerRef.current) window.clearTimeout(fadeTimerRef.current);
      doneRef.current = true;
      applyStageToRoot("hidden");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyStageToRoot, force, requestClose, router]);

  useEffect(() => {
    return () => {
      applyStageToRoot("hidden");
    };
  }, [applyStageToRoot]);

  if (stage === "hidden") return null;
  const fading = stage === "fading";

  return (
    <div
      data-loader="ascii"
      aria-hidden
      style={{
        ["--in" as any]: `${FADE_IN_MS}ms`,
        ["--out" as any]: `${FADE_OUT_MS}ms`,
        opacity: fading ? 0 : 1,
        filter: fading ? "blur(6px)" : "none",
        transition: `opacity ${FADE_OUT_MS}ms ease, filter ${FADE_OUT_MS}ms ease`,
      }}
      className="fixed inset-0 z-[9999] overflow-hidden bg-black text-zinc-100 animate-[antnFadeIn_var(--in)_ease-out_forwards]"
    >
      {/* grain / scanlines (pas de grille de points statique pour eviter le doublon avec la matrice) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-screen [background-image:radial-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:2px_2px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_bottom,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:100%_3px]" />

      <div className="absolute inset-0 grid place-items-center">
        <div className="px-6">
          <pre className="select-none whitespace-pre leading-[1.05] tracking-[0.02em] text-[min(6vw,24px)] font-mono mb-6">
            {ASCII_ART}
          </pre>

          <div className="font-mono text-sm text-zinc-300/90">
            <span className="opacity-80">booting interface </span>
            <span className="inline-block h-[12px] w-[160px] align-middle overflow-hidden border border-white/40 bg-black/40">
              <span
                className="block h-full bg-emerald-400/90 [background-image:repeating-linear-gradient(90deg,rgba(0,0,0,.18)_0_6px,transparent_6px_12px)]"
                style={{ width: `${Math.round(progress * 100)}%`, transition: "width 120ms linear" }}
              />
            </span>
            <span className="ml-2 tabular-nums">{Math.round(progress * 100)}%</span>
          </div>
        </div>
      </div>

      {/* crossfade out (pilote par l'effet via setStage) */}
      <style jsx global>{`
        @keyframes antnFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes antnFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
