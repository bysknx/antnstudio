import ContactForm from "@/components/ContactForm";

export const dynamic = "force-static";

export default function ContactPage() {
  return (
    <main className="relative min-h-[100svh]">
      {/* zone lisible : blur + assombrissement progressif mais on garde la matrice */}
      <div
        className="
          pointer-events-none absolute inset-0 z-0
          [mask-image:radial-gradient(ellipse_at_center,rgba(0,0,0,1),rgba(0,0,0,.65)60%,rgba(0,0,0,0)85%)]
          bg-black/25
          backdrop-blur-[2px]
        "
      />

      <section
        className="
          relative z-10 mx-auto grid min-h-[100svh] max-w-6xl grid-cols-1 items-center gap-10 px-6
          py-24 md:grid-cols-2
        "
      >
        {/* formulaire */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-[0_0_0_1px_rgba(255,255,255,.04)]">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-white">Contact</h2>
          <ContactForm />
          <p className="mt-4 text-xs text-white/60">
            *Temporaire : on branchera un mailto ou Formspree/Resend.
          </p>
        </div>

        {/* about + CTA mail */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-[0_0_0_1px_rgba(255,255,255,.04)]">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-white">About.</h2>
          <div className="space-y-4 text-[14px] leading-relaxed text-zinc-200">
            <p>
              « <strong>antn.studio</strong> » founded by <strong>Anthony</strong>, an independent director and project
              lead from Paris.
            </p>
            <p>
              Blending precision with emotion, the studio crafts <strong>cinematic visuals</strong>, brand films, and
              digital experiences with a <strong>strong narrative core</strong>.
            </p>
            <p>
              Each project is shaped with <strong>technical mastery</strong>, and driven by a search for{" "}
              <strong>authenticity</strong> and <strong>impact</strong>.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-sm font-semibold text-zinc-300">LET’S CONNECT :</span>

            {/* mail pill : remplissage blanc de gauche→droite en hover */}
            <a
              href="mailto:anthony@antn.studio"
              className="
                relative overflow-hidden rounded-full border border-white/10 px-4 py-2 text-sm font-semibold
                text-white transition-colors
                before:absolute before:inset-0 before:-z-[1] before:translate-x-[-100%] before:bg-white
                before:transition-transform before:duration-300 hover:text-black hover:before:translate-x-0
              "
            >
              anthony@antn.studio
            </a>
          </div>
        </div>

        {/* expériences : sous la fold, espacées et hover subtil */}
        <div className="col-span-full mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          {[
            {
              k: 1,
              pre: "antn.studio — 2019 → Present",
              title: "CEO",
            },
            {
              k: 2,
              pre: "Freelance @ Jellysmack — 2022 → 2023",
              title: "Edit Supervisor",
            },
            {
              k: 3,
              pre: "Freelance — 2023 → 2025",
              title: "International Project Manager",
            },
          ].map((c) => (
            <div
              key={c.k}
              className="
                group rounded-2xl border border-white/10 bg-black/30 p-5
                shadow-[0_0_0_1px_rgba(255,255,255,.04)]
                transition-all hover:-translate-y-[2px] hover:bg-white/6
              "
            >
              <div className="text-xs text-zinc-400">{c.pre}</div>
              <div className="mt-2 text-[13px] font-semibold text-white">{c.title}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
