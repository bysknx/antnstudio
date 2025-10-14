// app/data.ts
import { fetchVimeoWorks } from "@/lib/vimeo";

/**
 * Récupère les vidéos "featured" à afficher dans le Hero (Vimeo only).
 * - La lib gère la pagination en interne.
 * - Normalise en slides <iframe>.
 */
export async function featuredSlidesForHero(limit = 6) {
  const folderId = process.env.VIMEO_FOLDER_ID;
  const teamId = process.env.VIMEO_TEAM_ID;

  // fetchVimeoWorks -> { items, debug }
  const { items } = await fetchVimeoWorks({ folderId, teamId });

  // Heuristique "featured": `featuredOrder` si présent, sinon tag "featured" dans le nom.
  const featured = (items || [])
    .filter(
      (it: any) =>
        typeof it?.featuredOrder === "number" ||
        /(^|\W)featured(\W|$)/i.test(it?.title || it?.name || ""),
    )
    .sort((a: any, b: any) => {
      const ao = a?.featuredOrder ?? Number.POSITIVE_INFINITY;
      const bo = b?.featuredOrder ?? Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      const da = a?.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b?.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da; // plus récent d'abord
    })
    .slice(0, limit);

  // Normalisation → slides "embed" pour HeroPlayer
  return featured.map((it: any) => ({
    type: "embed" as const,
    src:
      it?.embed && it.embed.includes("player.vimeo.com")
        ? `${it.embed}&autoplay=1&muted=1&playsinline=1&controls=0&pip=1&transparent=0`
        : `https://player.vimeo.com/video/${it.id}?autoplay=1&muted=1&playsinline=1&controls=0&pip=1&transparent=0`,
    alt: it?.title ?? it?.name ?? "Untitled",
    durationMs: Math.max(5000, (it?.duration ?? 15) * 1000),
  }));
}
