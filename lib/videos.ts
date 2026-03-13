// lib/videos.ts — source vidéos : manifest local (public/videos/manifest.json)

import { cache } from "react";
import rawManifest from "@/public/videos/manifest.json";

export interface VideoItem {
  id: string;
  title: string;
  client: string;
  year: number | null;
  filename: string;
  url: string;
  duration: number | null;
  embed?: string;
  thumbnail?: string;
  link?: string;
  createdAt?: string;
}

const MEDIA_URL =
  process.env.NEXT_PUBLIC_MEDIA_URL ?? "https://media.antn.studio";

function normalizeVideo(v: VideoItem): VideoItem {
  const url = v.url?.startsWith("http") ? v.url : `${MEDIA_URL}/${v.filename}`;
  const thumbFilename = v.filename.replace(".mp4", ".jpg");
  // Thumbnails served from Vercel (same domain) to avoid cross-origin blocking
  const thumbnail = v.thumbnail?.startsWith("/")
    ? v.thumbnail
    : `/thumbs/${thumbFilename}`;
  const displayTitle = v.client ? `${v.client} — ${v.title}` : v.title;
  return {
    ...v,
    url,
    title: displayTitle,
    embed: url,
    link: url,
    thumbnail,
    createdAt: v.year ? `${v.year}-01-01T00:00:00.000Z` : undefined,
  };
}

async function fetchVideosUncached(): Promise<VideoItem[]> {
  const data = rawManifest as VideoItem[];
  console.log(
    "[fetchVideosUncached] manifest count",
    Array.isArray(data) ? data.length : "not-array",
  );
  const normalized = data.map(normalizeVideo);
  console.log("[fetchVideosUncached] after normalize", normalized.length);
  return normalized;
}

/** Dedupe par requête pour accélérer home + projects */
export const fetchVideos = cache(fetchVideosUncached);
