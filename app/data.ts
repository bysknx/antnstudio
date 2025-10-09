// app/data.ts

/* ========= Types ========= */

export type ProjectMedia =
  | { kind: "image"; src: string; alt?: string; durationMs?: number }
  | { kind: "video"; src: string }
  | { kind: "vimeo"; src: string }; // ex: https://player.vimeo.com/video/XXXX

export type Project = {
  slug: string;            // id lisible (sert aux routes /projects/[slug])
  title: string;
  year: number;
  link?: string;           // URL page projet si besoin
  description?: string;
  media: ProjectMedia[];   // premier média = celui utilisé sur la Home
  featured?: boolean;      // afficher sur la Home
  featuredOrder?: number;  // ordre manuel (petit -> grand)
};

export type WorkExperience = {
  company: string;
  title: string;
  start: string;
  end: string;
  link?: string;
  id: string;
};

export type SocialLink = {
  label: string;
  link: string;
};

/* ========= Données projets =========
   (mets tes vrais slugs/URLs ici ; j’ai repris ceux utilisés dans la page projects-pen.html + 1 Vimeo)
*/

export const PROJECTS: Project[] = [
  {
    slug: "sova-cpagrave",
    title: "SOVA — C Pa Grave",
    year: 2025,
    featured: true,
    featuredOrder: 1,
    media: [
      // Player Vimeo plein écran
      { kind: "vimeo", src: "https://player.vimeo.com/video/1064426220?h=aa04927136" },
    ],
  },
  {
    slug: "echo-discs",
    title: "Echo Discs",
    year: 2025,
    featured: true,
    featuredOrder: 2,
    media: [
      { kind: "image", src: "https://cdn.cosmos.so/7b5340f5-b4dc-4c08-8495-c507fa81480b?format=jpeg", alt: "Echo Discs", durationMs: 10000 },
    ],
  },
  {
    slug: "neon-handscape",
    title: "Neon Handscape",
    year: 2025,
    featured: true,
    featuredOrder: 3,
    media: [
      { kind: "image", src: "https://cdn.cosmos.so/2f49a117-05e7-4ae9-9e95-b9917f970adb?format=jpeg", alt: "Neon Handscape", durationMs: 10000 },
    ],
  },
  {
    slug: "solar-bloom",
    title: "Solar Bloom",
    year: 2025,
    media: [
      { kind: "image", src: "https://cdn.cosmos.so/47caf8a0-f456-41c5-98ea-6d0476315731?format=jpeg", alt: "Solar Bloom", durationMs: 10000 },
    ],
  },
  {
    slug: "chromatic-loopscape",
    title: "Chromatic Loopscape",
    year: 2024,
    media: [
      { kind: "image", src: "https://cdn.cosmos.so/0f164449-f65e-4584-9d62-a9b3e1f4a90a?format=jpeg", alt: "Chromatic Loopscape", durationMs: 10000 },
    ],
  },
  {
    slug: "nova-pulse",
    title: "Nova Pulse",
    year: 2024,
    media: [
      { kind: "image", src: "https://cdn.cosmos.so/f733585a-081e-48e7-a30e-e636446f2168?format=jpeg", alt: "Nova Pulse", durationMs: 10000 },
    ],
  },
  {
    slug: "sonic-horizon",
    title: "Sonic Horizon",
    year: 2023,
    media: [
      { kind: "image", src: "https://cdn.cosmos.so/f99f8445-6a19-4a9a-9de3-ac382acc1a3f?format=jpeg", alt: "Sonic Horizon", durationMs: 10000 },
    ],
  },
];

/* ========= Sélection Home (featured) ========= */

export function getFeaturedForHome(limit = 6): Project[] {
  return PROJECTS
    .filter(p => p.featured)
    .sort(
      (a, b) =>
        (a.featuredOrder ?? 999) - (b.featuredOrder ?? 999) ||
        b.year - a.year
    )
    .slice(0, limit);
}

/* Option pratique : slides déjà mappés pour le FullBleedPlayer */
export type HeroSlide =
  | { type: "image"; src: string; alt?: string; durationMs?: number }
  | { type: "video"; src: string }
  | { type: "vimeo"; src: string };

export function featuredSlidesForHero(limit = 6): HeroSlide[] {
  const toSlide = (m: ProjectMedia): HeroSlide => {
    if (m.kind === "image") return { type: "image", src: m.src, alt: m.alt, durationMs: m.durationMs };
    if (m.kind === "video") return { type: "video", src: m.src };
    return { type: "vimeo", src: m.src };
  };
  return getFeaturedForHome(limit)
    .map(p => p.media[0])
    .filter(Boolean)
    .map(toSlide);
}

/* ========= Expériences ========= */

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    company: "antn.studio",
    title: "CEO",
    start: "2019",
    end: "Present",
    link: "https://antn.studio",
    id: "work-antn-ceo",
  },
  {
    company: "Freelance @ Jellysmack",
    title: "Edit Supervisor",
    start: "2022",
    end: "2023",
    link: "",
    id: "work-jellysmack-edit-supervisor",
  },
  {
    company: "Freelance",
    title: "International Project Manager",
    start: "2023",
    end: "2025",
    link: "",
    id: "work-intl-pm",
  },
];

/* ========= Socials & Email ========= */

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Instagram", link: "https://www.instagram.com/antnstudio/" },
  { label: "X / Twitter", link: "https://x.com/antnstudio" },
  { label: "LinkedIn", link: "https://www.linkedin.com/in/antnstudio/" },
];

export const EMAIL = "anthony@antn.studio";
