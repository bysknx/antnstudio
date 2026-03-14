// app/api/admin/auth/route.ts
// Auth par mot de passe : hash en config (si défini) ou ADMIN_SECRET (env).
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { scryptSync, timingSafeEqual } from "crypto";
import { getAdminConfigUncached } from "@/lib/admin-config";

const COOKIE_NAME = "admin_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 jours
};

function verifyStoredPassword(password: string, stored: string): boolean {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const key = scryptSync(password, salt, 64);
  const storedKey = Buffer.from(keyHex, "hex");
  return timingSafeEqual(key, storedKey);
}

export async function GET() {
  const config = await getAdminConfigUncached();
  const hasAuth = config.adminPasswordHash || process.env.ADMIN_SECRET;
  if (!hasAuth) {
    return NextResponse.json({ ok: false }, { status: 501 });
  }
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const ok = token === "1";
  return NextResponse.json({ ok: !!ok });
}

export async function POST(request: Request) {
  const config = await getAdminConfigUncached();
  const envSecret = process.env.ADMIN_SECRET?.trim();
  const hasAuth = config.adminPasswordHash || envSecret;
  if (!hasAuth) {
    return NextResponse.json(
      { ok: false, error: "Admin non configuré" },
      { status: 501 },
    );
  }
  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Body invalide" },
      { status: 400 },
    );
  }
  const password =
    typeof body.password === "string" ? body.password.trim() : "";
  if (password === "") {
    return NextResponse.json(
      { ok: false, error: "Mot de passe incorrect" },
      { status: 401 },
    );
  }

  let valid = false;
  if (config.adminPasswordHash) {
    valid = verifyStoredPassword(password, config.adminPasswordHash);
  } else if (envSecret && password === envSecret) {
    valid = true;
  }

  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "Mot de passe incorrect" },
      { status: 401 },
    );
  }

  const store = await cookies();
  store.set(COOKIE_NAME, "1", COOKIE_OPTIONS);
  return NextResponse.json({ ok: true });
}
