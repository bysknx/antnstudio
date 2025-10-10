"use client";
import { usePathname } from "next/navigation";
import GlCanvas from "@/components/GlCanvas";
import Nav from "@/components/Nav";

export default function ChromeFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="chrome relative z-0">
      {/* Pas de canvas en home, pour éviter tout flash avant hydratation */}
      {!isHome && (
        <div id="gl-layer">
          <GlCanvas />
          <div className="grain" />
          <div className="scanlines" />
        </div>
      )}

      {/* Nav au-dessus */}
      <div className="relative z-20">
        <Nav />
      </div>

      {/* Contenu */}
      <div className="page relative z-10">{children}</div>
    </div>
  );
}
