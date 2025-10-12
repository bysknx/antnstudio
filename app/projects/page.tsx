"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FullBleedPlayer from "@/components/ui/FullBleedPlayer";
import { parseVimeoTitle } from "@/lib/parseVimeoTitle";


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

const CACHE_KEY_VIMEO = "antn_vimeo_cache_v1";

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
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VimeoItem | null>(null);

  const src = `/projects-pen.html${year ? `?year=${encodeURIComponent(year)}` : ""}`;

  const post = (msg: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  // charge depuis sessionStorage si dispo (préchargé par le loader)
  useEffect(() => {
    let stop = false;
    const boot = async () => {
      try {
        const cached = sessionStorage.getItem(CACHE_KEY_VIMEO);
        if (cached) {
          const json = JSON.parse(cached);
          const items: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
          // enrichir titres (client + title + year)
          const mapped = items.map((it) => {
            const p = parseVimeoTitle(it.title || it.name || "");
            return {
              ...it,
              title: `${p.client ?? ""}${p.client ? " — " : ""}${p.title ?? ""}`,
              year: Number(p.year) || it.year,
            };
          });
          if (!stop) setProjects(mapped);
        } else {
          const res = await fetch("/api/vimeo", { cache: "no-store" });
          const json = await res.json();
          sessionStorage.setItem(CACHE_KEY_VIMEO, JSON.stringify(json));
          const items: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
          const mapped = items.map((it) => {
            const p = parseVimeoTitle(it.title || it.name || "");
            return {
              ...it,
              title: `${p.client ?? ""}${p.client ? " — " : ""}${p.title ?? ""}`,
              year: Number(p.year) || it.year,
            };
          });
          if (!stop) setProjects(mapped);
        }
      } catch {
        if (!stop) setProjects([]);
      }
    };
    boot();
    return () => {
      stop = true;
    };
  }, []);

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
        className="h-[100svh] w-full border-0 block"
        title="Projects Grid"
        onLoad={() => {
          setIframeReady(true);
          if (projects) post({ type: "SET_PROJECTS", value: projects });
          if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
        }}
      />

      <FullBleedPlayer
        open={open}
        onClose={() => setOpen(false)}
        title={current?.title || current?.name}
        poster={current?.poster || current?.thumbnail || current?.picture || current?.thumb}
        embed={current?.embed || current?.src || current?.videoSrc}
      />
    </>
  );
}
