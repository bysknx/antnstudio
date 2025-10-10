// lib/vimeo.ts
/* Vimeo helper – liste les vidéos d’un "project" (folder) et, si besoin,
   descend dans les sous-dossiers (projects enfants). */

type VimeoItem = any;

const API = "https://api.vimeo.com";

function env(name: string, optional = false) {
  const v = process.env[name];
  if (!v && !optional) throw new Error(`Missing env: ${name}`);
  return v || "";
}

function authHeaders() {
  const token = env("VIMEO_TOKEN");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
  };
}

async function vimeoGet(path: string, params?: Record<string, any>) {
  const qs = params
    ? "?" +
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join("&")
    : "";
  const res = await fetch(`${API}${path}${qs}`, { headers: authHeaders(), cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Vimeo ${res.status} ${res.statusText} on ${path}${qs ? " "+qs : ""} :: ${txt}`);
  }
  return res.json();
}

async function listAll(path: string, params?: Record<string, any>) {
  const out: any[] = [];
  let page = 1;
  // Vimeo pagine avec "page" / "per_page" + champ "paging.next"
  for (;;) {
    const data = await vimeoGet(path, { ...params, page });
    const items = Array.isArray(data?.data) ? data.data : [];
    out.push(...items);
    const next = data?.paging?.next;
    if (!next) break;
    page += 1;
  }
  return out;
}

// Try a base path, else throw to let caller fallback to the other base.
async function listProjectVideosUnder(basePath: string) {
  // 1) vidéos directement dans le project
  const direct = await listAll(`${basePath}/videos`, { per_page: 100 });
  if (direct.length) return direct;

  // 2) sinon, chercher les sous-dossiers (items => type "folder"/"project")
  const items = await listAll(`${basePath}/items`, { per_page: 100 });
  const subProjects = items.filter((it: any) => {
    const t = it?.type || it?.metadata?.connection?.type || it?.resource_type;
    // Selon les versions d’API, “project” / “folder” apparaissent
    return String(t || "").includes("project") || String(t || "").includes("folder");
  });

  if (!subProjects.length) return direct; // rien à descendre

  // 3) agréger les vidéos de chaque sous-dossier
  const all: any[] = [];
  for (const sp of subProjects) {
    const uri: string = sp?.uri || "";
    const childId = uri.split("/").pop();
    if (!childId) continue;
    const child = await listAll(`${basePath.replace(/\/projects\/[^/]+$/, "")}/projects/${childId}/videos`, {
      per_page: 100,
    }).catch(() => []);
    all.push(...child);
  }
  return all;
}

export async function fetchVimeoWorks(opts: { folderId?: string; perPage?: number }) {
  const projectId = opts?.folderId || env("VIMEO_FOLDER_ID", true) || undefined;
  if (!projectId) return [] as VimeoItem[];

  // Tentative #1: via /me/...
  try {
    const base1 = `/me/projects/${projectId}`;
    return await listProjectVideosUnder(base1);
  } catch (_) {
    // ignore -> fallback
  }

  // Tentative #2: via /users/{TEAM_ID}/...
  const teamId = env("VIMEO_TEAM_ID", true);
  if (!teamId) return [] as VimeoItem[]; // pas de team => on ne peut pas fallback
  const base2 = `/users/${teamId}/projects/${projectId}`;
  return await listProjectVideosUnder(base2);
}
