import { ContactForm } from "@/components/ContactForm";

/* === Petit helper pour mots “réactifs” au hover (souligné fluide + léger glow) === */
function HoverWord({ children }: { children: React.ReactNode }) {
  return (
    <span className="group relative inline-block cursor-default transition-transform duration-200 hover:-translate-y-[1px]">
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 -bottom-0.5 h-[1.5px] origin-left scale-x-0 bg-white/80 transition-transform duration-200 ease-out group-hover:scale-x-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-1 h-2 rounded-full bg-white/10 opacity-0 blur-[2px] transition-opacity duration-200 group-hover:opacity-100"
      />
    </span>
  );
}

/* === Tes vraies expériences === */
const EXPERIENCES = [
  { title: "CEO", company: "antn.studio", dates: "2019 – Present", type: "" },
  { title: "Edit Supervisor", company: "Freelance @ Jellysmack", dates: "2022 – 2023", type: "" },
  { title: "International Project Manager", company: "Freelance", dates: "2023 – 2025", type: "" },
];

export default function ContactPage() {
  return (
    <main className="relative container mx-auto px-6 py-24 flex flex-col justify-between min-h-[100svh]">
      {/* Section principale : centrée verticalement */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-12 flex-grow">
        {/* ===== FORMULAIRE ===== */}
        <div className="w-full max-w-md flex-shrink-0">
          <ContactForm className="glass-panel" />
        </div>

        {/* ===== ABOUT + MAIL ===== */}
        <section className="w-full lg:w-1/2 space-y-6 text-left">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">About</h2>

            <p className="text-[15px] leading-relaxed text-zinc-300/90 max-w-xl">
              <strong className="font-semibold">« antn.studio »</strong> founded by Anthony, an independent director and
              project lead from <HoverWord>Paris</HoverWord>. Blending <HoverWord>precision</HoverWord> with{" "}
              <HoverWord>emotion</HoverWord>, the studio crafts <HoverWord>cinematic visuals</HoverWord>,{" "}
              <HoverWord>brand films</HoverWord>, and <HoverWord>digital experiences</HoverWord> with a strong{" "}
              <HoverWord>narrative core</HoverWord>. Each project is shaped with <HoverWord>technical mastery</HoverWord>,
              and driven by a search for <HoverWord>authenticity</HoverWord> and <HoverWord>impact</HoverWord>.
            </p>

            <p className="mt-3 text-[15px] leading-relaxed text-zinc-300/90 max-w-xl">
              <HoverWord>Sensory</HoverWord>, <HoverWord>intentional</HoverWord>, <HoverWord>timeless</HoverWord> — antn.studio
              turns ideas into <HoverWord>living imagery</HoverWord>.
            </p>
          </div>

          {/* Sous-bloc contact */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <span className="text-sm text-zinc-400">Contact me :</span>

            <a
              href="mailto:anthony@antn.studio"
              className="group relative inline-flex items-center overflow-hidden rounded-md border border-white/10 bg-zinc-900/40 px-5 py-2.5 text-sm font-medium text-zinc-100 backdrop-blur transition-colors"
            >
              <span className="relative z-10 transition-colors duration-300 group-hover:text-zinc-900">
                anthony@antn.studio
              </span>
              <span
                aria-hidden
                className="absolute inset-0 -z-0 translate-x-[-101%] bg-white transition-transform duration-300 ease-out group-hover:translate-x-0"
              />
            </a>
          </div>
        </section>
      </div>

      {/* ===== EXPÉRIENCES ===== */}
      <section className="mt-24">
        <h3 className="sr-only">Experiences</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
          {EXPERIENCES.map((exp) => (
            <li
              key={`${exp.company}-${exp.title}`}
              className="glass-panel rounded-2xl p-4 w-full max-w-sm"
            >
              <div className="mb-1 flex items-center justify-between text-xs text-zinc-400">
                <span>{exp.company}</span>
                <span>{exp.dates}</span>
              </div>
              <div className="text-sm text-zinc-200">{exp.title}</div>
              {exp.type ? <div className="mt-1 text-xs text-zinc-500">{exp.type}</div> : null}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
