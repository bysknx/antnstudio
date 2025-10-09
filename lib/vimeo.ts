// lib/vimeo.ts
const API = "https://api.vimeo.com";

type FetchOpts = {
  folderId?: string | undefined;
  perPage?: number; // max à récupérer (cap coté client)
};

type VimeoRaw = {
  uri?: string;                 // ex: "/videos/123456789"
  name?: string;                // titre
  link?: string;                // page publique
  created_time?: string;        // ISO
  release_time?: string;        // ISO
  duration?: number;            // en secondes
  pictures?: {
    sizes?: Array<{ width: number; height: number; link: string }>;
    base_link?: string;
  };
};

export async function fetchVimeoWorks({ folderId, perPage = 200 }: FetchOpts) {
  const token = process.env.VIMEO_TOKEN;
  if (!token) throw new Error("Missing VIMEO_TOKEN");

  // endpoint: dossier (projects) ou vidéos du compte
  const basePath = folderId
    ? `/me/projects/${folderId}/videos`
    : `/me/videos`;

  const fields = [
    "uri",
    "name",
    "link",
    "created_time",
    "release_time",
    "duration",
    "pictures.sizes",
    "pictures.base_link",
  ].join(",");

  const headers: Record<string, string> = {
    Authorization: `bearer ${token}`,
    Accept: "application/vnd.vimeo.*+json;version=3.4",
    "Content-Type": "application/json",
  };

  const items: VimeoRaw[] = [];
  let url = new URL(`${API}${basePath}`);
  url.searchParams.set("per_page", "100");            // pagination 100 par page
  url.searchParams.set("sort", "date");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("fields", fields);

  while (true) {
    const res = await fetch(url.toString(), { headers, cache: "no-store" });
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`Vimeo ${res.status}: ${msg}`);
    }
    const json = await res.json();
    const pageData: VimeoRaw[] = Array.isArray(json?.data) ? json.data : [];
    items.push(...pageData);

    if (items.length >= perPage) break;

    // pagination
    const next = json?.paging?.next as string | undefined;
    if (!next) break;
    url = new URL(next);
  }

  // mapping propre → notre contrat côté app
  return items.slice(0, perPage).map((p) => {
    const id =
      p?.uri?.split?.("/")?.pop?.() ??
      ""; // ex: "/videos/123" → "123"

    const created = p?.created_time || p?.release_time || null;
    const createdAt = created ? new Date(created).toISOString() : null;
    const year = created ? new Date(created).getFullYear() : undefined;

    // prend la plus grande image disponible (ou base_link)
    const fromSizes =
      p?.pictures?.sizes && p.pictures.sizes.length
        ? p.pictures.sizes[p.pictures.sizes.length - 1]?.link
        : undefined;
    const thumbnail = fromSizes || p?.pictures?.base_link || "";

    const embed =
      id && /^\d+$/.test(id)
        ? `https://player.vimeo.com/video/${id}?autoplay=0&muted=1&playsinline=1`
        : undefined;

    return {
      id,
      title: p?.name ?? "Untitled",
      link: p?.link ?? "",
      createdAt,
      year,
      duration: p?.duration,
      thumbnail,
      embed,
    };
  });
}
