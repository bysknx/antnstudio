// lib/videos.ts — remplace Vimeo, source locale

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
  const url = v.url?.startsWith("http")
    ? v.url
    : `${MEDIA_URL}/${v.filename}`;
  const thumbFilename = v.filename.replace(".mp4", ".jpg");
  const thumbnail = v.thumbnail?.startsWith("http")
    ? v.thumbnail
    : `${MEDIA_URL}/thumbs/${thumbFilename}`;
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

export async function fetchVideos(): Promise<VideoItem[]> {
  const data = rawManifest as VideoItem[];
  return data.map(normalizeVideo);
}
