"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type VimeoItem = {
  id: string;
  title?: string;
  name?: string;
  thumbnail?: string;
  picture?: string;
  thumb?: string;
  link?: string;
  embed?: string;
  year?: number;
  createdAt?: string;
  created_time?: string;
};

export default function ProjectsPage() {
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
  const year = search.get("year");
  const [projects, setProjects] = useState<VimeoItem[] | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  const src = `/projects-pen.html${year ? `?year=${encodeURIComponent(year)}` : ""}`;

  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo?debug=1", { cache: "no-store" });
        const json = await res.json();
        const items = Array.isArray(json?.items) ? json.items : [];
        if (!stop) {
          setProjects(items);
          post({ type: "SET_STATUS", value: { ok: json?.ok, count: items.length } });
        }
      } catch {
        if (!stop) {
          setProjects([]);
          post({ type: "SET_STATUS", value: { ok: false, count: 0 } });
        }
      }
    })();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const post = (msg: any) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  useEffect(() => {
    if (!iframeReady || !year) return;
    post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [year, iframeReady]);

  useEffect(() => {
    if (!iframeReady || !projects) return;
    post({ type: "SET_PROJECTS", value: projects });
    if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [projects, iframeReady]); // year renvoyé ici si présent

  return (
    <iframe
      ref={iframeRef}
      src={src}
      className="h-[100svh] w-full border-0"
      title="Projects Grid"
      onLoad={() => {
        setIframeReady(true);
        if (projects) post({ type: "SET_PROJECTS", value: projects });
        if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
      }}
    />
  );
}
