// app/api/vimeo/route.ts
import { NextResponse } from "next/server";
import { fetchVimeoWorks } from "@/lib/vimeo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const debugFlag = searchParams.get("debug") === "1";

  try {
    const folderId = process.env.VIMEO_FOLDER_ID || undefined;
    // 👇 correction ici (le point après env)
    const teamId =
      process.env.VIMEO_TEAM_ID || undefined; // tolérant

    const { items, debug } = await fetchVimeoWorks({ folderId, teamId });

    // Tri desc par date
    items.sort((a, b) => {
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    });

    const body = debugFlag
      ? {
          ok: true,
          count: items.length,
          env: {
            token: !!process.env.VIMEO_TOKEN,
            teamId: process.env.VIMEO_TEAM_ID || null,
            folderId: process.env.VIMEO_FOLDER_ID || null,
          },
          tried: debug.tried,
          sample: items.slice(0, 2),
          items,
        }
      : { ok: true, items };

    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        items: [],
        error: e?.message || String(e),
        env: {
          token: !!process.env.VIMEO_TOKEN,
          teamId: process.env.VIMEO_TEAM_ID || null,
          folderId: process.env.VIMEO_FOLDER_ID || null,
        },
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  }
}
