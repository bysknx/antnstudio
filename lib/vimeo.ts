// lib/vimeo.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
const API = "https://api.vimeo.com";

function req(path: string, token: string, noStore = true) {
  return fetch(path.startsWith("http") ? path : `${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
    },
    cache: noStore ? "no-store" : "no-cache",
  });
}

function env(name: string, optional = false): string | undefined {
  const v = process.env[name];
  if (!v && !optional) throw new Error(`Missing env: ${name}`);
  return v;
}

async function listAll(token: string, firstPath: string) {
  const out: any[] = [];
  let url: string | null = firstPath.startsWith("http")
    ? firstPath
    : `${API}${firstPath}`;

  while (url) {
    const r = await req(url, token);
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`Vimeo ${r.status} on ${url} – ${txt.slice(0, 400)}`);
    }
    const j = await r.json();
    const data = Array.isArray(j?.data) ? j.data : [];
    out.push(...data);

    const next = j?.paging?.next as string | undefined;
    url = next ? (next.startsWith("http") ? next : `${API}${next}`) : null;
  }
  return out;
}

/** Certains endpoints renvoient 'items' (type:'video'), d'autres un tableau de 'videos'. */
function onlyVideos(rows: any[]): any[] {
  return rows
    .map((x) => {
      // format “items”: { type:'video', uri:'/users/.../items/xxx', video:{ uri:'/videos/123', ... } }
      if (x?.type === "video" && x?.video?.uri) return x.video;
      // format “videos”: directement { uri:'/videos/123', ... }
      return x;
    })
    .filter((v) => typeof v?.uri === "string" && v.uri.includes("/videos/"));
}

async function tryMany(token: string, paths: string[]) {
  const tried: Record<string, number> = {};
  for (const p of paths) {
    try {
      const all = await listAll(token, p);
      const vids = onlyVideos(all);
      tried[p] = vids.length;
      if (vids.length) return { videos: vids, tried };
    } catch (e) {
      tried[p] = -1; // -1 = erreur
    }
  }
  return { videos: [] as any[], tried };
}

/** Récupère les vidéos d’un projet + enfants (si dispo) en testant plusieurs variantes d’API. */
export async function fetchVimeoWorks(opts: {
  folderId?: string; // id “WORKS”
  teamId?: string; // id user/équipe (numérique)
}) {
  const token = env("VIMEO_TOKEN")!;
  const userId = opts.teamId || env("VIMEO_TEAM_ID")!;
  const projectId = opts.folderId || env("VIMEO_FOLDER_ID")!;
  if (!projectId) throw new Error("VIMEO_FOLDER_ID manquant");

  // 1) vidéos du projet principal
  const { videos: directVideos, tried: triedA } = await tryMany(token, [
    `/users/${userId}/projects/${projectId}/videos`,
    `/me/projects/${projectId}/videos`,
    `/users/${userId}/projects/${projectId}/items`,
    `/me/projects/${projectId}/items`,
  ]);

  // 2) enfants (sous-dossiers)
  const { videos: fromChildren, tried: triedB } = await (async () => {
    const childTried: Record<string, number> = {};
    const children = await (async () => {
      const { videos: dummy, tried } = await tryMany(token, [
        `/users/${userId}/projects/${projectId}/children`,
        `/me/projects/${projectId}/children`,
      ]);
      const firstOk = Object.entries(tried).find(([, n]) => n >= 0)?.[0];
      if (!firstOk) return [] as any[];
      childTried[firstOk] = -2;
      const r = await req(firstOk, token);
      if (!r.ok) return [];
      const j = await r.json();
      return Array.isArray(j?.data) ? j.data : [];
    })();

    const aggregate: any[] = [];
    for (const c of children) {
      const cid = String(c?.uri?.split?.("/")?.pop?.() ?? "");
      if (!cid) continue;
      const { videos, tried } = await tryMany(token, [
        `/users/${userId}/projects/${cid}/videos`,
        `/me/projects/${cid}/videos`,
        `/users/${userId}/projects/${cid}/items`,
        `/me/projects/${cid}/items`,
      ]);
      Object.assign(childTried, tried);
      aggregate.push(...videos);
    }
    return { videos: aggregate, tried: childTried };
  })();

  // 3) agrégation finale
  const all = [...directVideos, ...fromChildren].map((v) => {
    const id = v?.uri?.split("/").pop() || "";
    const created = v?.release_time || v?.created_time || null;
    const thumb =
      v?.pictures?.sizes?.[v?.pictures?.sizes?.length - 1]?.link ||
      v?.pictures?.base_link ||
      "";
    return {
      id,
      title: v?.name || "Untitled",
      createdAt: created ? new Date(created).toISOString() : null,
      thumbnail: thumb,
      link: v?.link || (id ? `https://vimeo.com/${id}` : ""),
      embed: id
        ? `https://player.vimeo.com/video/${id}?muted=1&autoplay=0&playsinline=1&controls=0&pip=1&transparent=0`
        : "",
      duration: v?.duration ?? undefined,
    };
  });

  const debug = { tried: { ...triedA, ...triedB } };

  return { items: all, debug };
}

// ✅ Export par défaut pour compatibilité éventuelle
export default fetchVimeoWorks;
