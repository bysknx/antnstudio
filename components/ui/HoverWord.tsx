"use client";

import clsx from "clsx";

export default function HoverWord({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "relative inline-block cursor-default transition-transform duration-200",
        "hover:-translate-y-[1px]",
        className,
      )}
    >
      <span className="relative z-10">{children}</span>
      {/* souligné qui se dévoile */}
      <span
        aria-hidden
        className="absolute left-0 right-0 -bottom-0.5 h-[1.5px] origin-left scale-x-0 bg-white/70 transition-transform duration-200 ease-out group-hover:scale-x-100"
      />
      {/* halo subtil */}
      <span
        aria-hidden
        className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-white/10 opacity-0 blur-[2px] transition-opacity duration-200 group-hover:opacity-100"
      />
    </span>
  );
}
