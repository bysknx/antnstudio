// app/page.tsx — SERVER COMPONENT
import { Suspense } from "react";
import { fetchVimeoWorks } from "@/lib/vimeo";
import { parseVimeoTitle } from "@/lib/parseVimeoTitle";
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
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Appel direct à la lib serveur (pas de fetch HTTP côté serveur)
  const { items } = await fetchVimeoWorks({});

  const normalized: Item[] = (items || []).map((it: any) => {
    const parsed = parseVimeoTitle(it?.title ?? "");
    const display = parsed?.title
      ? parsed.client
        ? `${parsed.client} — ${parsed.title}`
        : parsed.title
      : (it?.title ?? "Untitled");

    return {
      id: String(it.id),
      title: display,
      createdAt: it.createdAt ?? null,
      thumbnail: it.thumbnail ?? it.poster ?? "",
      poster: it.thumbnail ?? it.poster ?? "",
      embed: it.embed ?? "",
      link: it.link ?? "",
    };
  });

  // derniers 5 par date
  const latest = normalized
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime(),
    )
    .slice(0, 5);

  return (
    <main className="relative min-h-[100svh]">
      {/* Préchargement de /api/vimeo en fond pour accélérer /projects */}
      <Suspense fallback={null}>
        <PreloadVimeo />
      </Suspense>

      {/* Section interactive (player, vignettes) – composant client */}
      <ClientHeroSection items={latest} />
    </main>
  );
}
