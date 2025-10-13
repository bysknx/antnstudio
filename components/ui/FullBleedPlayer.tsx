// components/ui/FullBleedPlayer.tsx
"use client";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  poster?: string | null;
  embed?: string | null;
};

export default function FullBleedPlayer({ open, onClose, title, embed }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      {/* backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"
      />
      {/* iframe plein écran */}
      <div className="absolute inset-0 z-[91] flex items-center justify-center">
        <iframe
          title={title || "video"}
          src={embed || ""}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          style={{ border: 0 }}
        />
      </div>
      {/* bouton close */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 z-[92] rounded-full bg-white/10 text-white px-3 py-1 text-sm hover:bg-white/20"
      >
        Close
      </button>
    </div>
  );
}
