// app/contact/page.tsx
"use client";

import React from "react";
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-16 sm:px-6 lg:px-8">
      {/* Wrapper plein écran pour centrer verticalement/horizontalement */}
      <div className="min-h-[100svh] grid place-items-center">
        {/* Capsule floutée (garde la grille de points, gagne en lisibilité) */}
        <section
          className={[
            "w-full rounded-2xl border border-white/10",
            "bg-black/30 supports-[backdrop-filter]:bg-black/20",
            "supports-[backdrop-filter]:backdrop-blur-md",
            "p-6 sm:p-8 lg:p-10",
          ].join(" ")}
        >
          {/* Grille 2 colonnes : Form / About */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
            {/* ========= Form ========= */}
            <div>
              <h2 className="mb-4 text-xs font-extrabold tracking-[0.22em] text-zinc-300">
                CONTACT
              </h2>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">Contact</h3>
                <ContactForm />
                <p className="mt-3 text-xs text-zinc-400">
                  *Temporaire : on branchera un mailto ou Formspree/Resend.
                </p>
              </div>
            </div>

            {/* ========= About + CTA ========= */}
            <div className="flex flex-col">
              <h2 className="mb-4 text-lg font-semibold text-zinc-100">About.</h2>

              {/* Texte justifié + mots clés en gras */}
              <div className="space-y-4 text-justify text-[15px] leading-relaxed text-zinc-200">
                <p>
                  « <span className="font-semibold">antn.studio</span> » founded by{" "}
                  <span className="font-semibold">Anthony</span>, an independent{" "}
                  <span className="font-semibold">director</span> and{" "}
                  <span className="font-semibold">project lead</span> from Paris.
                </p>

                <p>
                  Blending <span className="font-semibold">precision</span> with{" "}
                  <span className="font-semibold">emotion</span>, the studio crafts{" "}
                  <span className="font-semibold">cinematic visuals</span>, brand films, and
                  digital experiences with a <span className="font-semibold">strong narrative core</span>.
                </p>

                <p>
                  Each project is shaped with <span className="font-semibold">technical mastery</span>, and driven by a search for{" "}
                  <span className="font-semibold">authenticity</span> and{" "}
                  <span className="font-semibold">impact</span>.
                </p>

                <p>
                  <em>Sensory, intentional, timeless</em> —{" "}
                  <span className="font-semibold">antn.studio</span> turns ideas into living imagery.
                </p>
              </div>

              {/* CTA + Mail alignés, mêmes hauteurs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex h-9 items-center rounded-full border border-white/10 px-3 text-[12px] font-extrabold uppercase tracking-[0.18em] text-zinc-200">
                  Let’s connect :
                </span>

                {/* Bouton mail : remplissage blanc de GAUCHE → DROITE, texte qui passe au noir */}
                <a
                  href="mailto:anthony@antn.studio"
                  className="relative group inline-flex h-9 items-center overflow-hidden rounded-full border border-white/10 px-4 font-semibold text-zinc-100"
                  aria-label="Envoyer un email à anthony@antn.studio"
                >
                  <span
                    className="absolute inset-0 -translate-x-full bg-white transition-transform duration-500 group-hover:translate-x-0"
                    aria-hidden
                  />
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-black">
                    anthony@antn.studio
                  </span>
                </a>
              </div>

              {/* Cartes d’expériences : plus espacées, moins larges, hover subtil */}
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {EXPERIENCES.map((exp) => (
                  <article
                    key={exp.title}
                    className={[
                      "rounded-2xl border border-white/10 bg-white/[0.02] p-4",
                      "transition-all duration-300 ease-out",
                      "hover:bg-white/[0.04] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]",
                      "hover:-translate-y-0.5",
                    ].join(" ")}
                  >
                    <p className="text-xs text-zinc-400">{exp.meta}</p>
                    <h4 className="mt-1 font-semibold text-zinc-100">{exp.title}</h4>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* === Données d’expériences (tu peux éditer) === */
const EXPERIENCES = [
  {
    meta: "antn.studio — 2019 → Present",
    title: "CEO",
  },
  {
    meta: "Freelance @ Jellysmack — 2022 → 2023",
    title: "Edit Supervisor",
  },
  {
    meta: "Freelance — 2023 → 2025",
    title: "International Project Manager",
  },
];
