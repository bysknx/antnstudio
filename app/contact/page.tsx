// app/contact/page.tsx
import { ContactForm } from "@/components/ContactForm";

export const dynamic = "force-static";

export default function ContactPage() {
  return (
    <main className="relative mx-auto max-w-[1200px] px-6 pt-28 pb-36">
      {/* assombrissement + blur subtile derrière la zone centrale */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(1100px,90vw)] h-[540px] rounded-3xl
                        bg-black/25 backdrop-blur-[2px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      </div>

      <section className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
          <h2 className="mb-4 text-lg font-semibold">Contact</h2>
          <ContactForm />
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
          <h2 className="mb-4 text-lg font-semibold">About.</h2>
          <p className="text-sm leading-relaxed [--accent:theme(colors.white)]">
            « <strong className="about-strong">antn.studio</strong> » founded by{" "}
            <strong className="about-strong">Anthony</strong>, an independent{" "}
            <strong className="about-strong">director</strong> and{" "}
            <strong className="about-strong">project lead</strong> from Paris.
            Blending <strong className="about-strong">precision</strong> with{" "}
            <strong className="about-strong">emotion</strong>, the studio crafts{" "}
            <strong className="about-strong">cinematic visuals</strong>, brand films, and digital
            experiences with a <strong className="about-strong">strong narrative core</strong>.
            Each project is shaped with <strong className="about-strong">technical mastery</strong>, and driven
            by a search for <strong className="about-strong">authenticity</strong> and{" "}
            <strong className="about-strong">impact</strong>.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <span className="text-xs tracking-widest uppercase">Let’s connect :</span>
            <a
              href="mailto:anthony@antn.studio"
              className="
                relative rounded-full px-3 py-1 text-sm font-semibold
                text-white overflow-hidden
                before:absolute before:inset-0 before:translate-x-full
                before:bg-white before:transition-transform before:duration-300
                hover:before:-translate-x-0
              "
              style={{ WebkitTextFillColor: "currentColor" }}
            >
              <span className="relative z-10 mix-blend-difference">anthony@antn.studio</span>
            </a>
          </div>
        </div>
      </section>

      {/* expériences espacées en bas */}
      <section className="relative z-10 mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* …tes 3 cartes existantes… */}
      </section>

      <style>{`
        .about-strong{ font-weight:700; transition: color .15s ease; }
        .about-strong:hover{ color: #fff; text-decoration: underline; text-decoration-thickness: 1px; }
      `}</style>
    </main>
  );
}
