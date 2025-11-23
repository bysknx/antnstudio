"use client";

import { useMemo } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string | null;
  poster?: string | null;
  embed?: string | null;
};

function normalizeEmbed(input?: string | null) {
  if (!input) return null;
  try {
    const url = new URL(input, "https://player.vimeo.com");
    const set = (k: string, v: string) => url.searchParams.set(k, v);
    set("autoplay", "1");
    set("muted", "1");
    set("controls", "1");
    set("playsinline", "1");
    set("pip", "1");
    set("title", "0");
    set("byline", "0");
    return url.toString();
  } catch {
    return input;
  }
}

export default function FullBleedPlayer({
  open,
  onClose,
  title,
  poster,
  embed,
}: Props) {
  const embedSrc = useMemo(() => normalizeEmbed(embed), [embed]);

  if (!open || !embedSrc) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-500 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-[3px]" />

      {/* Bouton close */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-[85] rounded-full bg-black/70 px-4 py-1.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white hover:text-black"
      >
        Close
      </button>

      {/* Vidéo plein écran */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative mx-auto h-full w-full max-w-6xl overflow-hidden rounded-lg shadow-[0_25px_120px_rgba(0,0,0,0.55)] ring-1 ring-white/5">
          {poster ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <img
                src={poster}
                alt=""
                className="h-full w-full object-cover opacity-70 blur-[1px]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/65" />
            </div>
          ) : null}

          <iframe
            key={embedSrc}
            className="relative inset-0 h-full w-full rounded-lg"
            src={embedSrc}
            title={title ?? "video"}
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
