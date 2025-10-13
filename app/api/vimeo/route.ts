// app/api/vimeo/route.ts
import { NextResponse } from "next/server";
import { getVimeoItems } from "@/lib/vimeo";
import { parseVimeoTitle } from "@/lib/parseVimeoTitle";

export const revalidate = 0;

export async function GET() {
  try {
    const raw = await getVimeoItems();

    const items = (Array.isArray(raw?.items) ? raw.items : []).map((it: any) => {
      const pretty = parseVimeoTitle(it?.title || it?.name || "");

      // Build the display title: "Client — Title" (no year prefix)
      const display =
        pretty?.title
          ? pretty.client
            ? `${pretty.client} — ${pretty.title}`
            : pretty.title
          : it?.title || it?.name || "Untitled";

      // Try to keep a year, but never prepend it to title
      const year =
        it?.year ??
        pretty?.year ??
        (it?.createdAt ? new Date(it.createdAt).getFullYear() : undefined) ??
        (it?.created_time ? new Date(it.created_time).getFullYear() : undefined);

      return {
        ...it,
        title: display,        // ✅ no more ".display"
        year,
      };
    });

    return NextResponse.json({ ok: true, count: items.length, items });
  } catch (e) {
    return NextResponse.json({ ok: false, items: [] }, { status: 200 });
  }
}
