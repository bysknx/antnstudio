"use client";

import { useState } from "react";
import LoadingAscii from "@/components/LoadingAscii";
import HeroPlayer from "@/components/ui/HeroPlayer";

/**
 * Affiche l'overlay ASCII tant que le player Vimeo n'a pas réellement démarré.
 * Le HeroPlayer appelle onReady() au premier "play" → on ferme l'overlay.
 */
export default function ClientHeroSection() {
  const [gate, setGate] = useState(true);

  return (
    <>
      <LoadingAscii mode="route" active={gate} totalMs={1200} />
      <HeroPlayer onReady={() => setGate(false)} />
    </>
  );
}
