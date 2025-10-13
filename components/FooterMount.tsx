"use client";
import { usePathname } from "next/navigation";
import FooterFromPen from "./FooterFromPen";

export default function FooterMount() {
  const pathname = usePathname();
  // Masquer sur /projects (l’iframe inclut son propre footer)
  if (pathname?.startsWith("/projects")) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60]"
      aria-hidden
    >
      <FooterFromPen />
    </div>
  );
}
