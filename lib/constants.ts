export const WEBSITE_URL = "https://antn.studio";

/**
 * Returns the public-facing site URL, falling back to the canonical domain.
 * Normalizes env values that might omit the protocol.
 */
export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "";
  if (raw) {
    const normalized = raw.startsWith("http") ? raw : `https://${raw}`;
    return normalized.replace(/\/+$/, "");
  }
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }
  return WEBSITE_URL;
}
