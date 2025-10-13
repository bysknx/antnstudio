"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  poster?: string;
  embed?: string; // vimeo/youtube url
};

export default function FullBleedPlayer({
  open,
  onClose,
  title,
  poster,
  embed,
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // force autoplay; plein écran visuel
  const src = embed
    ? embed.includes("?")
      ? `${embed}&autoplay=1&muted=0&title=0&byline=0&portrait=0&playsinline=1`
      : `${embed}?autoplay=1&muted=0&title=0&byline=0&portrait=0&playsinline=1`
    : undefined;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="
        fixed inset-0 z-[70] grid place-items-center
        bg-black/90 backdrop-blur-[2px]
      "
      onClick={onClose}
    >
      <div className="relative h-[min(90vh,100svh)] w-[min(92vw,178vh)]" onClick={(e) => e.stopPropagation()}>
        {src ? (
          <iframe
            src={src}
            title={title || "Player"}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <img
            src={poster}
            alt={title || "Poster"}
            className="absolute inset-0 h-full w-full object-contain"
          />
        )}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white hover:bg-white/25"
        >
          Close
        </button>
      </div>
    </div>
  );
}
