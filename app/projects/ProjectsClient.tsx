// app/projects/ProjectsClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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

type Props = { initialItems: VimeoItem[] };

function pickPoster(it: VimeoItem) {
  return it.poster || it.thumbnail || it.picture || it.thumb || "";
}

function normalize(items: VimeoItem[]): VimeoItem[] {
  return (items || []).map((it) => {
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

    return {
      ...it,
      title: niceTitle,
      year,
      poster: pickPoster(it),
      embed: it.embed || it.src || it.videoSrc, // keep any playable src
    };
  });
}

export default function ProjectsClient({ initialItems }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const search = useSearchParams();
  const year = search.get("year");

  const [projects, setProjects] = useState<VimeoItem[] | null>(
    normalize(initialItems ?? [])
  );
  const [iframeReady, setIframeReady] = useState(false);
  const [showIframe, setShowIframe] = useState(false);

  // Overlay player
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VimeoItem | null>(null);

  const src = `/projects-pen.html${year ? `?year=${encodeURIComponent(year)}` : ""}`;

  const post = (msg: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  // Refresh from API on mount (ensures latest + proper titles)
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const items: VimeoItem[] = normalize(Array.isArray(json?.items) ? json.items : []);
        if (!stop) setProjects(items);
      } catch {
        if (!stop) setProjects((prev) => prev ?? []);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  // push filter year
  useEffect(() => {
    if (!iframeReady || !year) return;
    post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [year, iframeReady]);

  // push projects (and re-push year)
  useEffect(() => {
    if (!iframeReady || !projects) return;
    post({ type: "SET_PROJECTS", value: projects });
    if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [projects, iframeReady, year]);

  // listen messages from pen
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e?.data;
      if (!data || typeof data !== "object") return;

      switch ((data as any).type) {
        case "IFRAME_READY": {
          setIframeReady(true);

          // Hide the pen's center title (text parasite)
          try {
            const doc = iframeRef.current?.contentDocument;
            if (doc) {
              const style = doc.createElement("style");
              style.innerHTML = `.project-title{display:none!important}`;
              doc.head.appendChild(style);
            }
          } catch {}

          // fade-in after one frame
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
          if (year) post({ type: "SET_YEAR", value: year === "all" ? "
