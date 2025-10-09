// app/page.tsx
import HeroPlayer from "@/components/ui/HeroPlayer";

const REEL = [
  {
    type: "embed",
    src: "https://player.vimeo.com/video/1064426220?h=aa04927136&autoplay=1&muted=1&playsinline=1&pip=1&controls=0&autopause=0&badge=0&app_id=58479",
    alt: "2023_SOVA_CPaGRAVE_FULL",
    durationMs: 15000, // ← barre + auto-advance après 15 s
  },
  { type: "image", src: "/reel/frame-02.jpg", alt: "Project still", durationMs: 10000 },
  { type: "image", src: "/reel/frame-03.jpg", alt: "Project still", durationMs: 10000 },
] as const;

export default function HomePage() {
  return (
    <main className="relative">
      <HeroPlayer items={REEL as any} />
    </main>
  );
}
