// lib/parseVimeoTitle.ts
export function parseVimeoTitle(input: string): { client?: string; title?: string; year?: number } {
  if (!input) return {};
  // supprime un éventuel "YYYY " au début
  const stripped = input.replace(/^\s*(19|20)\d{2}\s*[-_]?/i, "").trim();

  // “Client - Titre” ou “Client — Titre”
  const m = stripped.match(/^(.*?)\s*[—-]\s*(.+)$/);
  const client = m?.[1]?.trim();
  const title = (m?.[2] || stripped).trim();

  // prend une année n'importe où
  const y = input.match(/(19|20)\d{2}/)?.[0];
  const year = y ? parseInt(y, 10) : undefined;

  return { client, title, year };
}
