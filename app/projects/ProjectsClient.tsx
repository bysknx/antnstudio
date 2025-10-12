"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FullBleedPlayer from "@/components/ui/FullBleedPlayer";

type VimeoItem = {
  id: string;
  title?: string;
  name?: string;
  thumbnail?: string;
  picture?: string;
  thumb?: string;
  poster?: string;
  link?: string;
  embed?: string;
  src?: string;
  videoSrc?: string;
  year?: number;
  createdAt?: string;
  created_time?: string;
};

export default function ProjectsClient({ initialItems }: { initialItems: VimeoItem[] }) {
  return (
    <main className="relative min-h-[100svh]">
      <Suspense fallback={null}>
        <ProjectsIframe initialItems={initialItems} />
      </Suspense>
    </main>
  );
}

function ProjectsIframe({ initialItems }: { initialItems: VimeoItem[] }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const search = useSearchParams();
  const year = search.get("year");

  const [projects, setProjects] = useState<VimeoItem[] | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VimeoItem | null>(null);
  const [mounted, setMounted] = useState(false);

  const src = `/projects-pen.html${year ? `?year=${encodeURIComponent(year)}` : ""}`;

  const post = (msg: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  // Initialise depuis le RSC + shortlist locale (image only, desc date, top 5)
  useEffect(() => {
    const items = Array.isArray(initialItems) ? initialItems : [];
    const shortlisted = items
      .filter((x) => x.poster || x.thumbnail || x.picture || x.thumb)
      .sort((a, b) => {
        const ta = Date.parse(a.createdAt || a.created_time || "") || 0;
        const tb = Date.parse(b.createdAt || b.created_time || "") || 0;
        return tb - ta;
      })
      .slice(0, 5);
    setProjects(shortlisted);
  }, [initialItems]);

  useEffect(() => {
    if (!iframeReady || !year) return;
    post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [year, iframeReady]);

  useEffect(() => {
    if (!iframeReady || !projects) return;
    post({ type: "SET_PROJECTS", value: projects });
    if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [projects, iframeReady, year]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e?.data;
      if (!data || typeof data !== "object") return;

      switch ((data as any).type) {
        case "IFRAME_READY": {
          setIframeReady(true);
          if (projects) post({ type: "SET_PROJECTS", value: projects });
          if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
          break;
        }
        case "OPEN_PLAYER": {
          const value: VimeoItem | undefined = (data as any).value;
          if (value) {
            setCurrent(value);
            setOpen(true);
          }
          break;
        }
        case "REQUEST_PROJECTS": {
          if (projects) post({ type: "SET_PROJECTS", value: projects });
          break;
        }
        case "REQUEST_YEAR": {
          if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
          break;
        }
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [projects, year]);

  return (
    <>
      <iframe
        ref={iframeRef}
        src={src}
        className={`h-[100svh] w-full border-0 block transition-opacity duration-300 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        title="Projects Grid"
        onLoad={() => {
          setIframeReady(true);
          if (projects) post({ type: "SET_PROJECTS", value: projects });
          if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
          setMounted(true);
        }}
      />

      <FullBleedPlayer
        open={open}
        onClose={() => setOpen(false)}
        title={current?.title || current?.name}
        poster={current?.poster || current?.thumbnail || current?.picture || current?.thumb}
        // 👇 si un embed brut est fourni, on lui ajoute les query params Vimeo
        embed={
          current?.embed
            ? `${current.embed}${
                current.embed.includes("?") ? "&" : "?"
              }autoplay=1&muted=0&title=0&byline=0&portrait=0`
            : current?.src || current?.videoSrc || undefined
        }
      />
    </>
  );
}
