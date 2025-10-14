// app/api/vimeo/route.ts
import { NextResponse } from "next/server";
import { fetchVimeoWorks } from "@/lib/vimeo";
import { parseVimeoTitle } from "@/lib/parseVimeoTitle";

export const revalidate = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const debugWanted = url.searchParams.get("debug") === "1";

  try {
    // Récup Vimeo (dossier + sous-dossiers)
    const { items, debug } = await fetchVimeoWorks({});

    // Titre propre: `Client — Titre` et année dans un champ séparé
    const mapped = items.map((it) => {
      const parsed = parseVimeoTitle(it.title || "");

      const display = parsed?.title
        ? parsed.client
          ? `${parsed.client} — ${parsed.title}`
          : parsed.title
        : it.title || "Untitled";

      const year =
        parsed?.year ??
        (it as any).year ??
        (it.createdAt ? new Date(it.createdAt).getFullYear() : undefined);

      return {
        ...it,
        title: display, // utilisé par l’iframe/clients
        year, // année isolée
      };
    });

    return NextResponse.json(
      debugWanted ? { items: mapped, __debug: debug } : { items: mapped },
    );
  } catch (e: any) {
    return NextResponse.json(
      { items: [], error: e?.message ?? "Vimeo fetch failed" },
      { status: 500 },
    );
  }
}
