// START PATCH
// app/page.tsx — Server Component
import HeroPlayer from "@/components/ui/HeroPlayer";
import LoadingAscii from "@/components/ui/LoadingAscii";

export default function HomePage() {
  return (
    <main className="relative">
      {/* Client wrapper pour gérer le gate ASCII */}
      <ClientHeroSection />
    </main>
  );
}

/* ---------- Client side wrapper ---------- */
"use client";
import { useState } from "react";

function ClientHeroSection() {
  const [gate, setGate] = useState(true); // overlay actif tant que vidéo non prête

  return (
    <>
      {/* Overlay ASCII tant que gate actif */}
      <LoadingAscii mode="route" active={gate} totalMs={1200} />

      {/* HeroPlayer lève onReady() dès que le player Vimeo joue */}
      <HeroPlayer onReady={() => setGate(false)} />
    </>
  );
}
// END PATCH
