// app/contact/page.tsx
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="relative min-h-[100svh]">
      {/* Voile local pour lisibilité */}
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="h-[70vh] w-[min(1100px,92vw)] rounded-[24px] bg-black/30 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-[min(1200px,94vw)] flex-col items-center justify-center gap-10">
        {/* Bloc centré : Form + About */}
        <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
          <section className="rounded-2xl border border-white/8 bg-white/3 px-6 py-6 shadow-xl shadow-black/30">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-[.12em] text-white/80">Contact</h2>
            <ContactForm />
          </section>

          <section className="rounded-2xl border border-white/8 bg-white/3 px-6 py-6 shadow-xl shadow-black/30">
            <h2 className="mb-4 text-2xl font-semibold text-white/90">About.</h2>

            <div className="space-y-3 text-[15px] leading-7 text-zinc-200 text-justify">
              <p>
                « <strong>antn.studio</strong> » founded by <strong>Anthony</strong>, an independent <strong>director</strong> and{" "}
                <strong>project lead</strong> from Paris.
              </p>
              <p>
                Blending <strong>precision</strong> with <strong>emotion</strong>, the studio crafts{" "}
                <strong>cinematic visuals</strong>, brand films, and digital experiences with a <strong>strong narrative core</strong>.
              </p>
              <p>
                Each project is shaped with <strong>technical mastery</strong>, and driven by a search for{" "}
                <strong>authenticity</strong> and <strong>impact</strong>.
              </p>
              <p>
                <em>Sensory, intentional, timeless</em> — <strong>antn.studio</strong> turns ideas into living imagery.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex h-10 items-center rounded-xl border border-white/10 px-4 text-[13px] font-semibold uppercase tracking-[.14em] text-white/80">
                Let’s connect :
              </span>

              {/* Bouton mail avec remplissage */}
              <a
                href="mailto:anthony@antn.studio"
                className="group relative inline-flex h-10 items-center overflow-hidden rounded-xl border border-white/10 px-4 font-semibold text-white/90"
              >
                <span className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
                <span className="relative">anthony@antn.studio</span>
              </a>
            </div>
          </section>
        </div>

        {/* Expériences en bas */}
        <div className="mt-2 grid w-full grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { title: "CEO", meta: "antn.studio — 2019 → Present" },
            { title: "Edit Supervisor", meta: "Freelance @ Jellysmack — 2022 → 2023" },
            { title: "International Project Manager", meta: "Freelance — 2023 → 2025" },
          ].map((x) => (
            <article
              key={x.title}
              className="group rounded-2xl border border-white/8 bg-white/3 p-5 shadow-lg shadow-black/30 transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="mb-2 text-[12px] font-medium text-white/60">{x.meta}</div>
              <div className="text-[15px] font-semibold text-white/90">{x.title}</div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
