"use client";

import { useEffect, useRef, useState } from "react";

// Affiche le loader au premier passage (ou si > 24h)
const STORAGE_KEY = "antn_ascii_loader_last_seen";
const TTL_HOURS = 1;

function shouldShow(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const last = Number(raw);
    const now = Date.now();
    return now - last > TTL_HOURS * 60 * 60 * 1000;
  } catch {
    return true;
  }
}

export default function LoadingAscii() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Respecte les utilisateurs qui préfèrent moins d’animation
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const show = shouldShow() && !reduce;
    if (!show) {
      setVisible(false);
      return;
    }

    setVisible(true);

    // cache le loader après un court délai
    timerRef.current = window.setTimeout(() => {
      setVisible(false);
      try {
        localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {}
    }, 5000); // durée totale d’apparition

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[9999] overflow-hidden bg-black text-zinc-200"
    >
      {/* grain léger */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen [background-image:radial-gradient(rgba(255,255,255,.05)_1px,transparent_1px)] [background-size:2px_2px]" />
      {/* scanlines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_bottom,rgba(255,255,255,.25)_1px,transparent_1px)] [background-size:100%_3px]" />

      <div className="absolute inset-0 grid place-items-center">
        <div className="ascii-frame">
          <pre className="ascii-block">
{String.raw`
  ███   ███  ████  ████   .studio
  █  █ █  █  █     █  █   antn
  ███  ████  ███   ███
  █    █  █  █     █ █    front-end & DA minimale
  █    █  █  ████  █  █
`}
          </pre>
          <div className="ascii-sub">booting interface ░▒▓</div>
        </div>
      </div>

      {/* fondu de sortie */}
      <div className="pointer-events-none absolute inset-0 animate-[asciiFadeOut_1.4s_ease-out_forwards]" />
    </div>
  );
}
