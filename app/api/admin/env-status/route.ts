// app/api/admin/env-status/route.ts — expose only whether env vars are set (for Settings UI)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

const ENV_KEYS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_PUBLISHABLE_KEY",
  "VERCEL_TOKEN",
] as const;

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token !== "1") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const status: Record<string, boolean> = {};
  for (const key of ENV_KEYS) {
    const value = process.env[key];
    status[key] = Boolean(value && String(value).trim().length > 0);
  }

  return NextResponse.json(status);
}
