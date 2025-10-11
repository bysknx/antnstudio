// START PATCH
"use client";

import { useEffect, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import HeroPlayer from "@/components/ui/HeroPlayer";

export default function ClientHeroSection() {
  const [gate, setGate] = useState(true);

  // Sécurité : lève le voile au bout de 2.5s si jamais Vimeo tarde
  useEffect(() => {
    const t = window.setTimeout(() => setGate(false), 2500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className="relative">
      {/* Voile noir avec fondu (remplace l’ASCII local) */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[30] bg-black transition-opacity duration-300 ${gate ? "opacity-100" : "opacity-0"}`}
      />
      <ErrorBoundary>
        <HeroPlayer onReady={() => setGate(false)} />
      </ErrorBoundary>
    </div>
  );
}
// END PATCH
