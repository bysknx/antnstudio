import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="relative min-h-[100svh]">
      <section className="mx-auto w-full max-w-[1200px] px-6 sm:px-8 pt-10 pb-24">
        {/* Grille : formulaire à gauche / about à droite */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Formulaire (restauré) */}
          <div className="glass-panel p-5 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold tracking-wide">Contact</h2>
            <ContactForm />
          </div>

          {/* About — justifié + gras sur mots clés */}
          <article>
            <h2 className="mb-4 text-xl font-semibold">About.</h2>

            <div className="text-[15px] leading-relaxed text-zinc-200/90 [text-align:justify]">
              <p className="mb-3">
                « <span className="font-semibold">antn.studio</span> » founded by{" "}
                <span className="font-semibold">Anthony</span>, an independent{" "}
                <span className="font-semibold">director</span> and{" "}
                <span className="font-semibold">project lead</span> from Paris.
              </p>
              <p className="mb-3">
                Blending <span className="font-semibold">precision</span> with{" "}
                <span className="font-semibold">emotion</span>, the studio crafts{" "}
                <span className="font-semibold">cinematic visuals</span>, brand films,
                and digital experiences with a{" "}
                <span className="font-semibold">strong narrative core</span>.
              </p>
              <p className="mb-3">
                Each project is shaped with{" "}
                <span className="font-semibold">technical mastery</span>, and driven by
                a search for <span className="font-semibold">authenticity</span> and{" "}
                <span className="font-semibold">impact</span>.
              </p>
              <p className="mb-6">
                <em>Sensory, intentional, timeless</em> —{" "}
                <span className="font-semibold">antn.studio</span> turns ideas into
                living imagery.
              </p>
            </div>

            {/* CTA aligné et centré verticalement avec le bouton email */}
            <div className="mt-4 flex flex-wrap items-stretch gap-3">
              <div className="flex items-center">
                <span className="inline-flex h-10 items-center rounded-md border border-white/15 px-4 text-xs font-semibold tracking-widest uppercase">
                  Let’s connect :
                </span>
              </div>
              <a
                href="mailto:anthony@antn.studio"
                className="inline-flex h-10 items-center rounded-md bg-white/10 px-4 text-sm font-medium text-white border border-white/15 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                anthony@antn.studio
              </a>
            </div>
          </article>
        </div>

        {/* Expériences : plus espacées + hover subtil */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 transition
                          hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="text-xs text-zinc-400 mb-2">antn.studio — 2019 → Present</div>
            <div className="font-semibold">CEO</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 transition
                          hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="text-xs text-zinc-400 mb-2">Freelance @ Jellysmack — 2022 → 2023</div>
            <div className="font-semibold">Edit Supervisor</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 transition
                          hover:translate-y-[-1px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <div className="text-xs text-zinc-400 mb-2">Freelance — 2023 → 2025</div>
            <div className="font-semibold">International Project Manager</div>
          </div>
        </div>
      </section>
    </main>
  );
}
