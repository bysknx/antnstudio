"use client";

import { useEffect, useMemo, useState } from "react";
import FullBleedPlayer from "@/components/ui/FullBleedPlayer";
import ProjectsGrid from "@/components/projects/ProjectsGrid";

export type VideoItem = {
  id: string;
  title?: string;
  name?: string;
  thumbnail?: string;
  picture?: string;
  thumb?: string;
  poster?: string;
  link?: string;
  embed?: string;
  src?: string;
  videoSrc?: string;
  year?: number;
  createdAt?: string;
  created_time?: string;
};

type Props = {
  initialItems?: VideoItem[];
};

function normalize(it: VideoItem): VideoItem {
  const title = it.title || it.name || "Untitled";
  const year =
    it.year ??
    (it.createdAt ? new Date(it.createdAt).getFullYear() : undefined) ??
    (it.created_time ? new Date(it.created_time).getFullYear() : undefined);
  return { ...it, title, year };
}

export default function ProjectsClient({ initialItems }: Props) {
  const [projects, setProjects] = useState<VideoItem[]>(() =>
    (initialItems ?? []).map(normalize),
  );

  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<VideoItem | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overscrollBehaviorY;
    const prevBody = body.style.overscrollBehaviorY;
    html.style.overscrollBehaviorY = "none";
    body.style.overscrollBehaviorY = "none";
    return () => {
      html.style.overscrollBehaviorY = prevHtml;
      body.style.overscrollBehaviorY = prevBody;
    };
  }, []);

  const handleOpenVideo = (item: VideoItem) => {
    setCurrent(item);
    setOpen(true);
  };

  const itemsWithImage = useMemo(
    () =>
      projects?.filter(
        (p) => p.poster || p.thumbnail || p.picture || p.thumb,
      ) ?? [],
    [projects],
  );

  return (
    <div className="fixed inset-0 overflow-hidden">
      {console.log("[ProjectsClient]", {
        projectsLen: projects?.length,
        itemsWithImageLen: itemsWithImage.length,
        sample: projects?.[0],
      })}
      <ProjectsGrid items={itemsWithImage} onOpenVideo={handleOpenVideo} />
      <FullBleedPlayer
        open={open}
        onClose={() => setOpen(false)}
        title={current?.title || current?.name}
        year={current?.year}
        poster={
          current?.poster ||
          current?.thumbnail ||
          current?.picture ||
          current?.thumb
        }
        embed={current?.embed || current?.src || current?.videoSrc}
      />
    </div>
  );
}
