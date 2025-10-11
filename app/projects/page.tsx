"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// ==== Types ====
type VimeoItem = {
  id: string;
  title?: string;
  name?: string;
  thumbnail?: string;
  picture?: string;
  thumb?: string;
  poster?: string;
  link?: string;
  embed?: string;      // URL d’embed (Vimeo, etc.)
  src?: string;        // fallback possible
  videoSrc?: string;   // fallback possible
  year?: number;
  createdAt?: string;
  created_time?: string;
};

// Si ton FullBleedPlayer est exporté ailleurs, importe-le ici.
// import FullBleedPlayer from "@/components/ui/FullBleedPlayer";

// --- Stub léger si besoin de compiler sans le composant réel ---
function FullBleedPlayer(props: {
  open: boolean;
  onClose: () => void;
  title?: string;
  poster?: string;
  embed?: string;
}) {
  if (!props.open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={props.onClose}
    >
      <div
        className="relative w-[min(90vw,1200px)] aspect-video bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {props.embed ? (
          <iframe
            src={props.embed}
            title={props.title || "Player"}
            className="absolute inset-0 w-full h-full border-0"
            allow="autoplay; fullscreen; picture-in-picture"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-zinc-200">
            <p>Aucune source vidéo trouvée</p>
          </div>
        )}
        <button
          onClick={props.onClose}
          className="absolute top-2 right-2 rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/20"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ===== Page =====
export default function ProjectsPage() {
  return (
    <main className="relative min-h-[100svh]">
      <Suspense fallback={null}>
        <ProjectsIframe />
      </Suspense>
    </main>
  );
}

// ===== Iframe + Overlay =====
function ProjectsIframe() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const search = useSearchParams();
  const year = search.get("year");

  const [projects, setProjects] = useState<VimeoItem[] | null>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // Overlay player state (PATCH intégré)
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VimeoItem | null>(null);

  const src = `/projects-pen.html${
    year ? `?year=${encodeURIComponent(year)}` : ""
  }`;

  // Helper pour poster un message à l’iframe
  const post = (msg: any) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  // Récupération des projets (no-store pour éviter le cache)
  useEffect(() => {
    let stop = false;
    (async () => {
      try {
        const res = await fetch("/api/vimeo?debug=1", { cache: "no-store" });
        const json = await res.json();
        const items: VimeoItem[] = Array.isArray(json?.items) ? json.items : [];
        if (!stop) {
          setProjects(items);
          post({
            type: "SET_STATUS",
            value: { ok: json?.ok, count: items.length },
          });
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

  // Push du filtre année quand prêt
  useEffect(() => {
    if (!iframeReady || !year) return;
    post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
  }, [year, iframeReady]);

  // Push des projets (et re-pousse l’année si présente)
  useEffect(() => {
    if (!iframeReady || !projects) return;
    post({ type: "SET_PROJECTS", value: projects });
    if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, iframeReady]);

  // Écoute les messages provenant de l’iframe
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const data = e?.data;
      if (!data || typeof data !== "object") return;

      switch (data.type) {
        // L’iframe peut notifier qu’elle est vraiment prête
        case "IFRAME_READY": {
          setIframeReady(true);
          // Au cas où on a déjà les données, on les renvoie
          if (projects) post({ type: "SET_PROJECTS", value: projects });
          if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
          break;
        }
        // Ouverture du player (clic sur un projet dans l’iframe)
        case "OPEN_PLAYER": {
          const value: VimeoItem | undefined = data.value;
          if (value) {
            setCurrent(value);
            setOpen(true);
          }
          break;
        }
        // L’iframe peut demander explicitement les projets
        case "REQUEST_PROJECTS": {
          if (projects) post({ type: "SET_PROJECTS", value: projects });
          break;
        }
        // L’iframe peut demander à forcer une année
        case "REQUEST_YEAR": {
          if (year)
            post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
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
        className="h-[100svh] w-full border-0"
        title="Projects Grid"
        onLoad={() => {
          setIframeReady(true);
          if (projects) post({ type: "SET_PROJECTS", value: projects });
          if (year) post({ type: "SET_YEAR", value: year === "all" ? "all" : year });
        }}
      />

      {/* ===== START PATCH : FullBleedPlayer branché proprement ===== */}
      <FullBleedPlayer
        open={open}
        onClose={() => setOpen(false)}
        title={current?.title || current?.name}
        poster={current?.poster || current?.thumbnail || current?.picture || current?.thumb}
        embed={current?.embed || current?.src || current?.videoSrc}
      />
      {/* ===== END PATCH ===== */}
    </>
  );
}
