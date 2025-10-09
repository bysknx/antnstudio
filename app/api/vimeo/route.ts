// app/api/vimeo/route.ts
import { NextResponse } from "next/server";
import { fetchVimeoWorks } from "@/lib/vimeo";

// Forcer l'exécution serveur Node et empêcher tout cache côté route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type RawItem = any;

function toItem(p: RawItem) {
  // Normalisation défensive
  const id =
    String(p?.id ?? p?.uri?.split?.("/")?.pop?.() ?? crypto.randomUUID());
  const title = p?.title ?? p?.name ?? "Untitled";
  const created =
    p?.createdAt ?? p?.created_time ?? p?.release_time ?? null;
  const createdAt = created ? new Date(created).toISOString() : null;
  const year =
    p?.year ??
    (created ? new Date(created).getFullYear() : undefined);

  const thumbFromPictures =
    p?.pictures?.sizes?.[p?.pictures?.sizes?.length - 1]?.link ??
    p?.pictures?.base_link ??
    null;

  const thumbnail =
    p?.thumbnail ?? p?.picture ?? p?.thumb ?? thumbFromPictures ?? "";

  const link = p?.vimeoUrl ?? p?.link ?? p?.url ?? "";
  const embed =
    p?.embed ??
    (id && /^\d+$/.test(id)
      ? `https://player.vimeo.com/video/${id}?autoplay=0&muted=1&playsinline=1`
      : undefined);

  return { id, title, thumbnail, link, embed, year, createdAt };
}

export async function GET() {
  try {
    const folderId = process.env.VIMEO_FOLDER_ID || undefined;
    // Token requis côté lib (VIMEO_TOKEN doit être présent en Production)
    const list: RawItem[] =
      (await fetchVimeoWorks({ folderId, perPage: 200 })) ?? [];

    // Normalise + tri desc par date (fallback: laisse l'ordre)
    const items = list.map(toItem).sort((a, b) => {
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    });

    return NextResponse.json(
      { ok: true, items },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (e: any) {
    // On reste en 200 pour que le client affiche un message propre sans throw
    return NextResponse.json(
      {
        ok: false,
        items: [],
        error:
          typeof e?.message === "string"
            ? e.message
            : "Vimeo fetch failed (check VIMEO_TOKEN / folder id).",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}
