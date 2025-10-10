"use client";

import { useEffect, useRef, useState } from "react";

/** Stockage pour le TTL (mode "hourly") */
const STORAGE_KEY = "antn_ascii_loader_last_seen";

type Mode = "hourly" | "always" | "route";

/** Durées par défaut (ms) */
const DEFAULT_TOTAL_MS = 2200;
const FADE_IN_MS = 180;
const FADE_OUT_MS = 220;

function shouldShowHourly(ttlHours: number): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    return Date.now() - Number(raw) > ttlHours * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

export default function LoadingAscii({
  mode = "hourly",
  ttlHours = 1,
  active,              // utile en mode "route"
  totalMs = DEFAULT_TOTAL_MS,
}: {
  mode?: Mode;
  ttlHours?: number;
  active?: boolean;
  totalMs?: number;
}) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0); // 0..1
  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const startRef = useRef(0);
  const loadedRef = useRef(false);

  // Déclenchement selon le mode
  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (mode === "route") {
      if (!active || reduce) return;
      // reset
      setProgress(0);
      doneRef.current = false;
      loadedRef.current = false;
      setVisible(true);
      startRef.current = performance.now();
      return;
    }

    // hourly / always
    const show = mode === "always" ? !reduce : shouldShowHourly(ttlHours) && !reduce;
    if (!show) return;

    setVisible(true);
    startRef.current = performance.now();
  }, [mode, ttlHours, active, totalMs]);

  // Progression + fermeture
  useEffect(() => {
    if (!visible) return;

    const onWindowLoad = () => {
      loadedRef.current = true;
    };
    window.addEventListener("load", onWindowLoad, { passive: true });

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const timeTarget = Math.min(0.9, elapsed / Math.max(1, totalMs - FADE_OUT_MS));
      const target = loadedRef.current ? 1 : timeTarget;

      setProgress((p) => {
        const next = p + (target - p) * 0.2; // lerp
        return next > 0.999 ? 1 : next;
      });

      if (!doneRef.current) {
        if (elapsed >= totalMs || (loadedRef.current && progress >= 0.995)) {
          doneRef.current = true;
          setTimeout(() => {
            setVisible(false);
            try {
              if (mode === "hourly") localStorage.setItem(STORAGE_KEY, String(Date.now()));
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
  }, [visible, progress, mode, totalMs]);

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

      {/* contenu ASCII */}
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

      {/* fade out */}
      <div
        style={{ ["--out" as any]: `${FADE_OUT_MS}ms`, animationDelay: `${Math.max(0, totalMs - FADE_OUT_MS)}ms` }}
        className="pointer-events-none absolute inset-0 animate-[antnFadeOut_var(--out)_ease-in_forwards]"
      />

      <style jsx global>{`
        @keyframes antnFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes antnFadeOut { from { opacity: 1 } to { opacity: 0 } }
      `}</style>
    </div>
  );
}
