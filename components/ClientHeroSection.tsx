// components/ClientHeroSection.tsx
"use client";

import { useEffect, useState } from "react";
import LoadingAscii from "@/components/LoadingAscii";
import HeroPlayer from "@/components/ui/HeroPlayer";

export default function ClientHeroSection() {
  const [gate, setGate] = useState(true);

  // Empêche la barre de scroll pendant le Hero
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, []);

  return (
    <>
      <LoadingAscii mode="route" active={gate} totalMs={1200} />
      <HeroPlayer onReady={() => setGate(false)} />
    </>
  );
}
