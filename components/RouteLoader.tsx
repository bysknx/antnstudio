"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingAscii from "./LoadingAscii";

/**
 * Affiche le loader ASCII lors des transitions de route.
 * `LoadingAscii` ne prend qu'une prop `force?: boolean`,
 * donc on ne lui passe QUE ça.
 */
export default function RouteLoader() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    // active le loader au changement de route
    setActive(true);
    // laisse le composant gérer son fade interne ;
    // on coupe après ~900ms
    const t = setTimeout(() => setActive(false), 900);
    return () => clearTimeout(t);
  }, [pathname]);

  // Si tu préfères qu'il reste monté en permanence :
  // return <LoadingAscii force={active} />;
  return active ? <LoadingAscii force /> : null;
}
