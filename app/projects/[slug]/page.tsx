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
  // Route Handler interne — en SSR une URL relative marche aussi
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const url = `${base}/api/vimeo`.replace(/\/{2,}/g, "/").replace(":/", "://");

  const res = await fetch(url, { cache: "no-store" }).catch(() => null);
  if (!res || !res.ok) return { items: [] as any[] };
  return res.json();
}

// ⚠️ Next 15: params est une Promise
type PageProps = { params: Promise<{ slug: string }> };

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  const data = await getProjects();
  const items: any[] = Array.isArray((data as any)?.items) ? (data as any).items : [];

  // match par slug(title) OU par id
  const project =
    items.find((p) => slugify(p.title || p.name || "") === slug) ||
    items.find((p) => String(p.id) === slug);

  if (!project) notFound();

  const title: string = project.title || project.name || "Untitled";
  const thumb: string | undefined = project.thumbnail || project.picture || project.thumb || "";
  const year: number =
    project.year ||
    new Date(project.createdAt || project.created_time || Date.now()).getFullYear();
  const vimeoUrl: string = project.vimeoUrl || project.link || "#";

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
              src={project.embed as string}
              title={title}
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : thumb ? (
          <img
            src={String(thumb)}
            alt={title}
            className="w-full h-auto"
            loading="eager"
          />
        ) : (
          <div className="aspect-video grid place-items-center text-zinc-500">
            <a
              href={vimeoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-300"
            >
              View on Vimeo
            </a>
          </div>
        )}
      </div>

      {/* liens / meta */}
      <div className="mt-6 flex items-center gap-4 text-sm text-zinc-400">
        {vimeoUrl && vimeoUrl !== "#" && (
          <a
            href={vimeoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-200"
          >
            Open on Vimeo
          </a>
        )}
      </div>
    </main>
  );
}

// (Optionnel) si tu as un generateMetadata, pense à await params aussi :
// export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
//   const { slug } = await params;
//   return { title: `Project — ${slug}` };
// }
