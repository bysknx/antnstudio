// app/projects/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import YearsMenu from "@/components/YearsMenu";

export default function ProjectsPage() {
  const [year, setYear] = useState<number | "all">("all");
  const years = useMemo(() => [2025, 2024, 2023], []);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const send = (value: number | "all") => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "SET_YEAR", value },
      "*" // même origine, ok
    );
  };

  // à chaque changement d’année on notifie l’iframe
  useEffect(() => {
    send(year);
  }, [year]);

  return (
    <main className="relative min-h-[100svh]">
      <div className="pointer-events-none absolute left-4 top-4 z-30">
        <div className="pointer-events-auto">
          <YearsMenu years={years} active={year} onSelect={setYear} label="+Years" />
        </div>
      </div>

      <iframe
        ref={iframeRef}
        src="/projects-pen.html"
        className="h-[100svh] w-full border-0"
        title="Projects Grid"
        // s’assure que l’iframe reçoit l’état initial après chargement
        onLoad={() => send(year)}
      />
    </main>
  );
}
