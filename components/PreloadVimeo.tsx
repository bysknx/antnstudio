// components/PreloadVimeo.tsx
// Précharge le manifest vidéo local (anciennement Vimeo)
"use client";

import { useEffect } from "react";

export default function PreloadVimeo() {
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        // Cache session pour éviter refetch
        if (sessionStorage.getItem("__VIDEO_PREFETCH")) return;
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        if (!ignore) {
          sessionStorage.setItem(
            "__VIDEO_PREFETCH",
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
