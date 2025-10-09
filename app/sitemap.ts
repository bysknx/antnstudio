import type { MetadataRoute } from "next";
import { PROJECTS } from "@/app/data";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://antn.studio";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const projectPages: MetadataRoute.Sitemap = PROJECTS.map((p) => ({
    url: `${base}/projects/${slugify(p.name)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...projectPages];
}
