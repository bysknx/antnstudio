// app/api/admin/config/route.ts — lecture / écriture config admin (featured, visibility)
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminConfig, setAdminConfig } from "@/lib/admin-config";

const COOKIE_NAME = "admin_session";

export async function GET() {
  const config = await getAdminConfig();
  return NextResponse.json(config);
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token !== "1") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: {
    featuredIds?: string[];
    visibility?: Record<string, boolean>;
    hasFeaturedOverride?: boolean;
    siteConfig?: { title?: string; description?: string; ogImage?: string; analyticsId?: string };
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const config = await setAdminConfig(body);
  return NextResponse.json(config);
}
