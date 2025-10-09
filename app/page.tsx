// app/page.tsx — Server Component (pas de "use client" ici)
import HeroPlayer from "@/components/ui/HeroPlayer";
import { featuredSlidesForHero } from "@/app/data";

// Fallback local au cas où aucun projet "featured" n'est trouvé
const FALLBACK = [
  {
    type: "vimeo",
    src: "https://player.vimeo.com/video/1064426220?h=aa04927136&autoplay=1&muted=1&playsinline=1&pip=1&controls=0&autopause=0&badge=0&app_id=58479",
    // on simule 15s d’affichage avant d’avancer
    durationMs: 15_000,
  },
  { type: "image", src: "/reel/frame-02.jpg", alt: "Project still", durationMs: 10_000 },
  { type: "image", src: "/reel/frame-03.jpg", alt: "Project still", durationMs: 10_000 },
] as const;

export default function HomePage() {
  // Slides issus des projets "featured" (image | video | vimeo)
  const items = featuredSlidesForHero(6);
  const data = items.length ? (items as any) : (FALLBACK as any);

  return (
    <main className="relative">
      <HeroPlayer items={data} />
    </main>
  );
}
