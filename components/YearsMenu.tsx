"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";

type YearsMenuProps = {
  years: number[]; // ex: [2025, 2024, 2023, ...]
  active?: number | "all"; // année sélectionnée
  onSelect?: (value: number | "all") => void;
  className?: string; // optionnel pour l’alignement dans ta page
  label?: string; // libellé du bouton (par défaut: "Years")
};

export default function YearsMenu({
  years,
  active = "all",
  onSelect,
  className,
  label = "Years",
}: YearsMenuProps) {
  const [open, setOpen] = useState(false);
  const [reduced, setReduced] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Respecte prefers-reduced-motion
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handle = () => setReduced(mql.matches);
    handle();
    mql.addEventListener?.("change", handle);
    return () => mql.removeEventListener?.("change", handle);
  }, []);

  // Fermeture au clic extérieur / ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey, { passive: true });
    document.addEventListener("mousedown", onClick, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const handleSelect = (val: number | "all") => {
    onSelect?.(val);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={clsx("relative select-none", className)}>
      {/* Bouton TEXT-MORPH */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="group relative inline-flex items-center gap-3 rounded-full px-3 py-2 text-[13px] font-semibold tracking-wide text-zinc-100 outline-none ring-0"
      >
        {/* petit point qui “s’étire” */}
        <motion.span
          aria-hidden
          className="block h-2 w-2 rounded-full bg-zinc-100"
          animate={
            open && !reduced
              ? {
                  x: [-0, -12, 0],
                  scaleX: [1, 2.4, 1],
                  borderRadius: ["50%", "4px", "50%"],
                }
              : { x: 0, scaleX: 1, borderRadius: "50%" }
          }
          transition={
            reduced
              ? { duration: 0 }
              : {
                  duration: 0.28,
                  times: [0, 0.35, 1],
                  ease: ["easeOut", "easeInOut", "easeIn"],
                }
          }
        />

        {/* conteneur qui masque les deux libellés empilés */}
        <span className="relative h-5 w-[66px] overflow-hidden">
          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            // "YEARS" (ou label) monte vers le haut quand open
            animate={{ y: open && !reduced ? -20 : 0 }}
            transition={{
              duration: reduced ? 0 : 0.22,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {label.toUpperCase()}
          </motion.span>

          <motion.span
            className="absolute inset-0 flex items-center justify-center"
            // "CLOSE" vient du bas quand open
            animate={{ y: open && !reduced ? 0 : 20 }}
            transition={{
              duration: reduced ? 0 : 0.22,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            CLOSE
          </motion.span>
        </span>
      </button>

      {/* PANNEAU “LIQUID GLASS” */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 6, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 4, filter: "blur(8px)" }}
            transition={{
              duration: reduced ? 0 : 0.22,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="absolute left-0 z-40 mt-3 w-[min(92vw,560px)] rounded-2xl border border-white/10 bg-zinc-900/80 p-3 shadow-[inset_0_0_0.5px_rgba(255,255,255,.25),0_8px_30px_rgba(0,0,0,.35)] backdrop-blur-xl"
          >
            <div className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Years
            </div>

            <div className="flex flex-wrap gap-2">
              <YearChip
                label="All"
                active={active === "all"}
                onClick={() => handleSelect("all")}
              />
              {years.map((y) => (
                <YearChip
                  key={y}
                  label={String(y)}
                  active={active === y}
                  onClick={() => handleSelect(y)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function YearChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "rounded-xl px-3 py-1.5 text-sm transition-colors",
        "border border-white/10",
        active
          ? "bg-white/15 text-zinc-50"
          : "bg-zinc-800/40 text-zinc-300 hover:bg-zinc-800/70",
      )}
    >
      {label}
    </button>
  );
}
