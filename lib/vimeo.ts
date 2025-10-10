// lib/vimeo.ts
type VimeoVideo = {
  uri: string;                 // "/videos/123456789"
  name: string;
  duration?: number;
  created_time?: string;
  pictures?: { sizes?: { link: string }[] };
  player_embed_url?: string;
};

type VimeoProjectItem = {
  uri: string;                 // "/projects/24525006"
  type?: "project" | "video";
  project?: { uri: string };
};

const API = "https://api.vimeo.com";

function env(name: string, optional = false) {
  const v = process.env[name];
  if (!v && !optional) throw new Error(`Missing env: ${name}`);
  return v || "";
}

async function vimeoGET(path: string, params: Record<string, any> = {}) {
  const token = env("VIMEO_TOKEN");
  const url = new URL(path.startsWith("http") ? path : `${API}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Vimeo ${res.status} ${res.statusText} on ${url}: ${txt}`);
  }
  return res.json();
}

async function listAll(path: string, params: Record<string, any> = {}) {
  const out: any[] = [];
  let url: string | null = `${API}${path}?per_page=100`;
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url += `&${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
  });

  while (url) {
    const json = await vimeoGET(url);
    const data = Array.isArray(json.data) ? json.data : [];
    out.push(...data);
    const next = json?.paging?.next || json?.paging?.next_href || null;
    url = next ? (next.startsWith("http") ? next : `${API}${next}`) : null;
  }
  return out;
}

/** Récupère les vidéos d’un project (dossier) */
async function getVideosFromProject(projectId: string) {
  try {
    return await listAll(`/me/projects/${projectId}/videos`);
  } catch (err) {
    // essai via team/user si disponible
    const teamId = env("VIMEO_TEAM_ID", true);
    if (teamId) {
      return await listAll(`/users/${teamId}/projects/${projectId}/videos`);
    }
    // re-lance l’erreur d’origine (pas de throw nu)
    throw err;
  }
}

/** Liste les sous-projects d’un project */
async function getChildProjects(projectId: string): Promise<string[]> {
  const ids = new Set<string>();

  try {
    const items: VimeoProjectItem[] = await listAll(`/me/projects/${projectId}/items`, {
      type: "project",
    });
    items.forEach((it) => {
      const uri = it?.project?.uri || it?.uri;
      if (!uri) return;
      const id = uri.split("/").pop();
      if (id) ids.add(id);
    });
  } catch {}

  try {
    const projs: VimeoProjectItem[] = await listAll(`/me/projects/${projectId}/projects`);
    projs.forEach((p) => {
      const id = p.uri?.split("/").pop();
      if (id) ids.add(id);
    });
  } catch {}

  if (!ids.size) {
    const teamId = env("VIMEO_TEAM_ID", true);
    if (teamId) {
      try {
        const items: VimeoProjectItem[] = await listAll(
          `/users/${teamId}/projects/${projectId}/items`,
          { type: "project" }
        );
        items.forEach((it) => {
          const uri = it?.project?.uri || it?.uri;
          const id = uri?.split("/").pop();
          if (id) ids.add(id);
        });
      } catch {}
    }
  }

  return Array.from(ids);
}

/** Parcours récursif d’un dossier racine, descend dans tous les sous-dossiers */
async function collectVideosRecursive(rootProjectId: string): Promise<VimeoVideo[]> {
  const seenProjects = new Set<string>();
  const videos: VimeoVideo[] = [];

  async function walk(projectId: string) {
    if (seenProjects.has(projectId)) return;
    seenProjects.add(projectId);

    const vs: VimeoVideo[] = await getVideosFromProject(projectId);
    videos.push(...vs);

    const children = await getChildProjects(projectId);
    await Promise.all(children.map((cid) => walk(cid)));
  }

  await walk(rootProjectId);
  return videos;
}

/** API publique utilisée par l’app */
export async function fetchVimeoWorks(opts: { folderId?: string; perPage?: number }) {
  const folderId = opts.folderId || env("VIMEO_FOLDER_ID");
  const raw: VimeoVideo[] = await collectVideosRecursive(folderId);

  const mapped = raw.map((v) => {
    const id = v.uri?.split("/").pop() || "";
    const thumb =
      v.pictures?.sizes?.[v.pictures.sizes.length - 1]?.link ||
      v.pictures?.sizes?.[0]?.link ||
      "";

    return {
      id,
      title: v.name,
      createdAt: v.created_time,
      duration: v.duration,
      thumbnail: thumb,
      embed: v.player_embed_url || (id ? `https://player.vimeo.com/video/${id}` : undefined),
      year: v.created_time ? new Date(v.created_time).getFullYear() : undefined,
    };
  });

  const uniq = new Map<string, any>();
  mapped.forEach((m) => {
    if (m.id && !uniq.has(m.id)) uniq.set(m.id, m);
  });

  const items = Array.from(uniq.values()).sort((a, b) => {
    const ad = a.createdAt ? +new Date(a.createdAt) : 0;
    const bd = b.createdAt ? +new Date(b.createdAt) : 0;
    return bd - ad || String(a.title).localeCompare(String(b.title));
  });

  return items;
}
