"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";

export type ShowcaseItem = {
  id: string;
  kind: "image" | "video";
  src: string;         // image src ou video src
  poster?: string;     // poster pour vidéo (optionnel)
  title?: string;
  year?: number;
};

export default function HomeShowcase({
  items,
  initial = 0,
  className,
}: {
  items: ShowcaseItem[];
  initial?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(initial);
  const lockedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const active = safeItems[index];

  // scroll step-by-step + throttle 1s
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (lockedRef.current) return e.preventDefault();
      e.preventDefault();
      const dir = Math.sign(e.deltaY);
      if (dir === 0) return;
      lockedRef.current = true;
      setIndex((i) =>
        (i + (dir > 0 ? 1 : -1) + safeItems.length) % safeItems.length
      );
      setTimeout(() => (lockedRef.current = false), 1000);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel as any);
  }, [safeItems.length]);

  // clavier (optionnel mais sympa)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lockedRef.current) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        lockedRef.current = true;
        setIndex((i) => (i + 1) % safeItems.length);
        setTimeout(() => (lockedRef.current = false), 1000);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        lockedRef.current = true;
        setIndex((i) => (i - 1 + safeItems.length) % safeItems.length);
        setTimeout(() => (lockedRef.current = false), 1000);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [safeItems.length]);

  return (
    <div
      ref={containerRef}
      className={clsx(
        "relative h-[100svh] w-full overflow-hidden bg-[#0b0b0b]",
        className
      )}
    >
      {/* contenu plein écran */}
      <div className="absolute inset-0 grid place-items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active?.id}
            initial={{ opacity: 0, scale: 0.985, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.985, filter: "blur(6px)" }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="max-h-[84svh] max-w-[88vw]"
          >
            {active?.kind === "video" ? (
              <WhiteFramedVideo src={active.src} poster={active.poster} />
            ) : (
              <WhiteFramedImage src={active.src} alt={active?.title ?? ""} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* selector à droite */}
      <div className="pointer-events-none absolute right-7 top-1/2 z-30 -translate-y-1/2">
        <div className="flex flex-col gap-2">
          {safeItems.map((_, i) => (
            <button
              key={_.id}
              onClick={() => setIndex(i)}
              className={clsx(
                "pointer-events-auto h-[2px] w-6 origin-right rounded-full bg-white/30 transition",
                "hover:scale-x-[1.6] hover:bg-white/60",
                i === index && "scale-x-[2.2] bg-white/90"
              )}
              aria-label={`Go to ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* === Wrappers “contour blanc + jour 1px” ===
   Structure :
   border blanc (1px) → padding 1px (jour) → media
   Le “jour” prend la couleur du fond (noir).
*/
function WhiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-none border border-white/90">
      <div className="bg-[#0b0b0b] p-[1px]">{children}</div>
    </div>
  );
}

function WhiteFramedVideo({
  src,
  poster,
}: {
  src: string;
  poster?: string;
}) {
  return (
    <WhiteFrame>
      <video
        key={src}
        src={src}
        poster={poster}
        controls
        playsInline
        className="block max-h-[84svh] max-w-[88vw] bg-black"
      />
    </WhiteFrame>
  );
}

function WhiteFramedImage({ src, alt }: { src: string; alt?: string }) {
  return (
    <WhiteFrame>
      {/* image “contain” pour garder tout dans l’écran */}
      <img
        src={src}
        alt={alt ?? ""}
        className="block max-h-[84svh] max-w-[88vw] object-contain bg-black"
      />
    </WhiteFrame>
  );
}
