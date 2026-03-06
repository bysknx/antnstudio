// app/api/admin/auth/route.ts
// Protection basique par mot de passe (ADMIN_SECRET). Pour une vraie auth, prévoir NextAuth ou équivalent.
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 jours
};

export async function GET() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return NextResponse.json({ ok: false }, { status: 501 });
  }
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  const ok = token === "1";
  return NextResponse.json({ ok: !!ok });
}

export async function POST(request: Request) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
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
  if (password === "" || password !== secret.trim()) {
    return NextResponse.json(
      { ok: false, error: "Mot de passe incorrect" },
      { status: 401 },
    );
  }
  const store = await cookies();
  store.set(COOKIE_NAME, "1", COOKIE_OPTIONS);
  return NextResponse.json({ ok: true });
}
