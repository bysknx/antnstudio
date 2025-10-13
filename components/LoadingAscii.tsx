// components/LoadingAscii.tsx
"use client";

import { useEffect, useRef, useState } from "react";

/** TTL (15 min) + clés de cache */
const STORAGE_KEY_LAST = "antn_ascii_loader_last_seen";
const CACHE_KEY_VIMEO = "antn_vimeo_cache_v1";
const TTL_HOURS = 0.25; // 15 minutes

/** Durées (ms) */
const TOTAL_MS = 2200;
const FADE_IN_MS = 180;
const FADE_OUT_MS = 220;

/** helper TTL */
function shouldShow(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST);
    if (!raw) return true;
    return Date.now() - Number(raw) > TTL_HOURS * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

/** retire le boot shell injecté en <body> (layout) */
function hideBootShell() {
  try {
    // enlève l’overlay
    const boot = document.getElementById("boot");
    if (boot && boot.parentNode) boot.parentNode.removeChild(boot);
    // libère la page principale
    document.documentElement.removeAttribute("data-booting");
    // stoppe la petite barre JS du shell si présente
    const anyWin = window as any;
    if (anyWin.__antnBootTick) {
      clearInterval(anyWin.__antnBootTick);
      anyWin.__antnBootTick = null;
    }
  } catch {
    /* noop */
  }
}

export default function LoadingAscii({ force = false }: { force?: boolean } = {}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const startRef = useRef(0);
  const loadedRef = useRef(false);
  const progressRef = useRef(0); // évite l’ancienne valeur dans la closure

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const show = (force || shouldShow()) && !reduce;
    if (!show) {
      // si on ne montre pas l’ASCII, on doit quand même retirer le boot shell
      hideBootShell();
      return;
    }

    setVisible(true);
    startRef.current = performance.now();

    // ----- précharge les projets pendant le loader -----
    (async () => {
      try {
        const already = sessionStorage.getItem(CACHE_KEY_VIMEO);
        if (!already) {
          const res = await fetch("/api/vimeo", { cache: "no-store" });
          const json = await res.json();
          sessionStorage.setItem(CACHE_KEY_VIMEO, JSON.stringify(json));
        }
      } catch {
        /* ignore */
      }
    })();

    const onWindowLoad = () => {
      loadedRef.current = true;
    };
    window.addEventListener("load", onWindowLoad, { passive: true });

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const timeTarget = Math.min(0.9, elapsed / Math.max(1, TOTAL_MS - FADE_OUT_MS));
      const target = loadedRef.current ? 1 : timeTarget;

      // easing discret vers la cible
      const next = progressRef.current + (target - progressRef.current) * 0.2;
      progressRef.current = next;
      setProgress(next);

      if (!doneRef.current) {
        const doneByTime = elapsed >= TOTAL_MS;
        const doneByLoad = loadedRef.current && progressRef.current >= 0.995;

        if (doneByTime || doneByLoad) {
          doneRef.current = true;
          // Retire le boot shell immédiatement (on ne veut pas de double overlay)
          hideBootShell();

          setTimeout(() => {
            setVisible(false);
            try {
              localStorage.setItem(STORAGE_KEY_LAST, String(Date.now()));
            } catch {}
          }, FADE_OUT_MS);
        } else {
          rafRef.current = requestAnimationFrame(tick);
        }
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("load", onWindowLoad);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [force]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{ ["--in" as any]: `${FADE_IN_MS}ms` }}
      className="fixed inset-0 z-[9999] overflow-hidden bg-black text-zinc-100 animate-[antnFadeIn_var(--in)_ease-out_forwards]"
    >
      {/* grain + scanlines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-screen [background-image:radial-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:2px_2px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_bottom,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:100%_3px]" />

      {/* centre */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="px-6">
          <pre className="select-none whitespace-pre leading-[1.05] tracking-[0.02em] text-[min(6vw,24px)] font-mono mb-6">
{String.raw`
                         ░██               
                         ░██               
 ░██████   ░████████  ░████████ ░████████ 
      ░██  ░██    ░██    ░██    ░██    ░██
 ░███████  ░██    ░██    ░██    ░██    ░██
░██   ░██  ░██    ░██    ░██    ░██    ░██
 ░█████░██ ░██    ░██     ░████ ░██    ░██
                                          
                                          
`}
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

      {/* fondu de sortie */}
      <div
        style={{ ["--out" as any]: `${FADE_OUT_MS}ms`, animationDelay: `${TOTAL_MS - FADE_OUT_MS}ms` }}
        className="pointer-events-none absolute inset-0 animate-[antnFadeOut_var(--out)_ease-in_forwards]"
      />
      <style jsx global>{`
        @keyframes antnFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes antnFadeOut { from { opacity: 1 } to { opacity: 0 } }
      `}</style>
    </div>
  );
}
