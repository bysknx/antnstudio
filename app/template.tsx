"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    try {
      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handle = () => setReduced(mql.matches);
      handle();
      mql.addEventListener?.("change", handle);
      return () => mql.removeEventListener?.("change", handle);
    } catch {}
  }, []);

  if (reduced) return <>{children}</>;

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, filter: "blur(12px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.4, ease: [0.22, 0.03, 0.26, 1] }}
          style={{ willChange: "opacity, filter" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </MotionConfig>
  );
}
