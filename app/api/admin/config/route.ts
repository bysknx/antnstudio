// app/api/admin/config/route.ts — lecture / écriture config admin (featured, visibility, projectMeta)
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAdminConfig,
  setAdminConfig,
  type AdminConfig,
} from "@/lib/admin-config";

const COOKIE_NAME = "admin_session";

export async function GET() {
  const config = await getAdminConfig();
  const { adminPasswordHash: _, ...safe } = config;
  return NextResponse.json(safe);
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token !== "1") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: Partial<AdminConfig> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const { adminPasswordHash: _pw, ...safeBody } = body;
  const config = await setAdminConfig(safeBody);
  const { adminPasswordHash: __, ...safe } = config;
  return NextResponse.json(safe);
}
