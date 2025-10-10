"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** URL d'embed Vimeo complète (préférée) */
  embed?: string;
  /** alias possibles conservés pour compat */
  videoSrc?: string;
  src?: string;
  /** image de fallback */
  poster?: string;
};

function normalizeSrc(p: Props): string | null {
  const raw = p.embed ?? p.videoSrc ?? p.src ?? null;
  if (!raw) return null;
  // On enrichit l'URL si c'est bien une URL Vimeo embed
  try {
    const u = new URL(raw, typeof window !== "undefined" ? window.location.href : "https://example.org");
    // Ajout de flags autoplay/muted/playsinline si absents
    const ensure = (k: string, v: string) => { if (!u.searchParams.has(k)) u.searchParams.set(k, v); };
    ensure("autoplay", "1");
    ensure("muted", "1");
    ensure("playsinline", "1");
    ensure("controls", "0");
    ensure("pip", "1");
    ensure("transparent", "0");
    ensure("background", "1");
    return u.toString();
  } catch {
    return raw;
  }
}

export default function FullBleedPlayer(props: Props) {
  const { open, onClose, title, poster } = props;
  const src = normalizeSrc(props);

  // Scroll lock quand le player est ouvert
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => { html.style.overflow = prev; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-[1px] transition-opacity"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 grid place-items-center p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-[1200px] aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          {src ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={src}
              title={title ?? "video"}
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              loading="eager"
            />
          ) : poster ? (
            <img
              src={poster}
              alt={title ?? "poster"}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-zinc-300 text-sm">
              Impossible de charger la vidéo.
            </div>
          )}

          {/* header overlay minimal */}
          {title && (
            <div className="pointer-events-none absolute left-4 bottom-4 text-white font-semibold tracking-wide text-base md:text-lg drop-shadow">
              {title}
            </div>
          )}

          {/* bouton fermer */}
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/60 hover:bg-black/75 text-white grid place-items-center ring-1 ring-white/15"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
