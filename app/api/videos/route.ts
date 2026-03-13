// app/api/videos/route.ts
// Sert le manifest vidéo (public/videos/manifest.json) au format attendu par le front
import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export const revalidate = 0;

export async function GET() {
  try {
    const manifestPath = join(
      process.cwd(),
      "public",
      "videos",
      "manifest.json",
    );
    const raw = await readFile(manifestPath, "utf-8");
    const videos = JSON.parse(raw);
    console.log(
      "[/api/videos] raw videos",
      Array.isArray(videos) ? videos.length : "not-array",
    );

    const mediaUrl =
      process.env.NEXT_PUBLIC_MEDIA_URL || "https://media.antn.studio";

    const items = videos.map(
      (v: {
        id: string;
        title: string;
        client: string;
        year: number | null;
        filename: string;
        url: string;
        duration: number | null;
      }) => {
        const url = v.url || `${mediaUrl}/${v.filename}`;
        const displayTitle = v.client ? `${v.client} — ${v.title}` : v.title;

        return {
          id: v.id,
          title: displayTitle,
          client: v.client,
          year: v.year,
          filename: v.filename,
          url,
          embed: url,
          link: url,
          duration: v.duration,
          createdAt: v.year ? `${v.year}-01-01T00:00:00.000Z` : null,
          thumbnail: null,
        };
      },
    );
    console.log("[/api/videos] items", items.length);

    return NextResponse.json({ items });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "manifest fetch failed";
    console.error("[/api/videos] error", message);
    return NextResponse.json({ items: [], error: message }, { status: 500 });
  }
}
