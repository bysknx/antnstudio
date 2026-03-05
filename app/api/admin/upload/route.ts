// app/api/admin/upload/route.ts — upload vidéo (dev: .data/uploads ; prod: à brancher S3/VPS)
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const COOKIE_NAME = "admin_session";
const UPLOAD_DIR = ".data/uploads";

export async function POST(req: NextRequest) {
  const store = await cookies();
  if (store.get(COOKIE_NAME)?.value !== "1") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "FormData invalide" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
  }

  const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (!name.toLowerCase().endsWith(".mp4")) {
    return NextResponse.json({ error: "Format attendu : MP4" }, { status: 400 });
  }

  // En production (Vercel) le filesystem est read-only : utiliser S3 presigned URL ou API VPS
  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error: "Upload direct non disponible en production. Utiliser une URL S3 presignée ou un endpoint sur ton VPS.",
      },
      { status: 501 },
    );
  }

  try {
    const dir = join(process.cwd(), UPLOAD_DIR);
    await mkdir(dir, { recursive: true });
    const bytes = await file.arrayBuffer();
    const path = join(dir, name);
    await writeFile(path, new Uint8Array(bytes));
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL || "https://media.antn.studio";
    return NextResponse.json({
      ok: true,
      filename: name,
      url: `${mediaUrl}/${name}`,
      message: "Fichier enregistré dans .data/uploads. Copie-le sur ton VPS puis ajoute une entrée dans public/videos/manifest.json.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur écriture";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
