"use client";

import { useEffect, useRef } from "react";

export default function TopProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const ratio = max > 0 ? window.scrollY / max : 0;
        if (ref.current) {
          ref.current.style.transform = `scaleX(${Math.min(
            1,
            Math.max(0, ratio)
          )})`;
        }
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-transparent"
    >
      <div
        ref={ref}
        className="h-full w-full bg-white/60 dark:bg-white/80"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
