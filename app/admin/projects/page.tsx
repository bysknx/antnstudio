"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Plus,
  Eye,
  EyeOff,
  Star,
  Send,
  Download,
  Trash2,
} from "lucide-react";
import type { ProjectMetaEntry } from "@/lib/admin-config";

type VideoEntry = {
  id: string;
  title: string;
  projectTitle: string;
  client: string;
  year?: number | null;
  filename?: string;
  url?: string;
  duration?: number | null;
  thumbnail?: string;
  createdAt?: string | null;
};

type ConfigState = {
  visibility: Record<string, boolean>;
  featuredIds: string[];
  hasFeaturedOverride: boolean;
  projectMeta: Record<string, ProjectMetaEntry>;
};

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatDate(
  year: number | null | undefined,
  createdAt?: string | null,
): string {
  if (year != null) return String(year);
  if (createdAt) {
    try {
      const d = new Date(createdAt);
      return isNaN(d.getTime()) ? "—" : d.getFullYear().toString();
    } catch {
      return "—";
    }
  }
  return "—";
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  en_review: "En review",
  valide: "Validé",
};

function RowMenuDropdown({
  videoId,
  isOpen,
  onClose,
  anchorRef,
  isVisible,
  isFeatured,
  onToggleVisibility,
  onToggleFeatured,
  onSendReview,
  videoUrl,
}: {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isVisible: boolean;
  isFeatured: boolean;
  onToggleVisibility: () => void;
  onToggleFeatured: () => void;
  onSendReview: () => void;
  videoUrl?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const el = e.target as Node;
      if (anchorRef.current?.contains(el) || panelRef.current?.contains(el))
        return;
      onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-20 mt-1 min-w-[200px] rounded-lg border border-[#222] bg-[#161616] py-1 shadow-lg transition-opacity duration-200 ease-out"
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#F5F0E8] transition-colors duration-200 hover:bg-[#1a1a1a]"
        onClick={() => {
          onToggleVisibility();
          onClose();
        }}
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4 shrink-0" />
        ) : (
          <Eye className="h-4 w-4 shrink-0" />
        )}
        {isVisible ? "Masquer du portfolio" : "Afficher dans le portfolio"}
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#F5F0E8] transition-colors duration-200 hover:bg-[#1a1a1a]"
        onClick={() => {
          onToggleFeatured();
          onClose();
        }}
      >
        <Star className="h-4 w-4 shrink-0" />
        {isFeatured ? "Retirer de la homepage" : "Feature en homepage"}
      </button>
      <button
        type="button"
        role="menuitem"
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#F5F0E8] transition-colors duration-200 hover:bg-[#1a1a1a]"
        onClick={() => {
          onSendReview();
          onClose();
        }}
      >
        <Send className="h-4 w-4 shrink-0" />
        Envoyer en review
      </button>
      {videoUrl && (
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#F5F0E8] transition-colors duration-200 hover:bg-[#1a1a1a]"
          role="menuitem"
          onClick={onClose}
        >
          <Download className="h-4 w-4 shrink-0" />
          Télécharger
        </a>
      )}
      <button
        type="button"
        role="menuitem"
        disabled
        title="Bientôt (étape ⑥)"
        className="flex w-full cursor-not-allowed items-center gap-2 px-3 py-2 text-left text-sm text-[#666] opacity-60"
      >
        <Trash2 className="h-4 w-4 shrink-0" />
        Supprimer
      </button>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [config, setConfig] = useState<ConfigState>({
    visibility: {},
    featuredIds: [],
    hasFeaturedOverride: false,
    projectMeta: {},
  });
  const [loadedSnapshot, setLoadedSnapshot] = useState<ConfigState | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/videos", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/config", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([videosRes, cfg]) => {
        const items = Array.isArray(videosRes?.items) ? videosRes.items : [];
        const vidList: VideoEntry[] = items.map(
          (v: {
            id: string;
            title: string;
            projectTitle?: string;
            client?: string;
            year?: number | null;
            filename?: string;
            url?: string;
            embed?: string;
            duration?: number | null;
            thumbnail?: string;
            createdAt?: string | null;
          }) => ({
            id: v.id,
            title: v.title,
            projectTitle: v.projectTitle ?? v.title,
            client: v.client ?? "",
            year: v.year,
            filename: v.filename,
            url: v.url || v.embed,
            duration: v.duration,
            thumbnail: v.thumbnail,
            createdAt: v.createdAt,
          }),
        );
        setVideos(vidList);

        const vis =
          cfg?.visibility && typeof cfg.visibility === "object"
            ? cfg.visibility
            : {};
        const featIds = Array.isArray(cfg?.featuredIds) ? cfg.featuredIds : [];
        const hasOverride = Boolean(cfg?.hasFeaturedOverride);
        const projectMeta =
          cfg?.projectMeta && typeof cfg.projectMeta === "object"
            ? cfg.projectMeta
            : {};

        setConfig({
          visibility: vis,
          featuredIds: featIds,
          hasFeaturedOverride: hasOverride,
          projectMeta,
        });

        const defaultFive = [...vidList]
          .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
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
          projectMeta,
        });
      })
      .catch(() => setLoadedSnapshot(null));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const defaultFive = [...videos]
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    .slice(0, 5)
    .map((v) => v.id);
  const featuredOrder =
    config.hasFeaturedOverride && config.featuredIds.length > 0
      ? [...config.featuredIds]
      : config.hasFeaturedOverride && config.featuredIds.length === 0
        ? []
        : defaultFive;

  const isVisible = (id: string) => config.visibility[id] !== false;
  const toggleVisibility = (id: string) => {
    setConfig((c) => ({
      ...c,
      visibility: { ...c.visibility, [id]: c.visibility[id] === false },
    }));
  };
  const toggleFeatured = (id: string) => {
    const isFeatured = featuredOrder.includes(id);
    const next = isFeatured
      ? featuredOrder.filter((x) => x !== id)
      : [...featuredOrder, id];
    setConfig((c) => ({
      ...c,
      featuredIds: next,
      hasFeaturedOverride: true,
    }));
  };

  const getMeta = (id: string): ProjectMetaEntry =>
    config.projectMeta[id] ?? {};
  const getVersion = (id: string) => getMeta(id).version ?? "V1";
  const getStatus = (id: string) => getMeta(id).status ?? "draft";

  const setProjectMeta = (id: string, patch: Partial<ProjectMetaEntry>) => {
    setConfig((c) => ({
      ...c,
      projectMeta: {
        ...c.projectMeta,
        [id]: { ...getMeta(id), ...patch },
      },
    }));
  };

  const handleSendReview = (id: string) => {
    const token =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `rev-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    setProjectMeta(id, { reviewToken: token, status: "en_review" });
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = `${origin}/review/${token}`;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        // Optional: could set a small toast "Lien copié"
      });
    }
    setOpenRowId(null);
  };

  const currentVisibility = videos.reduce(
    (acc, v) => {
      acc[v.id] = isVisible(v.id);
      return acc;
    },
    {} as Record<string, boolean>,
  );
  const hasFeaturedChange =
    loadedSnapshot != null &&
    JSON.stringify(featuredOrder) !==
      JSON.stringify(loadedSnapshot.featuredIds);
  const hasVisibilityChange =
    loadedSnapshot != null &&
    JSON.stringify(currentVisibility) !==
      JSON.stringify(loadedSnapshot.visibility);
  const hasProjectMetaChange =
    loadedSnapshot != null &&
    JSON.stringify(config.projectMeta) !==
      JSON.stringify(loadedSnapshot.projectMeta ?? {});
  const hasChanges =
    hasFeaturedChange || hasVisibilityChange || hasProjectMetaChange;

  const save = async () => {
    if (!loadedSnapshot) return;
    setSaving(true);
    setSaveOk(false);
    const featuredToSave = hasFeaturedChange
      ? config.hasFeaturedOverride
        ? featuredOrder
        : defaultFive
      : loadedSnapshot.featuredIds;
    const hasOverrideToSave = hasFeaturedChange
      ? config.hasFeaturedOverride
      : loadedSnapshot.hasFeaturedOverride;
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featuredIds: featuredToSave,
          visibility: currentVisibility,
          hasFeaturedOverride: hasOverrideToSave,
          projectMeta: hasProjectMetaChange ? config.projectMeta : undefined,
        }),
      });
      if (res.ok) {
        setLoadedSnapshot({
          visibility: { ...currentVisibility },
          featuredIds: [...featuredToSave],
          hasFeaturedOverride: hasOverrideToSave,
          projectMeta: config.projectMeta,
        });
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const sortedVideos = [...videos].sort(
    (a, b) => (b.year ?? 0) - (a.year ?? 0),
  );

  return (
    <main className="min-h-[60svh]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-mono uppercase tracking-[0.16em] text-[#F5F0E8]">
            Projects
          </h1>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Liste des projets. Portfolio et featured sont enregistrés dans la
            config admin.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Bientôt"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#222] bg-[#161616] text-[#F5F0E8] transition-colors duration-200 ease-out hover:border-[#333] hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Ajouter un projet"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {videos.length === 0 ? (
        <p className="mt-8 text-sm text-[#8a8a8a]">Chargement…</p>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto border border-[#222] bg-[#111]">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#222]">
                  <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                    Thumbnail
                  </th>
                  <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                    Nom
                  </th>
                  <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                    Client
                  </th>
                  <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                    Version
                  </th>
                  <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                    Durée
                  </th>
                  <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                    Statut
                  </th>
                  <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                    Date
                  </th>
                  <th
                    className="w-10 border-l border-[#222] px-2 py-3"
                    aria-label="Actions"
                  />
                </tr>
              </thead>
              <tbody>
                {sortedVideos.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-[#222] transition-colors duration-200 last:border-b-0 hover:bg-[#161616]"
                  >
                    <td className="px-3 py-2">
                      <div className="h-12 w-20 shrink-0 overflow-hidden border border-[#222] bg-[#0a0a0a]">
                        {v.thumbnail ? (
                          <img
                            src={v.thumbnail}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-[#666]">
                            —
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-[#F5F0E8]">
                      {v.projectTitle || v.title || v.filename || v.id}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#8a8a8a]">
                      {v.client || "—"}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#8a8a8a]">
                      {getVersion(v.id)}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#8a8a8a]">
                      {formatDuration(v.duration)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-block rounded px-2 py-0.5 text-xs font-mono text-[#8a8a8a]">
                        {STATUS_LABELS[getStatus(v.id)] ?? getStatus(v.id)}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#8a8a8a]">
                      {formatDate(v.year, v.createdAt)}
                    </td>
                    <td className="relative border-l border-[#222] px-2 py-2">
                      <button
                        ref={openRowId === v.id ? menuButtonRef : undefined}
                        type="button"
                        onClick={() =>
                          setOpenRowId((prev) => (prev === v.id ? null : v.id))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222] bg-transparent text-[#8a8a8a] transition-colors duration-200 hover:border-[#333] hover:bg-[#161616] hover:text-[#F5F0E8]"
                        aria-haspopup="menu"
                        aria-expanded={openRowId === v.id}
                        aria-label="Menu actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      <RowMenuDropdown
                        videoId={v.id}
                        isOpen={openRowId === v.id}
                        onClose={() => setOpenRowId(null)}
                        anchorRef={
                          openRowId === v.id ? menuButtonRef : { current: null }
                        }
                        isVisible={isVisible(v.id)}
                        isFeatured={featuredOrder.includes(v.id)}
                        onToggleVisibility={() => toggleVisibility(v.id)}
                        onToggleFeatured={() => toggleFeatured(v.id)}
                        onSendReview={() => handleSendReview(v.id)}
                        videoUrl={v.url}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasChanges && loadedSnapshot != null && (
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg border border-[#222] bg-[#161616] px-4 py-2 text-sm font-mono text-[#F5F0E8] transition-colors duration-200 ease-out hover:border-[#333] hover:bg-[#1a1a1a] disabled:opacity-50"
              >
                {saving ? "…" : saveOk ? "Enregistré" : "Enregistrer"}
              </button>
              <span className="text-xs text-[#8a8a8a]">
                Modifications non enregistrées
              </span>
            </div>
          )}
        </>
      )}
    </main>
  );
}
