import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PROJECTS } from "@/app/data";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const PROJECT_LIST = PROJECTS.map((p) => ({ slug: slugify(p.name), project: p }));

export async function generateStaticParams() {
  return PROJECT_LIST.map(({ slug }) => ({ slug }));
}

type Params = { slug: string };

// ⚠️ Next 15 : params est un Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = PROJECT_LIST.find((p) => p.slug === slug);
  if (!entry) return {};

  const { project } = entry;
  const title = `${project.name} — antn.studio`;
  const description = project.description ?? "Project — antn.studio";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://antn.studio/projects/${slug}`,
      siteName: "antn.studio",
      images: [{ url: "/cover.jpg", width: 1200, height: 630, alt: project.name }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/cover.jpg"],
    },
  };
}

// ⚠️ Next 15 : params est un Promise
export default async function ProjectDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const entry = PROJECT_LIST.find((p) => p.slug === slug);
  if (!entry) return notFound();
  const { project } = entry;

  return (
    <main className="grid-c py-28 space-y-10">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-100">{project.name}</h1>
          <p className="text-zinc-400">{project.description}</p>
        </div>

        <div className="flex items-center gap-3">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-zinc-700/70 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-900"
            >
              Visit ↗
            </a>
          )}
          <Link
            href="/projects"
            className="inline-flex items-center rounded-full border border-zinc-700/50 px-3 py-1 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Back
          </Link>
        </div>
      </header>

      <section className="rounded-2xl bg-zinc-950/60 ring-1 ring-zinc-800/60 p-1">
        {project.video ? (
          <video
            src={project.video}
            autoPlay
            loop
            muted
            playsInline
            className="aspect-video w-full rounded-xl"
          />
        ) : (
          <div className="aspect-video w-full rounded-xl bg-zinc-900" />
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-xl bg-zinc-950/50 p-4 ring-1 ring-zinc-800/60">
          <h3 className="mb-2 text-sm font-medium text-zinc-200">Role</h3>
          <p className="text-zinc-400">Front-end, Design System, Motion</p>
        </div>
        <div className="rounded-xl bg-zinc-950/50 p-4 ring-1 ring-zinc-800/60">
          <h3 className="mb-2 text-sm font-medium text-zinc-200">Stack</h3>
          <p className="text-zinc-400">Next.js, Tailwind v4, Motion, Canvas</p>
        </div>
        <div className="rounded-xl bg-zinc-950/50 p-4 ring-1 ring-zinc-800/60">
          <h3 className="mb-2 text-sm font-medium text-zinc-200">Year</h3>
          <p className="text-zinc-400">{new Date().getFullYear()}</p>
        </div>
      </section>

      <section className="prose prose-invert prose-zinc max-w-none">
        <p>
          Brief du projet, objectifs et contraintes. Page volontairement minimaliste
          pour coller à la DA. On branchera du contenu MDX (texte + images + embeds) si besoin.
        </p>
      </section>
    </main>
  );
}
