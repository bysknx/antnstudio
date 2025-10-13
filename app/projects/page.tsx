// app/projects/page.tsx
import ProjectsClient, { VimeoItem } from "./ProjectsClient";

export const revalidate = 0;

export default async function Page() {
  // On récupère côté serveur pour précharger la grille
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/api/vimeo`, {
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
