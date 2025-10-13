"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FullBleedPlayer from "@/components/ui/FullBleedPlayer";
import { parseVimeoTitle } from "@/lib/parseVimeoTitle";

/* ==== Types ==== */
export type VimeoItem = {
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

type Props = {
  /** Items préchargés par la page serveur (`/api/vimeo`) */
  initialItems?: VimeoItem[];
};

/* ===== helpers ===== */
function normalize(it: VimeoItem): VimeoItem {
  const parsed = parseVimeoTitle(it.title || it.name || "");
  const niceTitle = parsed?.title
    ? parsed.client
      ? `${parsed.client} — ${parsed.title}`
      : parsed.title
    : it.title || it.name || "Untitled";

  const year =
    parsed?.year ??
    it.year ??
    (it.createdAt ? new Date(it.createdAt).getFullYear() : undefined) ??
    (it.created_time ? new Date(it.created_time).getFullYear() : undefined);

  return { ...it, title: niceTitle, year };
}

/* ========= Composant client ========= */
export default function ProjectsClient({ initialItems }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const search = useSearchParams();
  const year = search.get("year");

  const [projects, setProjects] = useState<VimeoItem[] | null>(initialItems ?? null);
  const [iframeReady, setIframeReady] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VimeoItem | null>(null);

  const src = `/projects-pen.html${year ? `?year=${encodeURIComponent(year)}` : ""}`;

  const post = (msg: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  /** 1) Warm-start depuis sessionStorage si pas d’items */
  useEffect(() => {
    if (projects && projects.length) return;

    try {
      const cached = typeof window !== "undefined" ? sessionStorage.getItem("__VIMEO_PREFETCH") : null;
      if (cached) {
        const j = JSON.parse(cached);
        const itemsRaw: VimeoItem[] = Array.isArray(j?.items) ? j.items : [];
        if (itemsRaw.length) {
          setProjects(itemsRaw.map(normalize));
          return; // on a déjà de quoi peindre, on laissera un fetch rafraîchir après
        }
      }
    } catch {
      /* ignore */
    }
  }, [projects]);

  /** 2) Si toujours rien, fetch côté client */
  useEffect(() => {
    if (projects && projects.length) return;

    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const itemsRaw: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
        const items = itemsRaw.map(normalize);
        if (!stop) setProjects(items);
      } catch {
        if (!stop) setProjects([]);
      }
    })();

    return () => {
      stop = true;
    };
  }, [projects]);

  // Pousser le filtre année
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

          // Masque le texte central parasite du pen
          try {
            const doc = iframeRef.current?.contentDocument;
            if (doc) {
              const style = doc.createElement("style");
              style.innerHTML = `.project-title{display:none!important}`;
              doc.head.appendChild(style);
            }
          } catch {}

          // Fade-in propre
          requestAnimationFrame(() => setShowIframe(true));

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
        className={`h-[100svh] w-full border-0 block transition-opacity duration-300 ${
          showIframe ? "opacity-100" : "opacity-0"
        }`}
        title="Projects Grid"
        onLoad={() => {
          try {
            const doc = iframeRef.current?.contentDocument;
            if (doc) {
              const style = doc.createElement("style");
              style.innerHTML = `.project-title{display:none!important}`;
              doc.head.appendChild(style);
            }
          } catch {}
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
