"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      const form = e.currentTarget;
      const passwordInput = form.elements.namedItem("password");
      const passwordValue =
        passwordInput && "value" in passwordInput ? String(passwordInput.value) : "";
      try {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: passwordValue }),
        });
        const data = await res.json();
        if (data.ok) {
          onSuccess();
          return;
        }
        setError(data.error || "Échec de connexion");
      } catch {
        setError("Erreur réseau");
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  return (
    <div className="mx-auto flex min-h-[60svh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-xl font-semibold text-zinc-100">
        Admin antn.studio
      </h1>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm text-zinc-400">
          Mot de passe
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-white/10 bg-zinc-900/80 px-3 py-2 text-zinc-100"
            autoComplete="current-password"
            required
          />
        </label>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Accéder à l’admin"}
        </button>
      </form>
      <p className="mt-6 text-xs text-zinc-500">
        Configure <code className="rounded bg-zinc-800 px-1">ADMIN_SECRET</code>{" "}
        dans ton .env.local pour activer l’accès.
      </p>
    </div>
  );
}

type VideoEntry = { id: string; title: string; filename?: string; year?: number };

function AdminDashboard() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [config, setConfig] = useState<{
    featuredIds: string[];
    visibility: Record<string, boolean>;
    hasFeaturedOverride?: boolean;
  }>({
    featuredIds: [],
    visibility: {},
    hasFeaturedOverride: false,
  });
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ ok: boolean; message?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/vimeo", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/config", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([vimeo, cfg]) => {
      if (cancelled) return;
      const items = Array.isArray(vimeo?.items) ? vimeo.items : [];
      setVideos(
        items.map(
          (v: {
            id: string;
            title: string;
            filename?: string;
            year?: number;
          }) => ({
            id: v.id,
            title: v.title,
            filename: v.filename,
            year: v.year,
          }),
        ),
      );
      setConfig({
        featuredIds: Array.isArray(cfg?.featuredIds) ? cfg.featuredIds : [],
        visibility:
          cfg?.visibility && typeof cfg.visibility === "object"
            ? cfg.visibility
            : {},
        hasFeaturedOverride:
          typeof cfg?.hasFeaturedOverride === "boolean" ? cfg.hasFeaturedOverride : false,
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultFive = videos
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 5)
    .map((v) => v.id);
  const featuredOrder =
    config.hasFeaturedOverride && config.featuredIds.length > 0
      ? [...config.featuredIds]
      : config.hasFeaturedOverride && config.featuredIds.length === 0
        ? []
        : defaultFive;
  const setFeaturedOrder = (ids: string[]) =>
    setConfig((c) => ({ ...c, featuredIds: ids, hasFeaturedOverride: true }));

  const moveFeatured = (index: number, dir: 1 | -1) => {
    const next = [...featuredOrder];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setFeaturedOrder(next);
  };

  const addToFeatured = (id: string) => {
    if (featuredOrder.includes(id)) return;
    setFeaturedOrder([...featuredOrder, id]);
  };

  const removeFromFeatured = (index: number) => {
    setFeaturedOrder(featuredOrder.filter((_, i) => i !== index));
  };

  const notInFeatured = videos.filter((v) => !featuredOrder.includes(v.id));

  const toggleVisibility = (id: string) => {
    setConfig((c) => ({
      ...c,
      visibility: { ...c.visibility, [id]: c.visibility[id] === false },
    }));
  };
  const isVisible = (id: string) => config.visibility[id] !== false;

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.ok) {
        setUploadResult({ ok: true, message: data.message || "Fichier enregistré." });
        input.value = "";
        const vimeoRes = await fetch("/api/vimeo", { cache: "no-store" });
        const vimeo = await vimeoRes.json();
        if (Array.isArray(vimeo?.items)) {
          setVideos(
            vimeo.items.map((v: VideoEntry) => ({
              id: v.id,
              title: v.title,
              filename: v.filename,
              year: v.year,
            })),
          );
        }
      } else {
        setUploadResult({ ok: false, message: data.error || "Échec upload" });
      }
    } catch {
      setUploadResult({ ok: false, message: "Erreur réseau" });
    } finally {
      setUploading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setSaveOk(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredIds: featuredOrder,
          visibility: videos.reduce((acc, v) => {
            acc[v.id] = isVisible(v.id);
            return acc;
          }, {} as Record<string, boolean>),
          hasFeaturedOverride: config.hasFeaturedOverride ?? true,
        }),
      });
      if (res.ok) {
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-semibold text-zinc-100">
          Admin — antn.studio
        </h1>
        <button
          type="button"
          onClick={saveConfig}
          disabled={saving}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : saveOk ? "Enregistré" : "Enregistrer la config"}
        </button>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-200">
          Vidéos VPS (media.antn.studio)
        </h2>
        <p className="max-w-xl text-sm text-zinc-400">
          Liste du contenu sur le VPS et upload de nouvelles vidéos. À brancher
          sur ton API ou script d’upload (ex. presigned URL S3, ou API custom
          sur le VPS). Format web recommandé : H.264/MP4, compression adaptée.
        </p>
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4">
          <ul className="text-sm text-zinc-400 space-y-1 max-h-48 overflow-y-auto font-mono">
            {videos.map((v) => (
              <li key={v.id} className="flex justify-between gap-2">
                <span className="truncate">{v.filename || v.title}</span>
                <span className="text-zinc-500 shrink-0">{v.year ?? "—"}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={handleUpload} className="mt-3 flex flex-wrap items-end gap-2">
            <label className="flex-1 min-w-[180px]">
              <span className="sr-only">Fichier MP4</span>
              <input
                type="file"
                accept=".mp4,video/mp4"
                className="block w-full text-sm text-zinc-400 file:mr-2 file:rounded file:border-0 file:bg-white file:px-3 file:py-1 file:text-black"
              />
            </label>
            <button
              type="submit"
              disabled={uploading}
              className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/20 disabled:opacity-50"
            >
              {uploading ? "Envoi…" : "Envoyer"}
            </button>
          </form>
          {uploadResult && (
            <p className={`mt-2 text-xs ${uploadResult.ok ? "text-emerald-500" : "text-red-400"}`}>
              {uploadResult.message}
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-500">
            En local : fichier enregistré dans <code className="rounded bg-zinc-800 px-1">.data/uploads</code>. En prod : brancher S3 ou API VPS.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-200">
          Featured (home page)
        </h2>
        <p className="max-w-xl text-sm text-zinc-400">
          Ordre des vidéos dans le hero de la home (les 5 premières = affichées).
        </p>
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4">
          <ul className="space-y-1">
            {featuredOrder.map((id, i) => {
              const v = videos.find((x) => x.id === id);
              return (
                <li
                  key={id}
                  className="flex items-center gap-2 py-1.5 text-sm text-zinc-300"
                >
                  <span className="w-6 text-zinc-500 tabular-nums">{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => moveFeatured(i, -1)}
                    disabled={i === 0}
                    className="rounded p-0.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                    aria-label="Monter"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFeatured(i, 1)}
                    disabled={i >= featuredOrder.length - 1}
                    className="rounded p-0.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    ↓
                  </button>
                  <span className="truncate flex-1">{v?.title ?? id}</span>
                  {i < 5 && <span className="text-xs text-emerald-500/80">hero</span>}
                  <button
                    type="button"
                    onClick={() => removeFromFeatured(i)}
                    className="rounded p-0.5 text-zinc-500 hover:text-red-400 text-xs"
                    aria-label="Retirer"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
          {notInFeatured.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <label className="text-xs text-zinc-500 block mb-1">Ajouter au featured</label>
              <select
                className="w-full rounded bg-zinc-800 border border-white/10 text-zinc-200 text-sm p-1.5"
                value=""
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) addToFeatured(id);
                  e.target.value = "";
                }}
              >
                <option value="">— choisir —</option>
                {notInFeatured.map((v) => (
                  <option key={v.id} value={v.id}>{v.title}</option>
                ))}
              </select>
            </div>
          )}
          {featuredOrder.length === 0 && (
            <p className="text-zinc-500 text-sm">Chargement…</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-200">
          Projets publics
        </h2>
        <p className="max-w-xl text-sm text-zinc-400">
          Visibilité de chaque vidéo sur la grille /projects.
        </p>
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4 max-h-64 overflow-y-auto">
          <ul className="space-y-2">
            {videos.map((v) => (
              <li key={v.id} className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  id={`vis-${v.id}`}
                  checked={isVisible(v.id)}
                  onChange={() => toggleVisibility(v.id)}
                  className="rounded border-white/20 bg-zinc-800 text-white"
                />
                <label htmlFor={`vis-${v.id}`} className="truncate flex-1 cursor-pointer text-zinc-300">
                  {v.title}
                </label>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-200">
          Versions clients (v1, v2…)
        </h2>
        <p className="max-w-xl text-sm text-zinc-400">
          Upload de versions de travail pour les clients : liens privés, section
          commentaires et téléchargement possible.
        </p>
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-6 text-zinc-500 text-sm">
          À venir : projets privés, commentaires, lien de téléchargement. Nécessite
          un backend (stockage fichiers + métadonnées, auth par lien secret).
        </div>
      </section>

      <p className="text-xs text-zinc-500">
        Config enregistrée dans <code className="rounded bg-zinc-800 px-1">.data/</code> en local.
        En production (ex. Vercel), prévoir un stockage (DB ou Vercel KV) pour persister featured et visibilité.
      </p>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setAuthenticated(!!data.ok);
      })
      .catch(() => {
        if (!cancelled) setAuthenticated(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSuccess = useCallback(() => {
    setAuthenticated(true);
    router.refresh();
  }, [router]);

  if (authenticated === null) {
    return (
      <main className="flex min-h-[50svh] items-center justify-center">
        <p className="text-zinc-500">Chargement…</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main>
        <LoginForm onSuccess={handleSuccess} />
      </main>
    );
  }

  return (
    <main>
      <AdminDashboard />
    </main>
  );
}
