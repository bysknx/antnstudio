"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import LoadingAscii from "@/components/LoadingAscii";

/**
 * Affiche le loader ASCII ~900ms à CHAQUE changement d'URL (App Router).
 * Pas de flash au premier render (ignore la 1ère mount).
 */
export default function RouteLoader() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const first = useRef(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setActive(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setActive(false), 900);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [pathname]);

  return <LoadingAscii mode="route" active={active} totalMs={900} />;
}
