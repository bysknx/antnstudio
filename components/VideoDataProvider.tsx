"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { VideoItem as ApiVideoItem } from "@/lib/videos";
import type { VideoItem as ProjectsVideoItem } from "@/app/(site)/projects/ProjectsClient";

type Status = "idle" | "loading" | "ready" | "error";

type VideoDataContextValue = {
  items: ProjectsVideoItem[] | null;
  status: Status;
};

const VideoDataContext = createContext<VideoDataContextValue | undefined>(
  undefined,
);

function normalizeToProjectsItem(v: ApiVideoItem): ProjectsVideoItem {
  const year = v.year ?? null;
  return {
    id: v.id,
    title: v.title,
    createdAt: year ? `${year}-01-01T00:00:00.000Z` : undefined,
    thumbnail: v.thumbnail ?? "",
    embed: v.url,
    link: v.url,
    // @ts-expect-error url is not in ProjectsVideoItem but kept for backward compat
    url: v.url,
    year: year ?? undefined,
  };
}

export function useVideoData(): VideoDataContextValue {
  const ctx = useContext(VideoDataContext);
  if (!ctx) {
    return { items: null, status: "idle" };
  }
  return ctx;
}

export function VideoDataProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ProjectsVideoItem[] | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (ignore) return;
      setStatus("loading");

      try {
        let fromStorage: unknown = null;
        if (typeof window !== "undefined") {
          const raw = window.sessionStorage.getItem("__VIDEO_PREFETCH");
          if (raw) {
            try {
              fromStorage = JSON.parse(raw);
            } catch {
              fromStorage = null;
            }
          }
        }

        let list: ApiVideoItem[] | null = null;

        if (
          fromStorage &&
          typeof fromStorage === "object" &&
          Array.isArray((fromStorage as { items?: unknown }).items)
        ) {
          list = (fromStorage as { items: ApiVideoItem[] }).items;
        } else {
          const res = await fetch("/api/videos", { cache: "no-store" });
          const json = (await res.json()) as { items?: ApiVideoItem[] };
          list = Array.isArray(json.items) ? json.items : [];
          if (typeof window !== "undefined") {
            try {
              window.sessionStorage.setItem(
                "__VIDEO_PREFETCH",
                JSON.stringify(json || {}),
              );
            } catch {
              // ignore
            }
          }
        }

        if (ignore) return;

        const normalized = (list ?? []).map(normalizeToProjectsItem);
        setItems(normalized);
        setStatus("ready");
      } catch {
        if (ignore) return;
        setStatus("error");
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <VideoDataContext.Provider value={{ items, status }}>
      {children}
    </VideoDataContext.Provider>
  );
}
