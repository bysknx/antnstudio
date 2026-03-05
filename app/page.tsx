// app/page.tsx — SERVER COMPONENT
import { Suspense } from "react";
import { fetchVideos } from "@/lib/videos";
import { getAdminConfig } from "@/lib/admin-config";
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
  const [videos, config] = await Promise.all([fetchVideos(), getAdminConfig()]);

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

  const byId = new Map(normalized.map((v) => [v.id, v]));

  // Featured :
  // - si l’admin a défini un ordre (même vide), on le respecte
  // - sinon, fallback sur les 5 plus récents
  const useFeaturedOverride = config.hasFeaturedOverride;
  const latest = useFeaturedOverride
    ? (config.featuredIds || [])
        .map((id) => byId.get(id))
        .filter(Boolean) as Item[]
    : normalized
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
