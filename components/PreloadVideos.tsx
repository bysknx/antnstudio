// components/PreloadVideos.tsx
// Précharge le manifest vidéo (API /api/videos)
"use client";

import { useEffect } from "react";

export default function PreloadVideos() {
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        if (sessionStorage.getItem("__VIDEO_PREFETCH")) return;
        const res = await fetch("/api/videos", { cache: "no-store" });
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
