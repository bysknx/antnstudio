"use client";

import { useCallback, useRef, useState } from "react";
import type { SiteConfig } from "@/lib/admin-config";

const ADMIN_ASCII =
  "                   ░██                 ░██           \n" +
  "                  ░██                               \n" +
  " ░██████    ░████████ ░█████████████  ░██░████████  \n" +
  "      ░██  ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ \n" +
  " ░███████  ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ \n" +
  "░██   ░██  ░██   ░███ ░██   ░██   ░██ ░██░██    ░██ \n" +
  " ░█████░██  ░█████░██ ░██   ░██   ░██ ░██░██    ░██ \n";

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
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
        passwordInput && "value" in passwordInput
          ? String(passwordInput.value)
          : "";
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

type VideoEntry = {
  id: string;
  title: string;
  filename?: string;
  year?: number;
  url?: string;
};

type AdminConfigState = {
  featuredIds: string[];
  visibility: Record<string, boolean>;
  hasFeaturedOverride?: boolean;
  siteConfig?: SiteConfig;
};

function MediaReviewOverlay({
  video,
  onClose,
}: {
  video: VideoEntry | null;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<
    { id: string; text: string; timecode: number }[]
  >([]);
  const [newComment, setNewComment] = useState("");
  const [timecode, setTimecode] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const captureTimecode = () => {
    const t = videoRef.current?.currentTime ?? 0;
    setTimecode(t);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments((prev: { id: string; text: string; timecode: number }[]) => [
      ...prev,
      { id: crypto.randomUUID(), text: newComment.trim(), timecode },
    ]);
    setNewComment("");
    setTimecode(0);
  };

  const formatTc = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-sm font-mono text-zinc-400 truncate">
          {video.title}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded border border-white/20 px-2 py-1 text-xs font-mono text-zinc-400 hover:bg-white/10"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        <div className="rounded-lg overflow-hidden border border-white/10 bg-black">
          {video.url ? (
            <video
              ref={videoRef}
              src={video.url}
              controls
              className="w-full aspect-video"
            />
          ) : (
            <div className="aspect-video flex items-center justify-center text-zinc-500 text-sm">
              Aucune vidéo
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Commentaires
          </h3>
          {comments.length === 0 ? (
            <p className="text-sm text-zinc-500">Aucun commentaire</p>
          ) : (
            <ul className="space-y-2">
              {comments.map(
                (c: { id: string; text: string; timecode: number }) => (
                  <li
                    key={c.id}
                    className="text-sm text-zinc-300 font-mono border-l border-white/10 pl-2"
                  >
                    <span className="text-zinc-500 text-xs">
                      {formatTc(c.timecode)}
                    </span>{" "}
                    {c.text}
                  </li>
                ),
              )}
            </ul>
          )}
          <div className="flex flex-wrap gap-2 items-end">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Nouveau commentaire..."
              className="flex-1 min-w-[200px] rounded border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200"
            />
            <span className="text-xs font-mono text-zinc-500">
              Timecode: {formatTc(timecode)}
            </span>
            <button
              type="button"
              onClick={captureTimecode}
              className="rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
            >
              Capturer
            </button>
            <button
              type="button"
              onClick={addComment}
              className="rounded bg-white px-2 py-1 text-xs text-black font-medium hover:bg-zinc-200"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  const [result, setResult] = useState<{
    ok: boolean;
    message?: string;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setResult(null);
      try {
        const fd = new FormData();
        fd.set("file", file);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setResult({
            ok: true,
            message: data.message || "Fichier enregistré.",
          });
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
          <p
            className={`text-xs ${result.ok ? "text-emerald-500" : "text-red-400"}`}
          >
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
  const [reviewVideo, setReviewVideo] = useState<VideoEntry | null>(null);
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
  const [loadedSnapshot, setLoadedSnapshot] = useState<{
    visibility: Record<string, boolean>;
    featuredIds: string[];
    hasFeaturedOverride: boolean;
  } | null>(null);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/videos", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/config", { cache: "no-store" }).then((r) => r.json()),
    ])
    .then(([videosRes, cfg]) => {
      const items = Array.isArray(videosRes?.items) ? videosRes.items : [];
      const vidList = items.map(
        (v: {
          id: string;
          title: string;
          filename?: string;
          year?: number;
          url?: string;
          embed?: string;
        }) => ({
          id: v.id,
          title: v.title,
          filename: v.filename,
          year: v.year,
          url: v.url || v.embed,
        }),
      );
      setVideos(vidList);
      const vis =
        cfg?.visibility && typeof cfg.visibility === "object"
          ? cfg.visibility
          : {};
      const featIds = Array.isArray(cfg?.featuredIds) ? cfg.featuredIds : [];
      const hasOverride =
        typeof cfg?.hasFeaturedOverride === "boolean"
          ? cfg.hasFeaturedOverride
          : false;
      setConfig({
        featuredIds: featIds,
        visibility: vis,
        hasFeaturedOverride: hasOverride,
        siteConfig: cfg?.siteConfig ?? {},
      });
      const defaultFive = [...vidList]
        .sort(
          (a: { year?: number }, b: { year?: number }) =>
            (b.year ?? 0) - (a.year ?? 0),
        )
        .slice(0, 5)
        .map((x) => x.id);
      const loadedFeatured =
        hasOverride && featIds.length > 0
          ? featIds
          : hasOverride && featIds.length === 0
            ? []
            : defaultFive;
      setLoadedSnapshot({
        visibility: vidList.reduce(
          (acc: Record<string, boolean>, v: { id: string }) => {
            acc[v.id] = vis[v.id] !== false;
            return acc;
          },
          {},
        ),
        featuredIds: loadedFeatured,
        hasFeaturedOverride: hasOverride,
      });
    })
    .catch(() => {
      setLoadedSnapshot({
        visibility: {},
        featuredIds: [],
        hasFeaturedOverride: false,
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

  const currentVisibility = videos.reduce(
    (acc: Record<string, boolean>, v: VideoEntry) => {
      acc[v.id] = isVisible(v.id);
      return acc;
    },
    {} as Record<string, boolean>,
  );
  const hasFeaturedChange =
    config.hasFeaturedOverride &&
    loadedSnapshot != null &&
    JSON.stringify(featuredOrder) !==
      JSON.stringify(loadedSnapshot.featuredIds);
  const hasMediaChanges =
    loadedSnapshot != null &&
    (JSON.stringify(currentVisibility) !==
      JSON.stringify(loadedSnapshot.visibility) ||
      hasFeaturedChange);

  const saveMediaConfig = async () => {
    setSaving(true);
    setSaveOk(false);
    const newVis = videos.reduce(
      (acc: Record<string, boolean>, v: VideoEntry) => {
        acc[v.id] = isVisible(v.id);
        return acc;
      },
      {} as Record<string, boolean>,
    );
    const featuredOrderChanged =
      loadedSnapshot != null &&
      JSON.stringify(featuredOrder) !==
        JSON.stringify(loadedSnapshot.featuredIds);
    const hasOverrideToSave = featuredOrderChanged
      ? (config.hasFeaturedOverride ?? false)
      : (loadedSnapshot?.hasFeaturedOverride ??
        config.hasFeaturedOverride ??
        false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredIds: featuredOrder,
          visibility: newVis,
          hasFeaturedOverride: hasOverrideToSave,
        }),
      });
      if (res.ok) {
        setLoadedSnapshot({
          visibility: newVis,
          featuredIds: [...featuredOrder],
          hasFeaturedOverride: hasOverrideToSave,
        });
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
          <pre
            className="whitespace-pre font-mono text-zinc-100 text-sm leading-tight"
            style={{ fontFamily: "ui-monospace, monospace" }}
            aria-hidden
          >
            {ADMIN_ASCII}
          </pre>
          <nav className="flex gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("media")}
              className={`px-5 py-3 rounded text-sm font-medium transition ${
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
              className={`px-5 py-3 rounded text-sm font-medium transition ${
                activeTab === "config"
                  ? "bg-white text-black"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Config
            </button>
          </nav>
        </div>
        {activeTab === "media" && (
          <div className="flex items-center gap-2">
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
            {sortedVideos.map((v) => {
              const ext = v.filename?.match(/\.([a-zA-Z0-9]+)$/)?.[1] ?? "mp4";
              const displayTitle = (v.title || v.filename || "")
                .replace(/\.[a-zA-Z0-9]+$/, "")
                .trim();
              return (
                <li
                  key={v.id}
                  onClick={() => setReviewVideo(v)}
                  className="flex items-center gap-4 px-4 py-3 text-sm hover:bg-white/5 transition cursor-pointer"
                >
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="font-mono text-zinc-300 truncate">
                      {displayTitle || v.title || "—"}
                    </span>
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono bg-white/10 text-zinc-400">
                      .{ext}
                    </span>
                    <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-mono bg-white/10 text-zinc-400">
                      {v.year ?? "—"}
                    </span>
                  </div>
                  <div
                    className="flex items-center gap-4 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CheckboxCross
                      label="Public"
                      checked={isVisible(v.id)}
                      onChange={() => toggleVisibility(v.id)}
                    />
                    <CheckboxCross
                      label="Featured"
                      checked={featuredOrder.includes(v.id)}
                      onChange={() => toggleFeatured(v.id)}
                    />
                  </div>
                </li>
              );
            })}
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

      <MediaReviewOverlay
        video={reviewVideo}
        onClose={() => setReviewVideo(null)}
      />

      {activeTab === "media" && hasMediaChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={saveMediaConfig}
            disabled={saving}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {saving ? "…" : saveOk ? "Enregistré" : "save"}
          </button>
        </div>
      )}
    </div>
  );
}

function CheckboxCross({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 shrink-0 cursor-pointer">
      <span className="text-xs text-zinc-500">{label}</span>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={(e) => {
          e.preventDefault();
          onChange();
        }}
        className={`w-4 h-4 rounded border flex items-center justify-center transition ${
          checked
            ? "bg-white/20 border-white/40"
            : "bg-transparent border-white/20 hover:border-white/40"
        }`}
      >
        {checked && (
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className="text-white"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="1" y1="1" x2="9" y2="9" />
            <line x1="9" y1="1" x2="1" y2="9" />
          </svg>
        )}
      </button>
    </label>
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
  const [ogTitle, setOgTitle] = useState(siteConfig.ogTitle ?? "");
  const [canonical, setCanonical] = useState(siteConfig.canonical ?? "");
  const [analyticsId, setAnalyticsId] = useState(siteConfig.analyticsId ?? "");
  const [gtmId, setGtmId] = useState(siteConfig.gtmId ?? "");
  const [trackingEvents, setTrackingEvents] = useState(
    siteConfig.trackingEvents ?? "",
  );
  const [preloadStrategy, setPreloadStrategy] = useState(
    siteConfig.preloadStrategy ?? "auto",
  );
  const [lazyLoad, setLazyLoad] = useState(siteConfig.lazyLoad ?? false);
  const [instagramUrl, setInstagramUrl] = useState(
    siteConfig.instagramUrl ?? "",
  );
  const [tiktokUrl, setTiktokUrl] = useState(siteConfig.tiktokUrl ?? "");

  useEffect(() => {
    setTitle(siteConfig.title ?? "");
    setDescription(siteConfig.description ?? "");
    setOgImage(siteConfig.ogImage ?? "");
    setOgTitle(siteConfig.ogTitle ?? "");
    setCanonical(siteConfig.canonical ?? "");
    setAnalyticsId(siteConfig.analyticsId ?? "");
    setGtmId(siteConfig.gtmId ?? "");
    setTrackingEvents(siteConfig.trackingEvents ?? "");
    setPreloadStrategy(siteConfig.preloadStrategy ?? "auto");
    setLazyLoad(siteConfig.lazyLoad ?? false);
    setInstagramUrl(siteConfig.instagramUrl ?? "");
    setTiktokUrl(siteConfig.tiktokUrl ?? "");
  }, [siteConfig]);

  const formValues = {
    title,
    description,
    ogImage,
    ogTitle,
    canonical,
    analyticsId,
    gtmId,
    trackingEvents,
    preloadStrategy,
    lazyLoad,
    instagramUrl,
    tiktokUrl,
  };
  const initialValues = {
    title: siteConfig.title ?? "",
    description: siteConfig.description ?? "",
    ogImage: siteConfig.ogImage ?? "",
    ogTitle: siteConfig.ogTitle ?? "",
    canonical: siteConfig.canonical ?? "",
    analyticsId: siteConfig.analyticsId ?? "",
    gtmId: siteConfig.gtmId ?? "",
    trackingEvents: siteConfig.trackingEvents ?? "",
    preloadStrategy: siteConfig.preloadStrategy ?? "auto",
    lazyLoad: siteConfig.lazyLoad ?? false,
    instagramUrl: siteConfig.instagramUrl ?? "",
    tiktokUrl: siteConfig.tiktokUrl ?? "",
  };
  const hasConfigChanges =
    JSON.stringify(formValues) !== JSON.stringify(initialValues);

  const handleSave = () => {
    onSave({
      title: title || undefined,
      description: description || undefined,
      ogImage: ogImage || undefined,
      ogTitle: ogTitle || undefined,
      canonical: canonical || undefined,
      analyticsId: analyticsId || undefined,
      gtmId: gtmId || undefined,
      trackingEvents: trackingEvents || undefined,
      preloadStrategy: preloadStrategy || undefined,
      lazyLoad,
      instagramUrl: instagramUrl || undefined,
      tiktokUrl: tiktokUrl || undefined,
    });
  };

  const inputClass =
    "w-full rounded border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-zinc-200";
  const labelClass = "text-xs text-zinc-500 block mb-1";

  return (
    <>
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-lg border border-white/10 bg-zinc-900/30 p-4">
          <h2 className="text-sm font-medium text-zinc-300 mb-3">SEO</h2>
          <div className="space-y-3">
            <label className="block">
              <span className={labelClass}>Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="antn.studio — Anthony"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Meta description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Front-end & DA minimale..."
              />
            </label>
            <label className="block">
              <span className={labelClass}>OG Image</span>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className={inputClass}
                placeholder="/cover.jpg"
              />
            </label>
            <label className="block">
              <span className={labelClass}>OG Title</span>
              <input
                type="text"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                className={inputClass}
                placeholder="antn.studio — Anthony"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Canonical URL</span>
              <input
                type="text"
                value={canonical}
                onChange={(e) => setCanonical(e.target.value)}
                className={inputClass}
                placeholder="https://www.antn.studio"
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-zinc-900/30 p-4">
          <h2 className="text-sm font-medium text-zinc-300 mb-3">Analytics</h2>
          <div className="space-y-3">
            <label className="block">
              <span className={labelClass}>Tracking ID (GA4)</span>
              <input
                type="text"
                value={analyticsId}
                onChange={(e) => setAnalyticsId(e.target.value)}
                className={inputClass}
                placeholder="G-XXXXXXXXXX"
              />
            </label>
            <label className="block">
              <span className={labelClass}>GTM Container ID</span>
              <input
                type="text"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                className={inputClass}
                placeholder="GTM-XXXXXXX"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Tracking events (JSON)</span>
              <textarea
                value={trackingEvents}
                onChange={(e) => setTrackingEvents(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder='{"event": "click", ...}'
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-zinc-900/30 p-4">
          <h2 className="text-sm font-medium text-zinc-300 mb-3">
            Performances
          </h2>
          <div className="space-y-3">
            <label className="block">
              <span className={labelClass}>Preload strategy</span>
              <select
                value={preloadStrategy}
                onChange={(e) => setPreloadStrategy(e.target.value)}
                className={inputClass}
              >
                <option value="auto">auto</option>
                <option value="metadata">metadata</option>
                <option value="none">none</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={lazyLoad}
                onChange={(e) => setLazyLoad(e.target.checked)}
                className="rounded border-white/20 bg-zinc-800 text-white"
              />
              <span className="text-sm text-zinc-300">Lazy load</span>
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-zinc-900/30 p-4">
          <h2 className="text-sm font-medium text-zinc-300 mb-3">
            Réseaux sociaux
          </h2>
          <div className="space-y-3">
            <label className="block">
              <span className={labelClass}>Instagram URL</span>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className={inputClass}
                placeholder="https://www.instagram.com/antnstudio/"
              />
            </label>
            <label className="block">
              <span className={labelClass}>TikTok URL</span>
              <input
                type="text"
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                className={inputClass}
                placeholder="https://www.tiktok.com/@antnstudio"
              />
            </label>
          </div>
        </section>
      </div>

      {hasConfigChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-50"
          >
            {saving ? "…" : saveOk ? "Enregistré" : "save"}
          </button>
        </div>
      )}
    </>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const handleSuccess = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <LoginForm onSuccess={handleSuccess} />
  );
}
