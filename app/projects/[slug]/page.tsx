// app/projects/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic"; // on lit /api/vimeo à la requête

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getProjects() {
  // fetch interne vers notre Route Handler
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/vimeo`, {
    // en local/SSR, une URL relative marche aussi:
    // fetch("/api/vimeo", { cache: "no-store" })
    cache: "no-store",
  }).catch(() => null);

  if (!res || !res.ok) return { items: [] as any[] };
  return res.json();
}

export default async function ProjectPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getProjects();
  const items: any[] = Array.isArray(data?.items) ? data.items : [];

  // on match soit par slug(title) soit par id
  const project =
    items.find((p) => slugify(p.title || p.name || "") === params.slug) ||
    items.find((p) => p.id === params.slug);

  if (!project) return notFound();

  const title = project.title || project.name || "Untitled";
  const thumb = project.thumbnail || "";
  const year = project.year || new Date(project.createdAt || Date.now()).getFullYear();
  const vimeoUrl = project.vimeoUrl || project.link || "#";

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="mb-6 text-sm text-zinc-400">
        <Link href="/projects" className="underline hover:text-zinc-200">
          ← Back to projects
        </Link>
      </div>

      <h1 className="text-3xl font-semibold text-zinc-100">{title}</h1>
      <p className="mt-1 text-zinc-400">{year}</p>

      {/* media */}
      <div className="mt-8 rounded-xl overflow-hidden border border-white/10 bg-black">
        {project.embed ? (
          <div className="relative w-full pb-[56.25%]">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={project.embed}
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : thumb ? (
          <img src={thumb} alt={title} className="w-full h-auto object-cover" />
        ) : null}
      </div>

      {vimeoUrl && vimeoUrl !== "#" ? (
        <a
          href={vimeoUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-block text-sm underline text-zinc-300 hover:text-zinc-100"
        >
          Open on Vimeo
        </a>
      ) : null}
    </main>
  );
}
