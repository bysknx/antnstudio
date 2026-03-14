"use client";
import { usePathname } from "next/navigation";
import FooterFromPen from "./FooterFromPen";

export default function FooterMount() {
  const pathname = usePathname();
  // Masquer uniquement sur l'admin ; /projects affiche le footer public
  if (pathname?.startsWith("/admin")) return null;
  return (
    <div
      className="footer pointer-events-none fixed inset-x-0 bottom-0 z-[60]"
      aria-hidden
    >
      <FooterFromPen />
    </div>
  );
}
