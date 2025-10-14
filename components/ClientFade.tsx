"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Crossfade + léger blur à chaque changement de route.
 * - Aucune lib externe
 * - 280 ms par défaut
 */
export default function ClientFade({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reset (au cas où)
    el.style.willChange = "opacity, filter";
    el.style.transition = "opacity 280ms ease, filter 280ms ease";
    el.style.opacity = "0";
    el.style.filter = "blur(3px)";
    // on laisse le browser peindre une frame puis on fade-in
    const id = requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.filter = "blur(0)";
    });
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
