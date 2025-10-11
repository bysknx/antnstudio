"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FullBleedPlayer from "@/components/ui/FullBleedPlayer";

/* ========= Types ========= */
type VimeoItem = {
  id: string;
  title?: string;
  name?: string;
  thumbnail?: string;
  picture?: string;
  thumb?: string;
  poster?: string;
  link?: string;
  embed?: string;      // URL d’embed Vimeo
  src?: string;        // fallback
  videoSrc?: string;   // fallback
  year?: number;
  createdAt?: string;
  created_time?: string;
};

/* ========= Page ========= */
export default function ProjectsPage() {
  return (
    <main className="relative min-h-[100svh]">
      <Suspense fallback={null}>
        <ProjectsIframe />
      </Suspense>
    </main>
  );
}

/* ========= Iframe + Overlay (communication postMessage) ========= */
function ProjectsIframe() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const search = useSearchParams();
  const year = search.get("year");

  const [projects, setProjects] = useState<VimeoItem[] | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Overlay player
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VimeoItem | null>(null);

  const src = `/projects-pen.html${year ? `?year=${encodeURIComponent(year)}` : ""}`;

  const post = (msg: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  // Récupération des projets — sans debug ni statut
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const items: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
        if (!stop) setProjects(items);
      } catch {
        if (!stop) setProjects([]);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  // Pousser le filtre année quand prêt
  useEffect(() => {
    if (!iframeReady || !year) return;
    post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [year, iframeReady]);

  // Pousser les projets (et re-pousser l’année)
  useEffect(() => {
    if (!iframeReady || !projects) return;
    post({ type: "SET_PROJECTS", value: projects });
    if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [projects, iframeReady, year]);

  // Écoute des messages de l’iframe
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
        default:
          break;
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
