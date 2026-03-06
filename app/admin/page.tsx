"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ADMIN_ASCII =
  "                   ░██                 ░██           \n" +
  "                  ░██                               \n" +
  " ░██████    ░████████ ░█████████████  ░██░████████  \n" +
  "      ░██  ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ \n" +
  " ░███████  ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ \n" +
  "░██   ░██  ░██   ░███ ░██   ░██   ░██ ░██░██    ░██ \n" +
  " ░█████░██  ░█████░██ ░██   ░██   ░██ ░██░██    ░██ \n";

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
      <div className="mb-6 flex flex-col items-center">
        <pre
          className="text-center whitespace-pre font-mono text-zinc-100 text-sm leading-tight"
          style={{ fontFamily: "ui-monospace, monospace" }}
          aria-hidden
        >
          {ADMIN_ASCII}
        </pre>
      </div>
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
          {loading ? "Connexion…" : "access"}
        </button>
      </form>
    </div>
  );
}

type VideoEntry = { id: string; title: string; filename?: string; year?: number };

type SiteConfig = { title?: string; description?: string; ogImage?: string; analyticsId?: string };

type AdminConfigState = {
  featuredIds: string[];
  visibility: Record<string, boolean>;
  hasFeaturedOverride?: boolean;
  siteConfig?: SiteConfig;
};

function UploadOverlay({
  open,
  onClose,
  onUploaded,
}: {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message?: string } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setResult(null);
      try {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.ok) {
          setResult({ ok: true, message: data.message || "Fichier enregistré." });
          onUploaded();
          setTimeout(() => {
            onClose();
          }, 800);
        } else {
          setResult({ ok: false, message: data.error || "Échec upload" });
        }
      } catch {
        setResult({ ok: false, message: "Erreur réseau" });
      } finally {
        setUploading(false);
      }
    },
    [onClose, onUploaded],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("video/")) doUpload(file);
    },
    [doUpload],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) doUpload(file);
      e.target.value = "";
    },
    [doUpload],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-300"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`flex flex-col items-center justify-center px-12 py-16 transition-colors ${
          dragOver ? "border-white/30" : "border-white/10"
        } border-2 border-dashed rounded-lg`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,video/mp4,video/webm"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/60 mb-4"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-zinc-400 text-sm mb-2">
          {uploading ? "Envoi…" : "Cliquez ou déposez un fichier vidéo"}
        </p>
        {result && (
          <p className={`text-xs ${result.ok ? "text-emerald-500" : "text-red-400"}`}>
            {result.message}
          </p>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"media" | "config">("media");
  const [uploadOverlayOpen, setUploadOverlayOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [config, setConfig] = useState<AdminConfigState>({
    featuredIds: [],
    visibility: {},
    hasFeaturedOverride: false,
    siteConfig: {},
  });
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/vimeo", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/config", { cache: "no-store" }).then((r) => r.json()),
    ]).then(([vimeo, cfg]) => {
      const items = Array.isArray(vimeo?.items) ? vimeo.items : [];
      setVideos(
        items.map(
          (v: { id: string; title: string; filename?: string; year?: number }) => ({
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
          cfg?.visibility && typeof cfg.visibility === "object" ? cfg.visibility : {},
        hasFeaturedOverride:
          typeof cfg?.hasFeaturedOverride === "boolean" ? cfg.hasFeaturedOverride : false,
        siteConfig: cfg?.siteConfig ?? {},
      });
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const toggleVisibility = (id: string) => {
    setConfig((c: AdminConfigState) => ({
      ...c,
      visibility: { ...c.visibility, [id]: c.visibility[id] === false },
    }));
  };
  const isVisible = (id: string) => config.visibility[id] !== false;

  const toggleFeatured = (id: string) => {
    const isFeatured = featuredOrder.includes(id);
    let next: string[];
    if (isFeatured) {
      next = featuredOrder.filter((x: string) => x !== id);
    } else {
      next = [...featuredOrder, id];
    }
    setConfig((c: AdminConfigState) => ({
      ...c,
      featuredIds: next,
      hasFeaturedOverride: true,
    }));
  };

  const sortedVideos = [...videos].sort((a: VideoEntry, b: VideoEntry) => {
    if (sortBy === "name") return (a.title ?? "").localeCompare(b.title ?? "");
    return (b.year ?? 0) - (a.year ?? 0);
  });

  const saveMediaConfig = async () => {
    setSaving(true);
    setSaveOk(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredIds: featuredOrder,
          visibility: videos.reduce((acc: Record<string, boolean>, v: VideoEntry) => {
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

  const saveSiteConfig = async (siteConfig: SiteConfig) => {
    setSaving(true);
    setSaveOk(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteConfig }),
      });
      if (res.ok) {
        setConfig((c: AdminConfigState) => ({ ...c, siteConfig }));
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header + tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
        <div className="flex items-center gap-6">
          <h1 className="text-xl font-semibold text-zinc-100">Admin</h1>
          <nav className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                activeTab === "media"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Media
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("config")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                activeTab === "config"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Config
            </button>
          </nav>
          <Link
            href="/admin/review"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Review
          </Link>
        </div>
        {activeTab === "media" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveMediaConfig}
              disabled={saving}
              className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/20 disabled:opacity-50"
            >
              {saving ? "…" : saveOk ? "Enregistré" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setUploadOverlayOpen(true)}
              className="rounded-full p-2 bg-white/10 hover:bg-white/20 transition"
              aria-label="Upload"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {activeTab === "media" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Tri :</span>
            <button
              type="button"
              onClick={() => setSortBy("name")}
              className={`text-xs px-2 py-1 rounded ${sortBy === "name" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Nom
            </button>
            <button
              type="button"
              onClick={() => setSortBy("date")}
              className={`text-xs px-2 py-1 rounded ${sortBy === "date" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
            >
              Date
            </button>
          </div>
          <ul className="rounded-lg border border-white/10 bg-zinc-900/50 divide-y divide-white/5">
            {sortedVideos.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-white/5 transition"
              >
                <span className="flex-1 truncate font-mono text-zinc-300">
                  {v.filename || v.title}
                </span>
                <span className="text-zinc-500 shrink-0">{v.year ?? "—"}</span>
                <label className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-500">Public</span>
                  <input
                    type="checkbox"
                    checked={isVisible(v.id)}
                    onChange={() => toggleVisibility(v.id)}
                    className="rounded border-white/20 bg-zinc-800 text-white"
                  />
                </label>
                <label className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-500">Featured</span>
                  <input
                    type="checkbox"
                    checked={featuredOrder.includes(v.id)}
                    onChange={() => toggleFeatured(v.id)}
                    className="rounded border-white/20 bg-zinc-800 text-white"
                  />
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "config" && (
        <ConfigTab
          siteConfig={config.siteConfig ?? {}}
          onSave={saveSiteConfig}
          saving={saving}
          saveOk={saveOk}
        />
      )}

      <UploadOverlay
        open={uploadOverlayOpen}
        onClose={() => setUploadOverlayOpen(false)}
        onUploaded={loadData}
      />
    </div>
  );
}

function ConfigTab({
  siteConfig,
  onSave,
  saving,
  saveOk,
}: {
  siteConfig: SiteConfig;
  onSave: (c: SiteConfig) => Promise<void>;
  saving: boolean;
  saveOk: boolean;
}) {
  const [title, setTitle] = useState(siteConfig.title ?? "");
  const [description, setDescription] = useState(siteConfig.description ?? "");
  const [ogImage, setOgImage] = useState(siteConfig.ogImage ?? "");
  const [analyticsId, setAnalyticsId] = useState(siteConfig.analyticsId ?? "");

  useEffect(() => {
    setTitle(siteConfig.title ?? "");
    setDescription(siteConfig.description ?? "");
    setOgImage(siteConfig.ogImage ?? "");
    setAnalyticsId(siteConfig.analyticsId ?? "");
  }, [siteConfig]);

  const handleSave = () => {
    onSave({
      title: title || undefined,
      description: description || undefined,
      ogImage: ogImage || undefined,
      analyticsId: analyticsId || undefined,
    });
  };

  return (
    <div className="space-y-8 max-w-xl">
      <section>
        <h2 className="text-sm font-medium text-zinc-300 mb-3">SEO</h2>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-zinc-500 block mb-1">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200"
              placeholder="antn.studio — Anthony"
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500 block mb-1">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200"
              placeholder="Front-end & DA minimale..."
            />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500 block mb-1">OG Image</span>
            <input
              type="text"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full rounded border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200"
              placeholder="/cover.jpg"
            />
          </label>
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Analytics</h2>
        <label className="block">
          <span className="text-xs text-zinc-500 block mb-1">Tracking ID (ex. GA4)</span>
          <input
            type="text"
            value={analyticsId}
            onChange={(e) => setAnalyticsId(e.target.value)}
            className="w-full rounded border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200"
            placeholder="G-XXXXXXXXXX"
          />
        </label>
      </section>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
      >
        {saving ? "Enregistrement…" : saveOk ? "Enregistré" : "Enregistrer"}
      </button>
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
