// app/api/vimeo/route.ts
import { NextResponse } from "next/server";
import { fetchVimeoWorks } from "@/lib/vimeo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const debug = searchParams.get("debug") === "1";

  try {
    const folderId = process.env.VIMEO_FOLDER_ID || undefined;
    const teamId = process.env.VIMEO_TEAM_ID || undefined;

    const raw = await fetchVimeoWorks({ folderId, teamId });

    // Tri date desc
    const items = raw.sort((a, b) => {
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    });

    const body = debug
      ? {
          ok: true,
          count: items.length,
          env: {
            hasToken: !!process.env.VIMEO_TOKEN,
            teamId,
            folderId,
          },
          items,
        }
      : { ok: true, items };

    return NextResponse.json(body, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e: any) {
    const body = {
      ok: false,
      items: [],
      error: e?.message || String(e),
      env: {
        hasToken: !!process.env.VIMEO_TOKEN,
        teamId: process.env.VIMEO_TEAM_ID || null,
        folderId: process.env.VIMEO_FOLDER_ID || null,
      },
    };
    return NextResponse.json(body, {
      status: 200, // on renvoie 200 pour que l’iframe puisse lire le message d’erreur
      headers: { "Cache-Control": "no-store" },
    });
  }
}
