// app/page.tsx — SERVER COMPONENT
import { Suspense } from "react";
import { fetchVideos } from "@/lib/videos";
import PreloadVimeo from "@/components/PreloadVimeo";
import ClientHeroSection from "@/components/ClientHeroSection";

type Item = {
  id: string;
  title: string;
  createdAt: string | null;
  thumbnail?: string;
  poster?: string;
  embed?: string;
  link?: string;
  url?: string;
  year?: number | null;
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Lecture du manifest local côté serveur
  const videos = await fetchVideos();

  const normalized: Item[] = (videos || []).map((v) => ({
    id: v.id,
    title: v.title,
    createdAt: v.year ? `${v.year}-01-01T00:00:00.000Z` : null,
    thumbnail: "",
    poster: "",
    embed: v.url,
    link: v.url,
    url: v.url,
    year: v.year,
  }));

  // Les 5 plus récents (par année, puis par ordre)
  const latest = normalized
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 5);

  return (
    <main className="relative min-h-[100svh]">
      {/* Préchargement du manifest en fond pour accélérer /projects */}
      <Suspense fallback={null}>
        <PreloadVimeo />
      </Suspense>

      {/* Section interactive (player, vignettes) – composant client */}
      <ClientHeroSection items={latest} />
    </main>
  );
}
