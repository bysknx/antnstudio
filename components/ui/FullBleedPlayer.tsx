"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string | null;
  year?: number | null;
  poster?: string | null;
  embed?: string | null;
};

const IDLE_HIDE_MS = 2000;

export default function FullBleedPlayer({
  open,
  onClose,
  title,
  year,
  poster,
  embed,
}: Props) {
  const [uiVisible, setUiVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setUiVisible(false);
      hideTimerRef.current = null;
    }, IDLE_HIDE_MS);
  }, []);

  const showUi = useCallback(() => {
    setUiVisible(true);
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    scheduleHide();
  }, [scheduleHide]);

  useEffect(() => {
    if (!open) return;
    setUiVisible(true);
    scheduleHide();

    const onMove = () => {
      showUi();
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onMove);
    document.addEventListener("keydown", onMove);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onMove);
      document.removeEventListener("keydown", onMove);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [open, scheduleHide, showUi]);

  if (!open || !embed) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-500 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-[3px]" />

      {/* UI overlay — disparaît après 2s sans mouvement */}
      <div
        className={`pointer-events-none absolute inset-0 z-[85] transition-opacity duration-300 ${
          uiVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto absolute right-6 top-6">
          <button
            onClick={onClose}
            className="rounded border border-white/20 bg-black/70 px-2.5 py-1 text-xs font-mono text-white/80 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Barre crédits / métadonnées en bas */}
        {(title || year) && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2">
            <div className="rounded border border-white/10 bg-black/50 px-4 py-2 text-xs font-mono text-white/80 backdrop-blur-sm">
              {title && <span>{title}</span>}
              {title && year && <span className="mx-2 text-white/40">·</span>}
              {year && <span>{year}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Vidéo plein écran — 100% largeur et hauteur */}
      <div className="absolute inset-0">
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

        <video
          key={embed}
          className="absolute inset-0 h-full w-full"
          src={embed}
          title={title ?? "video"}
          autoPlay
          controls
          playsInline
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
