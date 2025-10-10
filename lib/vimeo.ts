// lib/vimeo.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
const API = "https://api.vimeo.com";

function env(name: string, optional = false): string | undefined {
  const v = process.env[name];
  if (!v && !optional) {
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}

type VimeoVideo = {
  uri: string; // "/videos/123456789"
  name?: string;
  description?: string;
  created_time?: string;
  release_time?: string;
  pictures?: { sizes?: { link: string }[]; base_link?: string };
  link?: string;
  embed?: { html?: string; badges?: any };
  duration?: number;
};

type VimeoProject = {
  uri: string; // "/users/{id}/projects/{project_id}"
  name?: string;
  created_time?: string;
};

async function fetchJSON(path: string, token: string) {
  const res = await fetch(path.startsWith("http") ? path : `${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
      "Content-Type": "application/json",
    },
    // Pas de cache côté Vercel/Next
    cache: "no-store",
    // timeout via AbortSignal si tu veux pousser plus loin
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Vimeo ${res.status} ${res.statusText} on ${path} – ${text?.slice(0, 500)}`
    );
  }
  return res.json();
}

/** Vimeo pagine avec `paging.next` – on agrège tout. */
async function listAll(token: string, firstPath: string) {
  let url: string | null = `${API}${firstPath}`;
  const out: any[] = [];

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.vimeo.*+json;version=3.4",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`Vimeo ${res.status} on ${url} – ${t?.slice(0, 500)}`);
    }

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];
    out.push(...data);

    const nextRel = json?.paging?.next as string | undefined;
    url = nextRel ? (nextRel.startsWith("http") ? nextRel : `${API}${nextRel}`) : null;
  }

  return out;
}

/** Liste les sous-projets d’un projet. */
async function listChildProjects(token: string, userId: string, projectId: string) {
  const path = `/users/${userId}/projects/${projectId}/children`;
  return listAll(token, path) as Promise<VimeoProject[]>;
}

/** Liste les vidéos d’un projet. */
async function listProjectVideos(token: string, userId: string, projectId: string) {
  const path = `/users/${userId}/projects/${projectId}/videos`;
  return listAll(token, path) as Promise<VimeoVideo[]>;
}

/** Descente récursive : projet + tous ses enfants (2023/2024/2025, etc.). */
async function listProjectVideosRecursive(
  token: string,
  userId: string,
  projectId: string
) {
  const videos = await listProjectVideos(token, userId, projectId);

  const children = await listChildProjects(token, userId, projectId).catch(() => []);
  for (const child of children) {
    const childId = child.uri.split("/").pop()!;
    const childVideos = await listProjectVideos(token, userId, childId).catch(() => []);
    videos.push(...childVideos);
  }

  return videos;
}

/** Points d’entrée exportés par l’app */
export async function fetchVimeoWorks(opts: {
  folderId?: string; // id du projet "WORKS"
  teamId?: string; // id de l’équipe / user
  perPage?: number; // ignoré (on pagine totalement)
}) {
  const token = env("VIMEO_TOKEN")!;
  const userId = opts.teamId || env("VIMEO_TEAM_ID")!;

  const projectId = opts.folderId || env("VIMEO_FOLDER_ID")!;
  if (!projectId) throw new Error("VIMEO_FOLDER_ID manquant");

  // Vidéos du projet + de ses sous-projets
  const videos = await listProjectVideosRecursive(token, userId, projectId);

  // Normalisation minimale pour le front
  return videos.map((v) => {
    const id = v?.uri?.split("/").pop() || "";
    const title = v?.name || "Untitled";
    const created =
      v?.release_time || v?.created_time || null;
    const createdAt = created ? new Date(created).toISOString() : null;

    const thumb =
      v?.pictures?.sizes?.[v?.pictures?.sizes?.length - 1]?.link ||
      v?.pictures?.base_link ||
      "";

    return {
      id,
      title,
      createdAt,
      thumbnail: thumb,
      link: v?.link || `https://vimeo.com/${id}`,
      embed: `https://player.vimeo.com/video/${id}?muted=1&autoplay=0&playsinline=1&controls=0&pip=1&transparent=0`,
      duration: v?.duration ?? undefined,
    };
  });
}
