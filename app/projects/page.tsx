// app/projects/page.tsx
"use client";

import { useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

export default function ProjectsPage() {
  // Rien d'autre ici : on met la logique qui lit les params dans un enfant
  return (
    <main className="relative min-h-[100svh]">
      <Suspense fallback={null}>
        <ProjectsIframe />
      </Suspense>
    </main>
  );
}

function ProjectsIframe() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const search = useSearchParams();
  const year = search.get("year"); // "all" | "2025" | etc. | null

  // Construit l'URL de l'iframe (permet deep-linking /projects?year=2025)
  const src = `/projects-pen.html${year ? `?year=${encodeURIComponent(year)}` : ""}`;

  // Envoie l’état initial à l’iframe quand elle est prête
  useEffect(() => {
    if (!year) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "SET_YEAR", value: year === "all" ? "all" : year },
      "*"
    );
  }, [year]);

  return (
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
  );
}
