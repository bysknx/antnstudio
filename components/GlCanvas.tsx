"use client";

import { useEffect, useRef } from "react";

export default function GlCanvas({
  spacing = 36, // ← réduit pour densifier la grille (avant 48)
  padding = 64,
  maxOffset = 18, // ← réduit un peu pour un effet plus fin
}: {
  spacing?: number;
  padding?: number;
  maxOffset?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const dotsRef = useRef<
    Array<{
      x: number;
      y: number;
      ox: number;
      oy: number;
      size: number;
      angle: number;
    }>
  >([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const ratio = Math.max(1, Math.floor(window.devicePixelRatio || 1));

    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.zIndex = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.background = "transparent";

    const state = {
      ratio,
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
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      state.width = canvas.width;
      state.height = canvas.height;

      const innerW = state.width - state.padding * 2 * ratio;
      const innerH = state.height - state.padding * 2 * ratio;
      state.cols = Math.max(2, Math.floor(innerW / (state.spacing * ratio)));
      state.rows = Math.max(2, Math.floor(innerH / (state.spacing * ratio)));

      dotsRef.current = [];
      for (let i = 0; i < state.cols; i++) {
        const x = Math.floor(
          (innerW / (state.cols - 1 || 1)) * i + state.padding * ratio,
        );
        for (let j = 0; j < state.rows; j++) {
          const y = Math.floor(
            (innerH / (state.rows - 1 || 1)) * j + state.padding * ratio,
          );
          dotsRef.current.push({
            x,
            y,
            ox: x,
            oy: y,
            size: 1 * ratio,
            angle: 0,
          });
        }
      }
    }

    function onPointerMove(e: PointerEvent) {
      mouseRef.current.x = e.clientX * ratio;
      mouseRef.current.y = e.clientY * ratio;
    }

    function getAngle(
      a: { x: number; y: number },
      b: { x: number; y: number },
    ) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      return (Math.atan2(dy, dx) / Math.PI) * 180;
    }

    function getDistance(
      a: { x: number; y: number },
      b: { x: number; y: number },
    ) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    function circle(
      context: CanvasRenderingContext2D,
      x: number,
      y: number,
      r: number,
    ) {
      context.beginPath();
      context.arc(x, y, r, 0, Math.PI * 2, false);
      context.closePath();
    }

    function render() {
      const { width, height, ratio, maxOffset } = state;
      ctx.clearRect(0, 0, width, height);

      // filets discrets
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1 * ratio;

      for (let i = 0; i < dotsRef.current.length; i++) {
        const d = dotsRef.current[i];
        const m = mouseRef.current;
        const dist = getDistance(d, m);
        const ang = getAngle(d, m);
        const offset = Math.min(maxOffset * ratio, dist);
        const vx = offset * Math.cos((ang * Math.PI) / 180);
        const vy = offset * Math.sin((ang * Math.PI) / 180);

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + vx, d.y + vy);
        ctx.stroke();
      }

      // points un peu atténués
      ctx.fillStyle = "rgba(255,255,255,0.5)";

      for (let i = 0; i < dotsRef.current.length; i++) {
        const d = dotsRef.current[i];
        const m = mouseRef.current;
        const dist = getDistance(d, m);
        let size = (160 * ratio - dist) / 25;
        size = Math.max(0.8 * ratio, Math.min(4.5 * ratio, size));

        const ang = getAngle(d, m);
        const offset = Math.min(maxOffset * ratio, dist);
        const vx = offset * Math.cos((ang * Math.PI) / 180);
        const vy = offset * Math.sin((ang * Math.PI) / 180);

        circle(ctx, d.x + vx, d.y + vy, size);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(render);
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [spacing, padding, maxOffset]);

  return <canvas ref={canvasRef} aria-hidden="true" />;
}
