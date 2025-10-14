"use client";

import { useEffect, useRef } from "react";

export default function GlCanvas({
  spacing = 36, // grille un peu plus dense
  padding = 64,
  maxOffset = 18, // deplacement max plus fin
  maxFps = 45, // limite FPS pour CPU/GPU
}: {
  spacing?: number;
  padding?: number;
  maxOffset?: number;
  maxFps?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dotsRef = useRef<
    Array<{ x: number; y: number; ox: number; oy: number; size: number }>
  >([]);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Style: full screen fixed canvas, transparent background, no pointer interaction
    const style = canvas.style;
    style.position = "fixed";
    style.inset = "0";
    style.pointerEvents = "none";
    style.background = "transparent";

    const getRatio = () => Math.max(1, Math.floor(window.devicePixelRatio || 1));

    const state = {
      ratio: getRatio(),
      width: 0,
      height: 0,
      cols: 0,
      rows: 0,
      padding,
      spacing,
      maxOffset,
    };

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nextRatio = getRatio();

      if (nextRatio !== state.ratio) {
        const scale = nextRatio / state.ratio;
        mouseRef.current.x *= scale;
        mouseRef.current.y *= scale;
        state.ratio = nextRatio;
      }

      const { ratio } = state;
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      state.width = canvas.width;
      state.height = canvas.height;

      const innerW = state.width - state.padding * 2 * ratio;
      const innerH = state.height - state.padding * 2 * ratio;

      state.cols = Math.max(2, Math.floor(innerW / (state.spacing * ratio)));
      state.rows = Math.max(2, Math.floor(innerH / (state.spacing * ratio)));

      const dots: Array<{ x: number; y: number; ox: number; oy: number; size: number }> = [];
      for (let i = 0; i < state.cols; i++) {
        const x = Math.floor(
          (innerW / Math.max(1, state.cols - 1)) * i + state.padding * ratio,
        );
        for (let j = 0; j < state.rows; j++) {
          const y = Math.floor(
            (innerH / Math.max(1, state.rows - 1)) * j + state.padding * ratio,
          );
          dots.push({ x, y, ox: x, oy: y, size: 1 * ratio });
        }
      }
      dotsRef.current = dots;
    }

    function onPointerMove(e: PointerEvent) {
      const ratio = state.ratio;
      mouseRef.current.x = e.clientX * ratio;
      mouseRef.current.y = e.clientY * ratio;
    }

    const getAngle = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.atan2(b.y - a.y, b.x - a.x);

    const getDistance = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.hypot(dx, dy);
    };

    const frameInterval = 1000 / Math.max(1, maxFps);

    function render(now: number) {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      if (now - lastFrameRef.current < frameInterval) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }
      lastFrameRef.current = now;

      const { width, height, ratio, maxOffset } = state;
      ctx.clearRect(0, 0, width, height);

      // Lignes
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1 * ratio;
      ctx.beginPath();

      for (let i = 0; i < dotsRef.current.length; i++) {
        const d = dotsRef.current[i];
        const m = mouseRef.current;
        const dist = getDistance(d, m);
        const ang = getAngle(d, m);
        const offset = Math.min(maxOffset * ratio, dist);
        const vx = offset * Math.cos(ang);
        const vy = offset * Math.sin(ang);

        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + vx, d.y + vy);
      }
      ctx.stroke();

      // Points (une seule passe)
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      for (let i = 0; i < dotsRef.current.length; i++) {
        const d = dotsRef.current[i];
        const m = mouseRef.current;
        const dist = getDistance(d, m);
        // Taille douce, bornee
        let size = (160 * ratio - dist) / 25;
        size = Math.max(0.8 * ratio, Math.min(4.5 * ratio, size));

        const ang = getAngle(d, m);
        const offset = Math.min(maxOffset * ratio, dist);
        const vx = offset * Math.cos(ang);
        const vy = offset * Math.sin(ang);

        ctx.beginPath();
        ctx.arc(d.x + vx, d.y + vy, size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    }

    // Pause quand l onglet est masque (perf + pas d erreurs timer)
    function onVisChange() {
      pausedRef.current = document.hidden;
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisChange, { passive: true });

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [spacing, padding, maxOffset, maxFps]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
