// app/api/vimeo/route.ts
import { NextResponse } from "next/server";
import { fetchVimeoWorks } from "@/lib/vimeo";
import { parseVimeoTitle } from "@/lib/parseVimeoTitle";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const debugFlag = searchParams.get("debug") === "1";

  try {
    const folderId = process.env.VIMEO_FOLDER_ID || undefined;
    const teamId = process.env.VIMEO_TEAM_ID || undefined;

    const { items, debug } = await fetchVimeoWorks({ folderId, teamId });

    // Tri desc par date
    items.sort((a, b) => {
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    });

    // Normalisation propre des titres et années
    const data = items.map((it: any) => {
      const raw = it.title || it.name || "";
      const pretty = parseVimeoTitle(raw);
      return {
        ...it,
        title: pretty.display, // utilisé par l’iframe
        year:
          it.year ||
          pretty.year ||
          (it.created_time ? new Date(it.created_time).getFullYear() : null),
      };
    });

    if (debugFlag) {
      return NextResponse.json(
        {
          ok: true,
          count: data.length,
          env: {
            token: !!process.env.VIMEO_TOKEN,
            teamId: process.env.VIMEO_TEAM_ID || null,
            folderId: process.env.VIMEO_FOLDER_ID || null,
          },
          tried: debug.tried,
          sample: data.slice(0, 2),
          items: data,
        },
        { headers: { "Cache-Control": "no-store" } }
      );
    }

    // Réponse standard
    return NextResponse.json(
      { ok: true, items: data },
      { headers: { "Cache-Control": "no-store" } }
    );
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
