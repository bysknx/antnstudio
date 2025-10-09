// app/api/vimeo/route.ts
import { NextResponse } from "next/server";
import { fetchVimeoWorks } from "@/lib/vimeo";

export const revalidate = 3600; // ISR 1h

export async function GET() {
  try {
    const folderId = process.env.VIMEO_FOLDER_ID;
    const list = await fetchVimeoWorks({ folderId, perPage: 200 });

    // Tri par date desc par défaut
    list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    return NextResponse.json({ ok: true, items: list });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
