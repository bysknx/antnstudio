// app/projects/page.tsx — SERVER COMPONENT
import ProjectsClient, { VideoItem } from "./ProjectsClient";
import { fetchVideos } from "@/lib/videos";
import { getAdminConfig } from "@/lib/admin-config";

export const revalidate = 0;

export default async function Page() {
  const [videos, config] = await Promise.all([fetchVideos(), getAdminConfig()]);

  let items: VideoItem[] = videos.map((v) => ({
    id: v.id,
    title: v.title,
    createdAt: v.year ? `${v.year}-01-01T00:00:00.000Z` : undefined,
    thumbnail: v.thumbnail ?? "",
    embed: v.url,
    link: v.url,
    url: v.url,
    year: v.year ?? undefined,
  }));

  if (config.visibility && Object.keys(config.visibility).length > 0) {
    items = items.filter((v) => config.visibility[v.id] !== false);
  }

  return <ProjectsClient initialItems={items} />;
}
