// app/projects/page.tsx
import ProjectsClient, { VimeoItem } from "./ProjectsClient";
import { getSiteUrl } from "@/lib/constants";

export const revalidate = 0;

export default async function Page() {
  // On récupère côté serveur pour précharger la grille
  const base = getSiteUrl();
  const res = await fetch(`${base}/api/vimeo`, {
    cache: "no-store",
  }).catch(() => null);

  let items: VimeoItem[] = [];
  if (res && res.ok) {
    try {
      const json = await res.json();
      items = Array.isArray(json?.items) ? json.items : [];
    } catch {}
  }

  return <ProjectsClient initialItems={items ?? []} />;
}
