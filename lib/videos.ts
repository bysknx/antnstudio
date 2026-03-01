// lib/videos.ts
// Source locale - remplace Vimeo

export interface VideoItem {
  id: string;
  title: string;
  client: string;
  year: number | null;
  filename: string;
  url: string;
  duration: number | null;
  // Champs compatibles avec l'ancien format Vimeo (pour ProjectsClient, etc.)
  embed?: string;
  thumbnail?: string;
  link?: string;
  createdAt?: string;
}

export async function fetchVideos(): Promise<VideoItem[]> {
  const baseUrl =
    process.env.NEXT_PUBLIC_MEDIA_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://antn.studio";

  // En Server Component, lire le manifest depuis le filesystem public
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const manifestPath = path.join(process.cwd(), "public", "videos", "manifest.json");
    const raw = await fs.readFile(manifestPath, "utf-8");
    const data: VideoItem[] = JSON.parse(raw);
    return data.map(normalizeVideo);
  } catch {
    // Fallback: fetch HTTP (client-side ou erreur FS)
    const res = await fetch(`${baseUrl}/videos/manifest.json`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data: VideoItem[] = await res.json();
    return data.map(normalizeVideo);
  }
}

function normalizeVideo(v: VideoItem): VideoItem {
  const mediaUrl =
    process.env.NEXT_PUBLIC_MEDIA_URL || "https://media.antn.studio";

  const url = v.url || `${mediaUrl}/${v.filename}`;
  const displayTitle = v.client ? `${v.client} — ${v.title}` : v.title;

  return {
    ...v,
    url,
    title: displayTitle,
    // Champs compat Vimeo
    embed: url,
    link: url,
    thumbnail: undefined,
    createdAt: v.year ? `${v.year}-01-01T00:00:00.000Z` : undefined,
  };
}
