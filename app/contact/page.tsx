// app/contact/page.tsx — About / Contact, style ORAGE (console, grille, blocs [ SECTION ])
import type { ReactNode } from "react";
import Link from "next/link";

function HoverWord({ children }: { children: ReactNode }) {
  return (
    <span className="group relative inline-block cursor-default transition-transform duration-200 hover:-translate-y-[1px]">
      <span className="relative z-10 italic">{children}</span>
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 right-0 -bottom-0.5 h-[1.5px] origin-left scale-x-0 bg-white/80 transition-transform duration-200 ease-out group-hover:scale-x-100"
      />
    </span>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-l border-white/20 pl-3 py-1">
      <div className="text-white/45 text-xs font-mono tracking-widest uppercase mb-1.5">
        [ {label}
      </div>
      <div className="text-zinc-200 text-sm font-mono leading-relaxed">
        {children}
      </div>
    </div>
  );
}

const EXPERIENCES = [
  { title: "CEO", company: "antn.studio", dates: "2019 - Present" },
  { title: "Edit Supervisor", company: "Freelance @ Jellysmack", dates: "2022 - 2023" },
  { title: "International Project Manager", company: "Freelance", dates: "2023 - 2025" },
];

export default function ContactPage() {
  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Breadcrumb C:\ANTN\ABOUT */}
      <div className="relative z-20 pt-24 md:pt-28 shell">
        <div className="flex items-center gap-2 text-white/5 font-mono text-sm tracking-wider">
          <span>C:\</span>
          <span>ANTN</span>
          <span className="text-white/40">\</span>
          <span className="text-white/50">ABOUT</span>
        </div>
      </div>

      <div className="relative z-20 shell shell-lg flex flex-col lg:flex-row gap-16 lg:gap-20 py-12 pb-24">
        {/* Colonne gauche : description studio */}
        <div className="flex-1 max-w-xl">
          <div className="border-l border-white/20 pl-4">
            <p className="text-zinc-300 text-sm md:text-base leading-relaxed font-mono uppercase tracking-wide">
              <strong className="text-white font-semibold">antn.studio</strong>{" "}
              is a creative studio founded by Anthony, director and project lead
              from <HoverWord>Paris</HoverWord>. We craft{" "}
              <HoverWord>cinematic visuals</HoverWord>,{" "}
              <HoverWord>brand films</HoverWord> and{" "}
              <HoverWord>digital experiences</HoverWord> with a strong narrative
              core — <HoverWord>technical mastery</HoverWord>,{" "}
              <HoverWord>authenticity</HoverWord> and{" "}
              <HoverWord>impact</HoverWord>.
            </p>
            <p className="mt-4 text-zinc-400 text-sm font-mono uppercase tracking-wide leading-relaxed">
              <HoverWord>Sensory</HoverWord>, <HoverWord>intentional</HoverWord>,{" "}
              <HoverWord>timeless</HoverWord> — we turn ideas into{" "}
              <HoverWord>living imagery</HoverWord>.
            </p>
          </div>

          {/* Expériences en liste compacte type console */}
          <ul className="mt-10 space-y-2">
            {EXPERIENCES.map((exp) => (
              <li
                key={`${exp.company}-${exp.title}`}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-0 text-xs font-mono text-zinc-500"
              >
                <span className="text-white/60">{exp.title}</span>
                <span className="text-white/30">@</span>
                <span>{exp.company}</span>
                <span className="text-white/25">({exp.dates})</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Colonne droite : blocs [ SOCIAL ], [ ADDRESS ], etc. */}
        <div className="flex-shrink-0 w-full lg:w-[320px] space-y-6">
          <Block label="Social">
            <a
              href="https://www.instagram.com/antnstudio/"
              target="_blank"
              rel="noreferrer"
              className="block text-white/90 hover:text-white transition"
            >
              Instagram
            </a>
            <a
              href="https://x.com/antnstudio"
              target="_blank"
              rel="noreferrer"
              className="block text-white/90 hover:text-white transition"
            >
              X / Twitter
            </a>
            <a
              href="https://www.linkedin.com/in/antnstudio/"
              target="_blank"
              rel="noreferrer"
              className="block text-white/90 hover:text-white transition"
            >
              LinkedIn
            </a>
          </Block>

          <Block label="Address">
            48.7264° N, 2.2770° E
          </Block>

          <Block label="For new project">
            <a
              href="mailto:anthony@antn.studio"
              className="text-white/90 hover:text-white transition underline underline-offset-2"
            >
              anthony@antn.studio
            </a>
          </Block>

          <Block label="Job">
            <Link href="mailto:anthony@antn.studio?subject=Application" className="text-white/90 hover:text-white transition underline underline-offset-2">
              Apply here
            </Link>
          </Block>

          <Block label="Infos">
            <Link href="/" className="text-white/90 hover:text-white transition">
              Legals
            </Link>
            <span className="text-white/40 mx-1">·</span>
            <span className="text-white/60">Credits</span>
          </Block>
        </div>
      </div>

    </main>
  );
}
