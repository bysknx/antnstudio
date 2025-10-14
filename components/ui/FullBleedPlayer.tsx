"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string | null;
  poster?: string | null;
  embed?: string | null;
};

export default function FullBleedPlayer({
  open,
  onClose,
  title,
  embed,
}: Props) {
  if (!open || !embed) return null;

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-500 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px]" />

      {/* Bouton close */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 z-[85] rounded-full bg-black/70 px-4 py-1.5 text-sm font-medium text-white hover:bg-white hover:text-black transition-colors duration-200"
      >
        Close
      </button>

      {/* Vidéo plein écran */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full h-full max-w-6xl mx-auto">
          <iframe
            className="absolute inset-0 h-full w-full rounded-md"
            src={embed}
            title={title ?? "video"}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
