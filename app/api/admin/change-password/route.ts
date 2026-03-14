// app/api/admin/change-password/route.ts — change admin password (stored hash in config)
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { getAdminConfigUncached, setAdminConfig } from "@/lib/admin-config";

const COOKIE_NAME = "admin_session";
const SALT_LEN = 16;
const KEY_LEN = 64;

function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN);
  const key = scryptSync(password, salt, KEY_LEN);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, keyHex] = stored.split(":");
  if (!saltHex || !keyHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const key = scryptSync(password, salt, KEY_LEN);
  const storedKey = Buffer.from(keyHex, "hex");
  return timingSafeEqual(key, storedKey);
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token !== "1") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const current =
    typeof body.currentPassword === "string" ? body.currentPassword.trim() : "";
  const newPwd =
    typeof body.newPassword === "string" ? body.newPassword.trim() : "";

  if (!newPwd || newPwd.length < 6) {
    return NextResponse.json(
      { error: "Le nouveau mot de passe doit faire au moins 6 caractères" },
      { status: 400 },
    );
  }

  const config = await getAdminConfigUncached();
  const envSecret = process.env.ADMIN_SECRET?.trim();

  let currentValid = false;
  if (config.adminPasswordHash) {
    currentValid = verifyPassword(current, config.adminPasswordHash);
  } else if (envSecret && current === envSecret) {
    currentValid = true;
  }

  if (!currentValid) {
    return NextResponse.json(
      { error: "Mot de passe actuel incorrect" },
      { status: 401 },
    );
  }

  const adminPasswordHash = hashPassword(newPwd);
  await setAdminConfig({ adminPasswordHash });

  return NextResponse.json({ ok: true });
}
