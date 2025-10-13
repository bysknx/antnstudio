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

export default function ProjectsClient() {
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
  const [showIframe, setShowIframe] = useState(false);

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VimeoItem | null>(null);

  const src = `/projects-pen.html${year ? `?year=${encodeURIComponent(year)}` : ""}`;

  const post = (msg: unknown) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  // fetch & parse: “Client — Titre”, année sous la vignette
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const itemsRaw: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];

        const items = itemsRaw.map((it) => {
          const parsed = parseVimeoTitle(it.title || it.name || "");
          const nice =
            parsed?.title
              ? parsed.client
                ? `${parsed.client} — ${parsed.title}`
                : parsed.title
              : it.title || it.name || "Untitled";

          const yr =
            parsed?.year ??
            it.year ??
            (it.createdAt ? new Date(it.createdAt).getFullYear() : undefined) ??
            (it.created_time ? new Date(it.created_time).getFullYear() : undefined);

          return { ...it, title: nice, year: yr };
        });

        if (!stop) setProjects(items);
      } catch {
        if (!stop) setProjects([]);
      }
    })();
    return () => {
      stop = true;
    };
  }, []);

  // filtre année -> pen
  useEffect(() => {
    if (!iframeReady || !year) return;
    post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [year, iframeReady]);

  // push projets
  useEffect(() => {
    if (!iframeReady || !projects) return;
    post({ type: "SET_PROJECTS", value: projects });
    if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [projects, iframeReady, year]);

  // écoute pen
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e?.data as any;
      if (!data || typeof data !== "object") return;

      switch (data.type) {
        case "IFRAME_READY":
          setIframeReady(true);
          requestAnimationFrame(() => setShowIframe(true));
          if (projects) post({ type: "SET_PROJECTS", value: projects });
          if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
          break;
        case "OPEN_PLAYER": {
          const value: VimeoItem | undefined = data.value;
          if (!value) break;
          // force autoplay sur Vimeo si possible
          const embedUrl =
            value.embed || value.src || value.videoSrc || value.link || "";
          const url = new URL(embedUrl, "https://player.vimeo.com");
          url.searchParams.set("autoplay", "1");
          url.searchParams.set("muted", "0");
          setCurrent({ ...value, embed: url.toString() });
          setOpen(true);
          break;
        }
        case "REQUEST_PROJECTS":
          if (projects) post({ type: "SET_PROJECTS", value: projects });
          break;
        case "REQUEST_YEAR":
          if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
          break;
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
        title="Projects Grid"
        className={`h-[100svh] w-full border-0 block transition-opacity duration-300 ${
          showIframe ? "opacity-100" : "opacity-0"
        }`}
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
