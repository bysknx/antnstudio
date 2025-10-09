// app/projects/page.tsx
"use client";

import { useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ProjectsPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const search = useSearchParams();
  const year = search.get("year"); // "all" | "2025" | etc. | null

  // Optionnel : on renvoie l'état initial à l'iframe une fois chargée,
  // au cas où tu arrives avec ?year= dans l'URL.
  useEffect(() => {
    if (!year) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "SET_YEAR", value: year === "all" ? "all" : year },
      "*"
    );
  }, [year]);

  const src = `/projects-pen.html${year ? `?year=${encodeURIComponent(year)}` : ""}`;

  return (
    <main className="relative min-h-[100svh]">
      <iframe
        ref={iframeRef}
        src={src}
        className="h-[100svh] w-full border-0"
        title="Projects Grid"
        onLoad={() => {
          if (!year) return;
          iframeRef.current?.contentWindow?.postMessage(
            { type: "SET_YEAR", value: year === "all" ? "all" : year },
            "*"
          );
        }}
      />
    </main>
  );
}
