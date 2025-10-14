// components/PreloadVimeo.tsx
"use client";

import { useEffect } from "react";

export default function PreloadVimeo() {
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        // si on a déjà le cache de session, on ne refetch pas
        if (sessionStorage.getItem("__VIMEO_PREFETCH")) return;
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        if (!ignore) {
          sessionStorage.setItem(
            "__VIMEO_PREFETCH",
            JSON.stringify(json || {}),
          );
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);
  return null;
}
