// lib/vimeo.ts
import { parseVimeoTitle, slugify } from "./parseVimeoTitle";

const VIMEO_API = "https://api.vimeo.com";

export type VimeoItem = {
  id: string;
  name: string;      // titre
  link: string;      // url publique
  player_embed_url?: string; // parfois fourni
  pictures?: { sizes?: { link: string; width: number; height: number }[] };
  duration?: number;
  created_time?: string;
};

export type ProjectFromVimeo = {
  id: string;
  name: string;          // original vimeo title
  year?: number;
  client?: string;
  title?: string;
  type?: string;
  slug: string;
  vimeoId: string;
  vimeoUrl: string;
  embedUrl: string;      // iframe URL (player.vimeo.com/video/…)
  thumbnail: string | null;
  duration: number | null;
  createdAt: string;
  featured?: boolean;
  featuredOrder?: number;
};

function buildEmbedUrl(id: string) {
  // Autoplay + mute + no controls, ajustable
  return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&playsinline=1&controls=0&pip=1&autopause=0&badge=0`;
}

export async function fetchVimeoWorks(opts?: {
  folderId?: string;
  perPage?: number;
}): Promise<ProjectFromVimeo[]> {
  const token = process.env.VIMEO_TOKEN;
  if (!token) throw new Error("VIMEO_TOKEN is missing");

  const perPage = opts?.perPage ?? 100;
  const endpoint = opts?.folderId
    ? `${VIMEO_API}/me/projects/${opts.folderId}/videos?per_page=${perPage}&sort=date&direction=desc`
    : `${VIMEO_API}/me/videos?per_page=${perPage}&sort=date&direction=desc`;

  const res = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${token}` },
    // Sur Vercel Edge/Node 18+, pas besoin d'agent spécifique
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vimeo API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  const items: VimeoItem[] = data.data || [];

  return items.map((v) => {
    // id pur = le dernier segment de v.uri (ex: /videos/123456789)
    const vimeoId = (v as any).uri?.split("/").pop() || "";

    const parsed = parseVimeoTitle(v.name);
    const safeTitle = parsed.title || v.name;
    const slug = slugify(`${parsed.year || ""}-${safeTitle}`);

    const thumb =
      v.pictures?.sizes?.sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
        ?.link || null;

    const featured =
      typeof parsed.featuredOrder === "number" && parsed.featuredOrder > 0;

    return {
      id: `vimeo-${vimeoId}`,
      name: v.name,
      year: parsed.year,
      client: parsed.client,
      title: parsed.title,
      type: parsed.type,
      slug,
      vimeoId,
      vimeoUrl: v.link,
      embedUrl: buildEmbedUrl(vimeoId),
      thumbnail: thumb,
      duration: typeof v.duration === "number" ? v.duration : null,
      createdAt: v.created_time || "",
      featured,
      featuredOrder: parsed.featuredOrder,
    };
  });
}
