"use client";

import { useEffect, useState } from "react";

export default function ClientCrashCatcher() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      ev.preventDefault();
      // Surface the error message without triggering the default overlay
      setError(ev?.message || "Unknown client error");
    };
    const onRejection = (ev: PromiseRejectionEvent) => {
      ev.preventDefault();
      const msg =
        (ev?.reason && (ev.reason.message || String(ev.reason))) ||
        "Unhandled promise rejection";
      setError(msg);
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  if (!error) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[10000] rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur">
      <div className="mb-1 font-medium">Client exception</div>
      <div className="break-words whitespace-pre-wrap">{error}</div>
    </div>
  );
}
