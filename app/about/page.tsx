// app/about/page.tsx — About, style console, blocs [ SECTION ], ASCII
import type { ReactNode } from "react";
import Link from "next/link";

const ASCII_ART = [
  "░▒▓██████▓▒░░▒▓███████▓▒░▒▓████████▓▒░▒▓███████▓▒░  ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
  "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░   ░▒▓█▓▒░░▒▓█▓▒░ ",
].join("\n");

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

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/antnstudio/", icon: "instagram" },
  { label: "TikTok", href: "https://www.tiktok.com/@antnstudio", icon: "tiktok" },
];

const EXPERIENCES = [
  { title: "CEO", company: "antn.studio", dates: "2019 - Present" },
  { title: "Edit Supervisor", company: "Freelance @ Jellysmack", dates: "2022 - 2023" },
  { title: "International Project Manager", company: "Freelance", dates: "2023 - 2025" },
];

export default function AboutPage() {
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

        {/* Colonne droite : [ ADDRESS ], [ FOR NEW PROJECT ], [ SOCIALS ] */}
        <div className="flex-shrink-0 w-full lg:w-[320px] flex flex-col space-y-6">
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

          <Block label="Socials">
            <div className="flex items-center gap-4">
              {SOCIALS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="text-white/80 hover:text-white transition"
                >
                  {s.icon === "instagram" && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  )}
                  {s.icon === "tiktok" && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  )}
                </Link>
              ))}
            </div>
          </Block>
        </div>
      </div>

      {/* Logo ASCII en bas à droite — position fixe type marque */}
      <div className="pointer-events-none absolute bottom-24 right-4 lg:bottom-28 lg:right-8 lg:pr-4">
        <pre
          className="text-white font-mono leading-tight select-none text-xs sm:text-sm md:text-base lg:text-lg"
          style={{ fontFamily: "ui-monospace, monospace" }}
          aria-hidden
        >
          {ASCII_ART}
        </pre>
      </div>
    </main>
  );
}
