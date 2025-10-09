// app/api/vimeo/route.ts
import { NextResponse } from "next/server";
import { fetchVimeoWorks } from "@/lib/vimeo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RawItem = any;

function toItem(p: RawItem) {
  const id = String(p?.id ?? p?.uri?.split?.("/")?.pop?.() ?? crypto.randomUUID());
  const title = p?.title ?? p?.name ?? "Untitled";
  const created = p?.createdAt ?? p?.created_time ?? p?.release_time ?? null;
  const createdAt = created ? new Date(created).toISOString() : null;
  const year = p?.year ?? (created ? new Date(created).getFullYear() : undefined);

  const thumbFromPictures =
    p?.pictures?.sizes?.[p?.pictures?.sizes?.length - 1]?.link ??
    p?.pictures?.base_link ??
    null;

  const thumbnail = p?.thumbnail ?? p?.picture ?? p?.thumb ?? thumbFromPictures ?? "";
  const link = p?.vimeoUrl ?? p?.link ?? p?.url ?? "";
  const embed =
    p?.embed ??
    (/^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?autoplay=0&muted=1&playsinline=1` : undefined);

  return { id, title, thumbnail, link, embed, year, createdAt };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const debug = searchParams.get("debug") === "1";

  try {
    const folderId = process.env.VIMEO_FOLDER_ID || undefined;
    const list: RawItem[] = (await fetchVimeoWorks({ folderId, perPage: 200 })) ?? [];

    const items = list.map(toItem).sort((a, b) => {
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    });

    const body = debug
      ? {
          ok: true,
          count: items.length,
          env: {
            hasToken: Boolean(process.env.VIMEO_TOKEN),
            hasFolderId: Boolean(process.env.VIMEO_FOLDER_ID),
          },
          items,
        }
      : { ok: true, items };

    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    const body = {
      ok: false,
      items: [],
      error: typeof e?.message === "string" ? e.message : String(e),
    };
    if (debug) {
      (body as any).env = {
        hasToken: Boolean(process.env.VIMEO_TOKEN),
        hasFolderId: Boolean(process.env.VIMEO_FOLDER_ID),
      };
    }
    return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
  }
}
