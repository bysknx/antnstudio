// lib/parseVimeoTitle.ts

export function parseVimeoTitle(raw?: string) {
  if (!raw) return { display: "Untitled", year: null };
  // vire EXTENSIONS et suffixes communs
  let t = raw.replace(/\.(mp4|mov|mkv|avi)$/i, "");
  t = t.replace(/_?FULL$/i, "").replace(/_?FINAL$/i, "").replace(/_?V\d+$/i, "");
  // underscores -> espaces
  t = t.replace(/_/g, " ").trim();

  // année
  const m = t.match(/(?:^|\D)(20\d{2}|19\d{2})(?:\D|$)/);
  const year = m ? parseInt(m[1], 10) : null;

  return { display: t, year };
}

export function slugify(input: string) {
  return input
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
