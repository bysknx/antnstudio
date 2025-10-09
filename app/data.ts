// app/data.ts
import { fetchVimeoWorks } from "@/lib/vimeo";

/**
 * Retourne des slides compatibles avec HeroPlayer (type: "embed").
 * - Priorité aux items avec `featuredOrder`
 * - Fallback sur les plus récents
 * - Ajoute les bons params d’auto-play Vimeo
 */
export async function featuredSlidesForHero(limit = 6) {
  const folderId = process.env.VIMEO_FOLDER_ID;
  const items = await fetchVimeoWorks({ folderId, perPage: 200 });

  const featured = items
    .filter((it: any) => typeof it.featuredOrder === "number")
    .sort((a: any, b: any) => a.featuredOrder - b.featuredOrder)
    .slice(0, limit);

  const base = featured.length ? featured : items.slice(0, limit);

  const withAutoplayParams = (url: string) => {
    // On force un embed “background” Vimeo muet qui démarre tout seul
    const u = new URL(url);
    // Valeurs sûres pour éviter les blocages d’autoplay
    u.searchParams.set("autoplay", "1");
    u.searchParams.set("muted", "1");
    u.searchParams.set("background", "1");
    u.searchParams.set("controls", "0");
    u.searchParams.set("dnt", "1");
    return u.toString();
  };

  return base.map((it: any) => ({
    type: "embed" as const,                      // ← correspond déjà à ton HeroPlayer
    src: withAutoplayParams(it.embedUrl),        // ← iframe Vimeo prêt à l’emploi
    alt: it.title || it.name,
    durationMs: it.duration
      ? Math.max(5000, Math.min(30_000, it.duration * 1000))
      : 15_000,                                  // défaut 15s
  }));
}
