// START PATCH
"use client";

import { useEffect, useState } from "react";
import LoadingAscii from "@/components/LoadingAscii";
import HeroPlayer from "@/components/ui/HeroPlayer";
import ErrorBoundary from "@/components/ErrorBoundary";

export default function ClientHeroSection() {
  const [gate, setGate] = useState(true);

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-home", "1");
    return () => {
      html.removeAttribute("data-home");
    };
  }, []);

  return (
    <>
      <LoadingAscii mode="route" active={gate} totalMs={1200} />
      <ErrorBoundary>
        <HeroPlayer onReady={() => setGate(false)} />
      </ErrorBoundary>
    </>
  );
}
// END PATCH
