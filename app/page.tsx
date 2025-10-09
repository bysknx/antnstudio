// app/page.tsx — Server Component (pas de "use client" ici)
import HeroPlayer from "@/components/ui/HeroPlayer";

export default async function HomePage() {
  return (
    <main className="relative">
      <HeroPlayer />
    </main>
  );
}
