import { ContactForm } from "@/components/ContactForm";

const EXPERIENCES = [
  { title: "CEO", company: "Reglazed Studio", dates: "2024 – Présent", type: "" },
  { title: "Design Engineer", company: "Freelance", dates: "2022 – 2024", type: "" },
  { title: "Front-end Developer", company: "Freelance", dates: "2017 – Présent", type: "" },
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
            <p className="text-[15px] leading-relaxed text-zinc-400 max-w-lg">
              Interfaces minimalistes, rapides et bien produites. Direction artistique claire,
              exécution propre. Basé en France. Dispo en remote.
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
        <h3 className="sr-only">Expériences</h3>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
          {EXPERIENCES.map((exp) => (
            <li key={`${exp.company}-${exp.title}`} className="glass-panel rounded-2xl p-4 w-full max-w-sm">
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
