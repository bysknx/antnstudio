// app/projects/page.tsx — SERVER COMPONENT
import ProjectsClient, { VimeoItem } from "./ProjectsClient";
import { fetchVideos } from "@/lib/videos";

export const revalidate = 0;

export default async function Page() {
  const videos = await fetchVideos();

  const items: VimeoItem[] = videos.map((v) => ({
    id: v.id,
    title: v.title,
    createdAt: v.year ? `${v.year}-01-01T00:00:00.000Z` : undefined,
    thumbnail: v.thumbnail ?? "",
    embed: v.url,
    link: v.url,
    url: v.url,
    year: v.year ?? undefined,
  }));

  return <ProjectsClient initialItems={items} />;
}
