"use client";
import { useMemo } from "react";

export default function FullBleedPlayer({
  open,
  onClose,
  title,
  embed,
  poster,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  embed?: string | null | undefined;
  poster?: string | null | undefined;
}) {
  if (!open) return null;

  const src = useMemo(() => {
    if (!embed) return null;
    // assure autoplay/muted/controls off
    const url = new URL(embed, typeof window !== "undefined" ? window.location.href : "https://example.org");
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("muted", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("controls", "0");
    url.searchParams.set("pip", "1");
    url.searchParams.set("transparent", "0");
    url.searchParams.set("background", "1");
    return url.toString();
  }, [embed]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="absolute left-1/2 top-1/2 w-[min(92vw,1200px)] -translate-x-1/2 -translate-y-1/2 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {src ? (
          <iframe
            key={src}
            src={src}
            title={title || "Video"}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-zinc-200">
            {poster ? <img src={poster} alt={title || "poster"} className="max-h-full object-contain" /> : "No source"}
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/20"
        >
          Close
        </button>
      </div>
    </div>
  );
}
