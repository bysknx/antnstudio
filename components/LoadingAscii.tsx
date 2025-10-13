// components/LoadingAscii.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Clés de cache */
const SEEN_KEY = "antn_ascii_loader_seen";       // 1 fois par session
const CACHE_KEY_VIMEO = "antn_vimeo_cache_v1";

/** Durées (ms) */
const TOTAL_MS = 2200;   // durée “cinématique” cible
const FADE_IN_MS = 180;
const FADE_OUT_MS = 260;

/** Afficher le loader ? (une fois par session navigateur/onglet) */
function shouldShowOncePerSession(): boolean {
  try {
    if (sessionStorage.getItem(SEEN_KEY)) return false;
    sessionStorage.setItem(SEEN_KEY, "1");
    return true;
  } catch {
    return true;
  }
}

export default function LoadingAscii({ force = false }: { force?: boolean } = {}) {
  const router = useRouter();

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const rafRef = useRef<number | null>(null);
  const doneRef = useRef(false);
  const startRef = useRef(0);
  const loadedRef = useRef(false);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const show = (force || shouldShowOncePerSession()) && !reduce;
    if (!show) return;

    setVisible(true);
    startRef.current = performance.now();

    // --- Préchargements pendant l'anim ---
    (async () => {
      try {
        // 1) Préfetch des routes clés (App Router)
        // (si Next précharge déjà via <Link>, ça n'entre pas en conflit)
        router.prefetch?.("/projects");
        router.prefetch?.("/contact");

        // 2) Précharge cache Vimeo en session
        const already = sessionStorage.getItem(CACHE_KEY_VIMEO);
        if (!already) {
          const res = await fetch("/api/vimeo", { cache: "no-store" });
          const json = await res.json().catch(() => ({}));
          sessionStorage.setItem(CACHE_KEY_VIMEO, JSON.stringify(json));
        }
      } catch {
        /* ignore réseau */
      }
    })();

    // Quand tout le document est prêt (images, css, iframes potentiellement)
    const onWindowLoad = () => {
      loadedRef.current = true;
    };
    window.addEventListener("load", onWindowLoad, { passive: true });

    // Timeline “cinématique” + synchro avec readiness
    const tick = (now: number) => {
      const elapsed = now - startRef.current;

      // Avance naturelle jusqu'à ~90% si la page n'est pas encore “ready”
      const timeRamp = Math.min(0.9, elapsed / Math.max(1, TOTAL_MS - FADE_OUT_MS));
      // Si le window load est passé, on peut tirer à 100%
      const target = loadedRef.current ? 1 : timeRamp;

      setProgress((p) => {
        const next = p + (target - p) * 0.22; // easing progress
        return next > 0.999 ? 1 : next;
      });

      // Sortie si temps atteint ou si tout est “ready” et barre quasi pleine
      if (!doneRef.current) {
        if (elapsed >= TOTAL_MS || (loadedRef.current && progress >= 0.995)) {
          doneRef.current = true;
          // Laisse la petite animation de fondu terminer visuellement
          setTimeout(() => {
            setVisible(false);
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
  }, [force, progress, router]);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{ ["--in" as any]: `${FADE_IN_MS}ms`, ["--out" as any]: `${FADE_OUT_MS}ms` }}
      className="
        fixed inset-0 z-[9999] overflow-hidden
        bg-black text-zinc-100
        animate-[antnFadeIn_var(--in)_ease-out_forwards]
      "
    >
      {/* Grain léger + scanlines (pas de grille à points pour éviter le doublon avec la matrice) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-screen [background-image:radial-gradient(rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:2px_2px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_bottom,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:100%_3px]" />

      {/* Centre */}
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

      {/* Voile de sortie progressif (donne un “crossfade” plus propre vers la page) */}
      <div
        className="pointer-events-none absolute inset-0 animate-[antnFadeOut_var(--out)_ease-in_forwards]"
        style={{ animationDelay: `${TOTAL_MS - FADE_OUT_MS}ms` }}
      />

      <style jsx global>{`
        @keyframes antnFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes antnFadeOut { from { opacity: 1 } to { opacity: 0 } }
      `}</style>
    </div>
  );
}
