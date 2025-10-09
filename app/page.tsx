// app/page.tsx — Server Component (pas de "use client" ici)
import HeroPlayer from "@/components/ui/HeroPlayer";

const REEL = [
  { type: "video", src: "/reel/clip-01.mp4" },
  { type: "image", src: "/reel/frame-02.jpg", alt: "Project still", durationMs: 10_000 },
  { type: "image", src: "/reel/frame-03.jpg", alt: "Project still", durationMs: 10_000 },
] as const;

export default function HomePage() {
  return (
    <main className="relative">
      <HeroPlayer items={REEL as any} />
    </main>
  );
}
