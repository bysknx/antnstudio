// app/page.tsx — SERVER COMPONENT (streaming pour premier paint plus rapide)
import { Suspense } from "react";
import { fetchVideos } from "@/lib/videos";
import { getAdminConfig } from "@/lib/admin-config";
import PreloadVideos from "@/components/PreloadVideos";
import ClientHeroSection from "@/components/ClientHeroSection";

type Item = {
  id: string;
  title: string;
  client?: string;
  createdAt: string | null;
  thumbnail?: string;
  poster?: string;
  embed?: string;
  link?: string;
  url?: string;
  year?: number | null;
};

export const dynamic = "force-dynamic";

async function HomeHero() {
  const [videos, config] = await Promise.all([fetchVideos(), getAdminConfig()]);

  const normalized: Item[] = (videos || []).map((v) => ({
    id: v.id,
    title: v.title,
    client: v.client,
    createdAt: v.year ? `${v.year}-01-01T00:00:00.000Z` : null,
    thumbnail: "",
    poster: "",
    embed: v.url,
    link: v.url,
    url: v.url,
    year: v.year,
  }));

  const byId = new Map(normalized.map((v) => [v.id, v]));

  const useFeaturedOverride = config.hasFeaturedOverride;
  const featuredIds = Array.isArray(config.featuredIds)
    ? config.featuredIds
    : [];

  let latest: Item[];
  if (useFeaturedOverride) {
    const featured = featuredIds
      .map((id) => byId.get(id))
      .filter(Boolean) as Item[];

    if (featured.length > 0) {
      latest = featured;
    } else {
      // Fallback : aucune sélection manuelle → dernières vidéos par date
      latest = [...normalized]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        )
        .slice(0, 5);
    }
  } else {
    latest = [...normalized]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime(),
      )
      .slice(0, 5);
  }

  return (
    <>
      <Suspense fallback={null}>
        <PreloadVideos />
      </Suspense>
      <ClientHeroSection items={latest} />
    </>
  );
}

function HomeHeroFallback() {
  return <div className="relative min-h-[80svh]" aria-hidden />;
}

export default function HomePage() {
  return (
    <main className="relative min-h-[100svh]">
      <Suspense fallback={<HomeHeroFallback />}>
        <HomeHero />
      </Suspense>
    </main>
  );
}
