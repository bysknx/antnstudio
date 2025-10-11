"use client";

import { usePathname } from "next/navigation";
import FooterPen from "./FooterPen";

/**
 * Affiche le footer global partout SAUF sur /projects
 * (l’iframe possède déjà son propre footer).
 */
export default function FooterMount() {
  const pathname = usePathname();
  if (pathname?.startsWith("/projects")) return null;
  return <FooterPen />;
}
