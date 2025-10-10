// START PATCH
// app/page.tsx — Server Component (pas de "use client" ici)
import ClientHeroSection from "@/components/ClientHeroSection";

export default function HomePage() {
  return (
    <main className="relative">
      <ClientHeroSection />
    </main>
  );
}
// END PATCH
