// lib/vimeo.ts
const API = "https://api.vimeo.com";

type ListOpts = { folderId?: string; perPage?: number };

function env(name: string, optional = false) {
  const v = process.env[name];
  if (!v && !optional) throw new Error(`Missing env: ${name}`);
  return v || "";
}

async function vimeoFetch(path: string, init: RequestInit = {}) {
  const token = env("VIMEO_TOKEN");
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `bearer ${token}`,
      Accept: "application/vnd.vimeo.*+json;version=3.4",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Vimeo ${res.status}: ${res.statusText} • ${text}`);
  }
  return res.json();
}

/**
 * Vimeo pagination helper. Follows `paging.next` links until completion.
 */
async function listAll(path: string): Promise<any[]> {
  let out: any[] = [];
  let next: string | null = path;

  while (next) {
    const page = await vimeoFetch(next);
    const data = Array.isArray(page?.data) ? page.data : [];
    out = out.concat(data);

    const nextHref: string | undefined = page?.paging?.next;
    // paging.next is a full URL; convert to path for our fetcher
    if (nextHref) {
      const url = new URL(nextHref);
      next = url.pathname + url.search;
    } else {
      next = null;
    }
  }
  return out;
}

/**
 * Get videos from a folder (project). If the folder is empty because
 * content lives in sub-folders (e.g., 2023/2024/2025), we fall back
 * to all videos for the team/user.
 */
export async function fetchVimeoWorks(opts: ListOpts = {}) {
  const perPage = Math.max(1, Math.min(200, opts.perPage ?? 100));
  const teamId = env("VIMEO_TEAM_ID", true) || "me";

  // 1) If folderId provided, try to list its direct videos
  if (opts.folderId) {
    const direct = await listAll(
      `/users/${teamId}/projects/${opts.folderId}/videos?per_page=${perPage}&sort=date&direction=desc`
    );
    if (direct.length > 0) return direct;

    // Optional: if you later want to recurse into subfolders, list them here
    // and aggregate. For now we keep it simple and fall back below.
  }

  // 2) Fallback: list all videos for the account (ignores folder structure)
  const all = await listAll(
    `/users/${teamId}/videos?per_page=${perPage}&sort=date&direction=desc`
  );
  return all;
}
