// lib/admin-config.ts — config admin (featured, visibility) lue depuis fichier ou défauts

import { cache } from "react";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export type SiteConfig = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogTitle?: string;
  canonical?: string;
  analyticsId?: string;
  gtmId?: string;
  trackingEvents?: string;
  preloadStrategy?: string;
  lazyLoad?: boolean;
  instagramUrl?: string;
  tiktokUrl?: string;
};

export type AdminConfig = {
  featuredIds: string[];
  visibility: Record<string, boolean>;
  hasFeaturedOverride?: boolean;
  siteConfig?: SiteConfig;
};

const DEFAULT_SITE_CONFIG: SiteConfig = {
  title: "antn.studio — Anthony",
  description:
    "Front-end & DA minimale. Expériences web sobres, performantes, accessibles.",
  ogImage: "/cover.jpg",
  ogTitle: "",
  canonical: "",
  analyticsId: "",
  gtmId: "",
  trackingEvents: "",
  preloadStrategy: "auto",
  lazyLoad: false,
  instagramUrl: "https://www.instagram.com/antnstudio/",
  tiktokUrl: "https://www.tiktok.com/@antnstudio",
};

const DEFAULT_CONFIG: AdminConfig = {
  featuredIds: [],
  visibility: {},
  hasFeaturedOverride: false,
  siteConfig: DEFAULT_SITE_CONFIG,
};

const CONFIG_FILENAME = "admin-config.json";
const DATA_DIR = ".data";

function dataPath(): string {
  return join(process.cwd(), DATA_DIR, CONFIG_FILENAME);
}

async function getAdminConfigUncached(): Promise<AdminConfig> {
  try {
    const path = dataPath();
    const raw = await readFile(path, "utf-8");
    const data = JSON.parse(raw) as Partial<AdminConfig>;
    // Old configs without hasFeaturedOverride: treat as no override (fallback to default 5).
    // Otherwise empty featuredIds would be treated as "override with zero" incorrectly.
    const hasStoredOverride = Object.prototype.hasOwnProperty.call(
      data,
      "hasFeaturedOverride",
    );
    const hasFeaturedOverride = hasStoredOverride
      ? Boolean(data.hasFeaturedOverride)
      : false;
    const siteConfig =
      data.siteConfig && typeof data.siteConfig === "object"
        ? { ...DEFAULT_SITE_CONFIG, ...data.siteConfig }
        : DEFAULT_SITE_CONFIG;

    return {
      featuredIds: Array.isArray(data.featuredIds)
        ? data.featuredIds
        : DEFAULT_CONFIG.featuredIds,
      visibility:
        data.visibility && typeof data.visibility === "object"
          ? data.visibility
          : DEFAULT_CONFIG.visibility,
      hasFeaturedOverride,
      siteConfig,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

/** Dedupe par requête (React cache) pour accélérer home + projects */
export const getAdminConfig = cache(getAdminConfigUncached);

export async function setAdminConfig(
  config: Partial<AdminConfig>,
): Promise<AdminConfig> {
  const current = await getAdminConfigUncached();
  const next: AdminConfig = {
    featuredIds: config.featuredIds ?? current.featuredIds,
    visibility: config.visibility ?? current.visibility,
    hasFeaturedOverride:
      config.hasFeaturedOverride !== undefined
        ? config.hasFeaturedOverride
        : config.featuredIds !== undefined
          ? true
          : current.hasFeaturedOverride,
    siteConfig:
      config.siteConfig !== undefined
        ? {
            ...DEFAULT_SITE_CONFIG,
            ...current.siteConfig,
            ...config.siteConfig,
          }
        : (current.siteConfig ?? DEFAULT_SITE_CONFIG),
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
