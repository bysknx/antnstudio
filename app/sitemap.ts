import { getSiteUrl } from "@/lib/constants";

// app/sitemap.ts
export const dynamic = "force-dynamic";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function sitemap() {
  const base = getSiteUrl();

  const res = await fetch(`${base}/api/vimeo`, {
    cache: "no-store",
  }).catch(() => null);

  const json = res && res.ok ? await res.json() : { items: [] as any[] };
  const items: any[] = Array.isArray(json?.items) ? json.items : [];

  const projectUrls = items.map((p) => {
    const title = p.title || p.name || "untitled";
    const slug = slugify(title);
    return {
      url: `${base}/projects/${slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    };
  });

  // pages statiques
  const statics = [
    { url: `${base}/`, priority: 1, changeFrequency: "weekly" as const },
    {
      url: `${base}/projects`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
    },
    {
      url: `${base}/contact`,
      priority: 0.4,
      changeFrequency: "monthly" as const,
    },
  ];

  return [...statics, ...projectUrls];
}
