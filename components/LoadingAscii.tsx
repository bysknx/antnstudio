"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SEEN_KEY = "antn_loader_seen_v2";
const HARD_TIMEOUT_MS = 6000;
const FADE_OUT_MS = 400;

type Stage = "hidden" | "visible" | "fading";

// Lines that appear progressively during boot
const BOOT_LINES = [
  { text: "> initializing display", delay: 0,    suffix: "OK" },
  { text: "> loading manifest",     delay: 280,  suffix: "OK" },
  { text: "> mounting interface",   delay: 560,  suffix: "OK" },
  { text: "> buffering video feed", delay: 840,  suffix: null }, // stays pending until video ready
];

const DOTS = "............";

export default function LoadingAscii({ force = false }: { force?: boolean }) {
  const [stage, setStage] = useState<Stage>("hidden");
  const [completedLines, setCompletedLines] = useState<number>(0);
  const [videoReady, setVideoReady] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const doneRef = useRef(false);
  const hardRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setShowReady(true);
    setTimeout(() => {
      setStage("fading");
      setTimeout(() => setStage("hidden"), FADE_OUT_MS);
    }, 320);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let show = !reduce;
    if (!force) {
      try {
        if (sessionStorage.getItem(SEEN_KEY)) show = false;
        else sessionStorage.setItem(SEEN_KEY, "1");
      } catch { /* ignore */ }
    }
    if (!show) return;

    setStage("visible");
    setCompletedLines(0);
    setVideoReady(false);
    setShowReady(false);
    doneRef.current = false;

    // Appear lines one by one
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT_LINES.forEach((line, i) => {
      if (line.suffix !== null) {
        const t = setTimeout(() => setCompletedLines(i + 1), line.delay + 200);
        timers.push(t);
      } else {
        // Last line (video) appears but stays pending
        const t = setTimeout(() => setCompletedLines(i), line.delay);
        timers.push(t);
      }
    });

    // Listen for video ready event
    const onVideoReady = () => {
      setVideoReady(true);
      setCompletedLines(BOOT_LINES.length);
      setTimeout(() => close(), 300);
    };
    window.addEventListener("antn:video-ready", onVideoReady, { once: true });

    // Hard timeout
    hardRef.current = setTimeout(() => {
      window.dispatchEvent(new Event("antn:video-ready"));
    }, HARD_TIMEOUT_MS);

    return () => {
      timers.forEach(clearTimeout);
      if (hardRef.current) clearTimeout(hardRef.current);
      window.removeEventListener("antn:video-ready", onVideoReady);
    };
  }, [force, close]);

  if (stage === "hidden") return null;

  return (
    <div
      aria-hidden
      style={{
        opacity: stage === "fading" ? 0 : 1,
        transition: `opacity ${FADE_OUT_MS}ms ease`,
      }}
      className="fixed inset-0 z-[9999] bg-black text-white font-mono overflow-hidden"
    >
      {/* Scanlines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_bottom,rgba(255,255,255,.3)_1px,transparent_1px)] [background-size:100%_3px]" />

      <div className="absolute inset-0 flex items-center justify-center px-8">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-8 text-white/40 text-xs tracking-[0.25em] uppercase">
            ANTN.STUDIO — system boot
          </div>

          {/* Boot lines */}
          <div className="space-y-2 text-sm">
            {BOOT_LINES.map((line, i) => {
              const shown = completedLines > i || (i === BOOT_LINES.length - 1 && completedLines >= i);
              const done = completedLines > i || (i === BOOT_LINES.length - 1 && videoReady);
              if (!shown) return null;

              return (
                <div key={i} className="flex items-center gap-2 text-white/70">
                  <span className="text-white/40">{line.text}</span>
                  <span className="text-white/20 flex-1">{DOTS}</span>
                  {done ? (
                    <span className={i === BOOT_LINES.length - 1 ? "text-white" : "text-white/50"}>
                      {line.suffix ?? "OK"}
                    </span>
                  ) : (
                    <span className="text-white/30 animate-pulse">···</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* READY */}
          {showReady && (
            <div className="mt-8 text-white tracking-[0.3em] text-sm uppercase animate-[antnFadeIn_200ms_ease_forwards]">
              — READY
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes antnFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
