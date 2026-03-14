"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SEEN_KEY = "antn_loader_seen_v2";
const ASCII_TTL_KEY = "antn_ascii_loader_last_seen";
const LOGO_FADE_MS = 1200;
const HARD_TIMEOUT_MS = 6000;
const FADE_OUT_MS = 500;

const ASCII_ART = [
  "░▒▓██████▓▒░░▒▓███████▓▒░▒▓████████▓▒░▒▓███████▓▒░  ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
].join("\n");

const BOOT_LINES = [
  { text: "> initializing display", delay: 0, suffix: "OK" },
  { text: "> loading manifest", delay: 280, suffix: "OK" },
  { text: "> mounting interface", delay: 560, suffix: "OK" },
  { text: "> buffering video feed", delay: 840, suffix: null },
];

const DOTS = "............";

type Stage = "hidden" | "visible" | "fading";

export default function LoadingAscii({ force = false }: { force?: boolean }) {
  const [stage, setStage] = useState<Stage>("hidden");
  const [logoVisible, setLogoVisible] = useState(false);
  const [completedLines, setCompletedLines] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [showReady, setShowReady] = useState(false);
  const doneRef = useRef(false);
  const hardRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(ASCII_TTL_KEY, String(Date.now()));
      }
    } catch {
      /* ignore */
    }
    setShowReady(true);
    setTimeout(() => {
      setStage("fading");
      setTimeout(() => setStage("hidden"), FADE_OUT_MS);
    }, 320);
  }, []);

  // Remove #boot from layout script and take over the full sequence
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.removeAttribute("data-booting");
    const boot = document.getElementById("boot");
    if (boot) {
      boot.style.opacity = "0";
      setTimeout(() => boot.remove(), 400);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (stage === "hidden") {
      document.documentElement.removeAttribute("data-app-loading");
      document.documentElement.setAttribute("data-loaded", "true");
    } else {
      document.documentElement.setAttribute("data-app-loading", stage);
    }
  }, [stage]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let show = !reduce;
    if (!force) {
      try {
        if (sessionStorage.getItem(SEEN_KEY)) show = false;
        else sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }
    if (!show) {
      document.documentElement.removeAttribute("data-app-loading");
      document.documentElement.setAttribute("data-loaded", "true");
      const boot = document.getElementById("boot");
      if (boot) boot.remove();
      return;
    }

    setStage("visible");
    setLogoVisible(false);
    setCompletedLines(0);
    setVideoReady(false);
    setShowReady(false);
    doneRef.current = false;

    // Phase 1: logo fade-in (VHS / terminal)
    const tLogo = setTimeout(() => setLogoVisible(true), 50);

    // Phase 2: boot lines appear one by one (push logo up)
    const timers: ReturnType<typeof setTimeout>[] = [];
    BOOT_LINES.forEach((line, i) => {
      if (line.suffix !== null) {
        timers.push(
          setTimeout(
            () => setCompletedLines(i + 1),
            LOGO_FADE_MS + line.delay + 200,
          ),
        );
      } else {
        timers.push(
          setTimeout(() => setCompletedLines(i), LOGO_FADE_MS + line.delay),
        );
      }
    });

    const onVideoReady = () => {
      setVideoReady(true);
      setCompletedLines(BOOT_LINES.length);
      setTimeout(() => close(), 300);
    };
    window.addEventListener("antn:video-ready", onVideoReady, { once: true });

    hardRef.current = setTimeout(() => {
      window.dispatchEvent(new Event("antn:video-ready"));
    }, HARD_TIMEOUT_MS);

    return () => {
      clearTimeout(tLogo);
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
      className="fixed inset-0 z-[9999] bg-black text-white font-mono overflow-hidden crt-screen"
    >
      {/* VHS / terminal: grain + scanlines + CRT */}
      <div
        className="pointer-events-none absolute inset-0 z-0 grain"
        style={{ opacity: 0.14 }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 crt-scanlines"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(0,0,0,.15) 2px, rgba(0,0,0,.15) 4px)",
          backgroundSize: "100% 4px",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 crt-scanlines-alt"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "100% 3px",
          opacity: 0.4,
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-0 crt-vignette" />

      {/* Logo centré au chargement, poussé vers le haut par les lignes */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 crt-content">
        <div className="w-full max-w-lg flex flex-col items-center">
          {/* Logo ASCII — apparaît en fondu puis est poussé par les lignes */}
          <pre
            className="mb-6 text-center whitespace-pre font-mono text-[rgba(229,231,235,.98)] transition-opacity duration-1000 ease-out"
            style={{
              lineHeight: 1.08,
              letterSpacing: "0.04em",
              fontSize: "clamp(10px, 3.5vw, 20px)",
              opacity: logoVisible ? 1 : 0,
            }}
          >
            {ASCII_ART}
          </pre>

          {/* Lignes de boot une par une */}
          <div className="w-full space-y-2 text-sm">
            {BOOT_LINES.map((line, i) => {
              const shown =
                completedLines > i ||
                (i === BOOT_LINES.length - 1 && completedLines >= i);
              const done =
                completedLines > i ||
                (i === BOOT_LINES.length - 1 && videoReady);
              if (!shown) return null;

              return (
                <div key={i} className="flex items-center gap-2 text-white/70">
                  <span className="text-white/40">{line.text}</span>
                  <span className="text-white/20 flex-1">{DOTS}</span>
                  {done ? (
                    <span
                      className={
                        i === BOOT_LINES.length - 1
                          ? "text-white"
                          : "text-white/50"
                      }
                    >
                      {line.suffix ?? "OK"}
                    </span>
                  ) : (
                    <span className="text-white/30 animate-pulse">···</span>
                  )}
                </div>
              );
            })}
          </div>

          {showReady && (
            <div className="mt-6 text-white tracking-[0.3em] text-xs uppercase animate-[antnFadeIn_200ms_ease_forwards]">
              — READY
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .crt-screen {
          box-shadow: inset 0 0 100px rgba(0, 0, 0, 0.3);
        }
        .crt-content {
          filter: contrast(1.02);
          transform: perspective(1400px) rotateX(0.3deg);
          transform-origin: center center;
        }
        .crt-vignette {
          background: radial-gradient(
            ellipse at center,
            transparent 55%,
            rgba(0, 0, 0, 0.25) 100%
          );
        }
        @keyframes antnFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
