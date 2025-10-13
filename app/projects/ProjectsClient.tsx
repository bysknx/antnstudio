"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FullBleedPlayer from "@/components/ui/FullBleedPlayer";
import { parseVimeoTitle } from "@/lib/parseVimeoTitle";

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

type Props = {
  /** pré-hydratation côté serveur (optionnelle) */
  initialItems?: VimeoItem[];
};

export default function ProjectsClient({ initialItems = [] }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const search = useSearchParams();
  const year = search.get("year");

  // on démarre directement avec les items passés par la page server
  const [projects, setProjects] = useState<VimeoItem[] | null>(
    initialItems.length ? normalizeItems(initialItems) : null
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

  /* ========= Fetch & normalisation titres (rafraîchit) ========= */
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const itemsRaw: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
        const items = normalizeItems(itemsRaw);
        if (!stop) setProjects(items);
      } catch {
        if (!stop) setProjects([]);
      }
    })();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ========= Push filtre année ========= */
  useEffect(() => {
    if (!iframeReady || !year) return;
    post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [year, iframeReady]);

  /* ========= Push projets ========= */
  useEffect(() => {
    if (!iframeReady || !projects) return;
    post({ type: "SET_PROJECTS", value: projects });
    if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [projects, iframeReady, year]);

  /* ========= Écoute messages venant du pen ========= */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e?.data;
      if (!data || typeof data !== "object") return;

      switch ((data as any).type) {
        case "IFRAME_READY": {
          setIframeReady(true);

          // Masquer le texte “project-title” du pen
          try {
            const doc = iframeRef.current?.contentDocument;
            if (doc) {
              const style = doc.createElement("style");
              style.innerHTML = `.project-title{display:none!important}`;
              doc.head.appendChild(style);
            }
          } catch {
            /* noop */
          }

          // Afficher l’iframe en douceur (crossfade)
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
          } catch {
            /* noop */
          }
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

/* ===== Helpers ===== */
function normalizeItems(itemsRaw: VimeoItem[]): VimeoItem[] {
  return itemsRaw.map((it) => {
    const parsed = parseVimeoTitle(it.title || it.name || "");
    const niceTitle = parsed?.display || it.title || it.name || "Untitled";
    const y =
      parsed?.year ??
      it.year ??
      (it.createdAt ? new Date(it.createdAt).getFullYear() : undefined) ??
      (it.created_time ? new Date(it.created_time).getFullYear() : undefined);

    const poster =
      it.poster ||
      it.thumbnail ||
      (it as any)?.pictures?.sizes?.[((it as any)?.pictures?.sizes?.length ?? 0) - 1]?.link ||
      it.picture ||
      it.thumb ||
      "";

    return {
      ...it,
      title: niceTitle,
      year: y,
      poster,
    };
  });
}
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FullBleedPlayer from "@/components/ui/FullBleedPlayer";
import { parseVimeoTitle } from "@/lib/parseVimeoTitle";

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

type Props = {
  /** pré-hydratation côté serveur (optionnelle) */
  initialItems?: VimeoItem[];
};

export default function ProjectsClient({ initialItems = [] }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const search = useSearchParams();
  const year = search.get("year");

  // on démarre directement avec les items passés par la page server
  const [projects, setProjects] = useState<VimeoItem[] | null>(
    initialItems.length ? normalizeItems(initialItems) : null
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

  /* ========= Fetch & normalisation titres (rafraîchit) ========= */
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo", { cache: "no-store" });
        const json = await res.json();
        const itemsRaw: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
        const items = normalizeItems(itemsRaw);
        if (!stop) setProjects(items);
      } catch {
        if (!stop) setProjects([]);
      }
    })();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ========= Push filtre année ========= */
  useEffect(() => {
    if (!iframeReady || !year) return;
    post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [year, iframeReady]);

  /* ========= Push projets ========= */
  useEffect(() => {
    if (!iframeReady || !projects) return;
    post({ type: "SET_PROJECTS", value: projects });
    if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [projects, iframeReady, year]);

  /* ========= Écoute messages venant du pen ========= */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e?.data;
      if (!data || typeof data !== "object") return;

      switch ((data as any).type) {
        case "IFRAME_READY": {
          setIframeReady(true);

          // Masquer le texte “project-title” du pen
          try {
            const doc = iframeRef.current?.contentDocument;
            if (doc) {
              const style = doc.createElement("style");
              style.innerHTML = `.project-title{display:none!important}`;
              doc.head.appendChild(style);
            }
          } catch {
            /* noop */
          }

          // Afficher l’iframe en douceur (crossfade)
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
          } catch {
            /* noop */
          }
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

/* ===== Helpers ===== */
function normalizeItems(itemsRaw: VimeoItem[]): VimeoItem[] {
  return itemsRaw.map((it) => {
    const parsed = parseVimeoTitle(it.title || it.name || "");
    const niceTitle = parsed?.display || it.title || it.name || "Untitled";
    const y =
      parsed?.year ??
      it.year ??
      (it.createdAt ? new Date(it.createdAt).getFullYear() : undefined) ??
      (it.created_time ? new Date(it.created_time).getFullYear() : undefined);

    const poster =
      it.poster ||
      it.thumbnail ||
      (it as any)?.pictures?.sizes?.[((it as any)?.pictures?.sizes?.length ?? 0) - 1]?.link ||
      it.picture ||
      it.thumb ||
      "";

    return {
      ...it,
      title: niceTitle,
      year: y,
      poster,
    };
  });
}
