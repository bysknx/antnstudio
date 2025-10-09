// lib/parseVimeoTitle.ts
export type ParsedTitle = {
  year?: number;
  client?: string;
  title?: string;
  type?: string;           // FULL | AD | MV | SNIPPET ...
  featuredOrder?: number;  // si suffixe #n
};

const TYPE_WHITELIST = [
  "FULL", "AD", "MV", "SNIPPET", "CLIP", "CUT", "BREAKDOWN"
];

export function parseVimeoTitle(raw: string): ParsedTitle {
  const s = (raw || "").trim();

  // Cherche un suffixe du type "#3" (order)
  let featuredOrder: number | undefined;
  const orderMatch = s.match(/#(\d+)\s*$/);
  const withoutOrder = orderMatch ? s.replace(/#\d+\s*$/, "").trim() : s;
  if (orderMatch) featuredOrder = parseInt(orderMatch[1], 10);

  // Split principal par underscore
  const parts = withoutOrder.split("_").map(p => p.trim()).filter(Boolean);

  // Minimum attendu : 4 morceaux [year, client, title, type]
  // mais on est tolérants (on remplit ce qu'on peut)
  let year: number | undefined;
  if (parts[0] && /^\d{4}$/.test(parts[0])) year = parseInt(parts[0], 10);

  const client = parts[1] || undefined;
  const typeRaw = parts[parts.length - 1] || "";
  const type = TYPE_WHITELIST.includes(typeRaw.toUpperCase())
    ? typeRaw.toUpperCase()
    : undefined;

  // le titre = tout ce qui est au milieu (entre year et type)
  const titleMiddle = parts.slice(2, type ? -1 : undefined);
  const title = titleMiddle.length ? titleMiddle.join(" ") : undefined;

  return { year, client, title, type, featuredOrder };
}

export function slugify(input: string) {
  return input
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
