// app/page.tsx — Server Component (pas de "use client" ici)
import HeroPlayer from "@/components/ui/HeroPlayer";
import { featuredSlidesForHero } from "@/app/data";

// Fallback local si aucun "featured" n'est trouvé ou si Vimeo plante
const FALLBACK = [
  {
    type: "embed" as const, // ← on normalise déjà en "embed"
    src: "https://player.vimeo.com/video/1064426220?h=aa04927136&autoplay=1&muted=1&playsinline=1&pip=1&controls=0&autopause=0&badge=0&app_id=58479&background=1&dnt=1",
    alt: "ANTN — Showreel",
    durationMs: 15_000,
  },
  { type: "image" as const, src: "/reel/frame-02.jpg", alt: "Project still", durationMs: 10_000 },
  { type: "image" as const, src: "/reel/frame-03.jpg", alt: "Project still", durationMs: 10_000 },
];

/**
 * Normalise toute slide potentielle vers le contrat attendu par HeroPlayer
 * - vimeo → embed (iframe)
 * - garde image / video telles quelles
 */
function normalizeForHero(
  items: Array<{ type: string; src: string; alt?: string; durationMs?: number }>
) {
  return (items || []).map((it) => {
    if (it.type === "vimeo") {
      return {
        type: "embed" as const,
        src: it.src,
        alt: it.alt,
        durationMs: it.durationMs ?? 15_000,
      };
    }
    // image | video | embed passent tels quels
    return it as { type: "image" | "video" | "embed"; src: string; alt?: string; durationMs?: number };
  });
}

export default async function HomePage() {
  let remote: any[] = [];
  try {
    // Slides issus des projets "featured" (déjà normalisés en "embed" côté app/data.ts)
    remote = await featuredSlidesForHero(6);
  } catch {
    // en cas d’erreur réseau/API, on tombera sur le fallback
  }

  const data = normalizeForHero(remote.length ? remote : FALLBACK);

  return (
    <main className="relative">
      <HeroPlayer items={data.items} />
    </main>
  );
}
