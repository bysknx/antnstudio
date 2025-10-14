// components/LoadingAscii.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SEEN_KEY = "antn_ascii_loader_seen";      // 1 fois par session
const CACHE_KEY_VIMEO = "antn_vimeo_cache_v1";

const TOTAL_MS = 2200;
const FADE_IN_MS = 180;
const FADE_OUT_MS = 260;
// filet global : si tout va mal, on ferme en ~4s
const ABSOLUTE_TIMEOUT_MS = 4000;

export default function LoadingAscii({ force = false }: { force?: boolean } = {}) {
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const hardRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const startRef = useRef(0);
  const loadedRef = useRef(false);
  const armedRef = useRef(false); // évite double-armement

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

    // ne s’affiche qu’une fois / session, sauf force
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let show = !reduce;
    if (!force) {
      try {
        if (sessionStorage.getItem(SEEN_KEY)) show = false;
        else sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // si sessionStorage HS, on affiche quand même
      }
    }

    if (!show) return;

    setVisible(true);
    startRef.current = performance.now();

    // Préchargements utiles
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
      } catch {}
    })();

    const onWindowLoad = () => {
      loadedRef.current = true;
    };
    window.addEventListener("load", onWindowLoad, { passive: true });

    // filet dur : quoi qu’il arrive, on ferme
    hardRef.current = window.setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true;
        setVisible(false);
      }
    }, ABSOLUTE_TIMEOUT_MS);

    // boucle d’animation
    const tick = (now: number) => {
      if (doneRef.current) return;

      const elapsed = now - startRef.current;
      const ramp = Math.min(0.9, elapsed / Math.max(1, TOTAL_MS - FADE_OUT_MS));
      const target = loadedRef.current ? 1 : ramp;

      setProgress((p) => {
        const next = p + (target - p) * 0.22;
        return next > 0.999 ? 1 : next;
      });

      // on arme la fermeture UNE seule fois quand on a atteint la durée cible
      if (!armedRef.current && elapsed >= TOTAL_MS) {
        armedRef.current = true;
        window.setTimeout(() => {
          if (!doneRef.current) {
            doneRef.current = true;
            setVisible(false);
          }
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
    };
    // ⚠️ ne pas dépendre de `progress` — sinon on relance l’effet à chaque frame
  }, [force, router]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{ ["--in" as any]: `${FADE_IN_MS}ms`, ["--out" as any]: `${FADE_OUT_MS}ms` }}
      className="fixed inset-0 z-[9999] overflow-hidden bg-black text-zinc-100 animate-[antnFadeIn_var(--in)_ease-out_forwards]"
    >
      {/* grain / scanlines (pas de grille de points statique pour éviter le doublon avec la matrice) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-screen [background-image:radial-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:2px_2px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_bottom,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:100%_3px]" />

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

      {/* crossfade out (piloté par l’effet via setVisible) */}
      <style jsx global>{`
        @keyframes antnFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes antnFadeOut { from { opacity: 1 } to { opacity: 0 } }
      `}</style>
    </div>
  );
}
