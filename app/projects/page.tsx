// app/projects/page.tsx
import ProjectsClient from "./ProjectsClient";

export default async function ProjectsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/vimeo`, {
    cache: "no-store",
  });
  const { items } = await res.json();

  return <ProjectsClient initialItems={items ?? []} />;
}
