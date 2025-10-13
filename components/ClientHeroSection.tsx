// components/ClientHeroSection.tsx
"use client";

import { useEffect, useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import HeroPlayer from "@/components/ui/HeroPlayer";

type Item = {
  id: string;
  title: string;
  createdAt: string | null;
  thumbnail?: string;
  poster?: string;
  embed?: string;
  link?: string;
};

export default function ClientHeroSection({ items }: { items: Item[] }) {
  const [gate, setGate] = useState(true);

  // Safety net: auto-unveil after 2.5s in case Vimeo is slow
  useEffect(() => {
    if (!items?.length) {
      setGate(false);
      return;
    }
    const t = window.setTimeout(() => setGate(false), 2500);
    return () => window.clearTimeout(t);
  }, [items]);

  return (
    <div className="relative">
      {/* Black veil fade (sits under nav/footer which should have higher z) */}
      <div
        aria-hidden
        className={`pointer-events-none fixed inset-0 z-[30] bg-black transition-opacity duration-300 ${
          gate ? "opacity-100" : "opacity-0"
        }`}
      />
      <ErrorBoundary>
        <HeroPlayer items={items} onReady={() => setGate(false)} />
      </ErrorBoundary>
    </div>
  );
}
