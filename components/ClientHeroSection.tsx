// START PATCH
"use client";

import { useEffect, useState } from "react";
import LoadingAscii from "@/components/LoadingAscii";
import HeroPlayer from "@/components/ui/HeroPlayer";

export default function ClientHeroSection() {
  const [gate, setGate] = useState(true);

  // Marque la home pour masquer le canvas global
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
      <HeroPlayer onReady={() => setGate(false)} />
    </>
  );
}
// END PATCH
