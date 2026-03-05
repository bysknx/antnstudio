// lib/admin-config.ts — config admin (featured, visibility) lue depuis fichier ou défauts

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export type AdminConfig = {
  featuredIds: string[];
  visibility: Record<string, boolean>;
  hasFeaturedOverride?: boolean;
};

const DEFAULT_CONFIG: AdminConfig = {
  featuredIds: [],
  visibility: {},
  hasFeaturedOverride: false,
};

const CONFIG_FILENAME = "admin-config.json";
const DATA_DIR = ".data";

function dataPath(): string {
  return join(process.cwd(), DATA_DIR, CONFIG_FILENAME);
}

export async function getAdminConfig(): Promise<AdminConfig> {
  try {
    const path = dataPath();
    const raw = await readFile(path, "utf-8");
    const data = JSON.parse(raw) as Partial<AdminConfig>;
    // Old configs without hasFeaturedOverride: treat as no override (fallback to default 5).
    // Otherwise empty featuredIds would be treated as "override with zero" incorrectly.
    const hasStoredOverride = Object.prototype.hasOwnProperty.call(data, "hasFeaturedOverride");
    const hasFeaturedOverride = hasStoredOverride ? Boolean(data.hasFeaturedOverride) : false;
    return {
      featuredIds: Array.isArray(data.featuredIds) ? data.featuredIds : DEFAULT_CONFIG.featuredIds,
      visibility: data.visibility && typeof data.visibility === "object" ? data.visibility : DEFAULT_CONFIG.visibility,
      hasFeaturedOverride,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export async function setAdminConfig(config: Partial<AdminConfig>): Promise<AdminConfig> {
  const current = await getAdminConfig();
  const next: AdminConfig = {
    featuredIds: config.featuredIds ?? current.featuredIds,
    visibility: config.visibility ?? current.visibility,
    hasFeaturedOverride:
      config.hasFeaturedOverride !== undefined
        ? config.hasFeaturedOverride
        : config.featuredIds !== undefined
          ? true
          : current.hasFeaturedOverride,
  };
  try {
    const dir = join(process.cwd(), DATA_DIR);
    await mkdir(dir, { recursive: true });
    await writeFile(dataPath(), JSON.stringify(next, null, 2), "utf-8");
  } catch {
    // En production (Vercel) le filesystem est read-only, on ne fait que retourner la config en mémoire
  }
  return next;
}
