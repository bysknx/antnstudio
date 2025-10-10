// START PATCH
"use client";

import { useEffect, useState } from "react";
import LoadingAscii from "@/components/LoadingAscii";
import HeroPlayer from "@/components/ui/HeroPlayer";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ClientHeroSection() {
  const [gate, setGate] = useState(true);

  // Fallback: si on n’a pas reçu onReady après 2.5s, on retire quand même le gate
  useEffect(() => {
    const t = window.setTimeout(() => setGate(false), 2500);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <LoadingAscii mode="route" active={gate} totalMs={1200} />

      <ErrorBoundary
        fallback={
          <div className="absolute inset-0 grid place-items-center text-sm text-zinc-400">
            <span>Chargement des projets…</span>
          </div>
        }
      >
        <HeroPlayer onReady={() => setGate(false)} />
      </ErrorBoundary>
    </>
  );
}
// END PATCH
