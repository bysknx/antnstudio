// START PATCH
import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="shell stack-16 py-14 md:py-20 relative">
      <section className="grid md:grid-cols-2 gap-10 items-start">
        {/* Forme à gauche — inchangé si tu as déjà ton composant */}
        <div className="glass-panel p-5 md:p-6">
          {/* ... ton formulaire existant ... */}
        </div>

        {/* About à droite */}
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-semibold">About.</h2>

          <div className="text-[15px] md:text-[17px] leading-[1.75] text-zinc-200 [text-align:justify] [text-justify:inter-word] space-y-4">
            <p>
              « <strong>antn.studio</strong> » founded by <strong>Anthony</strong>, an independent{" "}
              <strong>director</strong> and <strong>project lead</strong> from Paris.
            </p>
            <p>
              Blending <strong>precision</strong> with <strong>emotion</strong>, the studio crafts{" "}
              <strong>cinematic visuals</strong>, brand films, and digital experiences with a{" "}
              <strong>strong narrative core</strong>.
            </p>
            <p>
              Each project is shaped with <strong>technical mastery</strong>, and driven by a search for{" "}
              <strong>authenticity</strong> and <strong>impact</strong>.
            </p>
            <p>
              <em>Sensory, intentional, timeless</em> — <strong>antn.studio</strong> turns ideas into living imagery.
            </p>
          </div>

          {/* CTA + email alignés en hauteur */}
          <div className="flex flex-wrap items-stretch gap-3 pt-2">
            <div className="uppercase font-semibold tracking-wide text-[12px] md:text-[13px] text-zinc-100
                            grid place-items-center px-4 rounded-lg ring-1 ring-white/10 bg-zinc-900/60">
              Let’s connect :
            </div>
            <Link
              href="mailto:anthony@antn.studio"
              className="grid place-items-center rounded-lg px-4 h-10 md:h-11 bg-zinc-800/70 hover:bg-zinc-800
                         text-zinc-100 font-medium ring-1 ring-white/10"
            >
              anthony@antn.studio
            </Link>
          </div>
        </div>
      </section>

      {/* Expériences — plus espacées + hover subtil */}
      <section className="pt-10">
        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {/* Exemple de carte ; duplique/branche sur tes données */}
          <article className="group rounded-2xl border border-white/10 bg-zinc-900/40 p-4 md:p-5
                              hover:bg-zinc-900/60 hover:-translate-y-[1px] transition-all">
            <div className="text-xs text-zinc-400">antn.studio — 2019 → Present</div>
            <div className="font-semibold mt-1">CEO</div>
          </article>

          <article className="group rounded-2xl border border-white/10 bg-zinc-900/40 p-4 md:p-5
                              hover:bg-zinc-900/60 hover:-translate-y-[1px] transition-all">
            <div className="text-xs text-zinc-400">Freelance @ Jellysmack — 2022 → 2023</div>
            <div className="font-semibold mt-1">Edit Supervisor</div>
          </article>

          <article className="group rounded-2xl border border-white/10 bg-zinc-900/40 p-4 md:p-5
                              hover:bg-zinc-900/60 hover:-translate-y-[1px] transition-all">
            <div className="text-xs text-zinc-400">Freelance — 2023 → 2025</div>
            <div className="font-semibold mt-1">International Project Manager</div>
          </article>
        </div>
      </section>
    </main>
  );
}
// END PATCH
