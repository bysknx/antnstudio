"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string | null;
  poster?: string | null;
  embed?: string | null;
};

export default function FullBleedPlayer({ open, onClose, title, embed }: Props) {
  if (!open || !embed) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-[75] rounded-full bg-black/60 px-3 py-1.5 text-sm text-white"
      >
        Close
      </button>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full h-full">
          <iframe
            className="absolute inset-0 h-full w-full"
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
