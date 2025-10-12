import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="relative min-h-[100svh]">
      {/* panneau sombre pour améliorer la lisibilité */}
      <div className="pointer-events-none absolute left-1/2 top-[35svh] -translate-x-1/2 w-[min(1100px,92vw)] h-[430px] rounded-2xl bg-black/40 backdrop-blur-lg border border-white/10" />

      <section className="relative z-10 mx-auto w-[min(1100px,92vw)] pt-[10svh] pb-[12svh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* Form */}
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4">Contact</h2>
            <ContactForm />
          </div>

          {/* About + CTA */}
          <div className="pt-2">
            <h2 className="text-xl font-semibold mb-4">About.</h2>
            <div className="prose prose-invert max-w-none text-justify">
              <p>
                « <strong>antn.studio</strong> » founded by <strong>Anthony</strong>, an independent <strong>director</strong> and <strong>project lead</strong> from Paris.
              </p>
              <p>
                Blending <strong>precision</strong> with <strong>emotion</strong>, the studio crafts <strong>cinematic visuals</strong>, brand films, and digital experiences with a <strong>strong narrative core</strong>.
              </p>
              <p>
                Each project is shaped with <strong>technical mastery</strong>, and driven by a search for <strong>authenticity</strong> and <strong>impact</strong>.
              </p>
              <p>
                Sensory, intentional, timeless — <strong>antn.studio</strong> turns ideas into living imagery.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="mailto:anthony@antn.studio"
                className="h-10 inline-flex items-center rounded-xl px-4 border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                Let’s connect :
              </a>
              <a
                href="mailto:anthony@antn.studio"
                className="h-10 inline-flex items-center rounded-xl px-4 border border-white/15 bg-white/10 hover:bg-white/15 transition"
              >
                anthony@antn.studio
              </a>
            </div>
          </div>
        </div>

        {/* expériences */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "CEO", meta: "antn.studio — 2019 → Present" },
            { title: "Edit Supervisor", meta: "Freelance @ Jellysmack — 2022 → 2023" },
            { title: "International Project Manager", meta: "Freelance — 2023 → 2025" },
          ].map((b, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition shadow-sm p-5"
            >
              <div className="text-xs text-zinc-400 mb-2">{b.meta}</div>
              <div className="font-semibold">{b.title}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
