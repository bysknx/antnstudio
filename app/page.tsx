// app/page.tsx — Server Component
import ClientHeroSection from "@/components/ClientHeroSection";

export default function HomePage() {
  return (
    <main className="relative h-[100svh] overflow-hidden">
      <ClientHeroSection />
    </main>
  );
}
