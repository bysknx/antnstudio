"use client";

import { useCallback, useEffect, useState } from "react";

type VideoEntry = {
  id: string;
  title: string;
  filename?: string;
  year?: number;
  url?: string;
};

type ConfigState = {
  visibility: Record<string, boolean>;
  featuredIds: string[];
  hasFeaturedOverride: boolean;
};

function AdminToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 shrink-0">
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={(e) => {
          e.preventDefault();
          onChange();
        }}
        className={`flex h-[18px] w-8 items-center rounded-sm border border-[#222222] px-[2px] transition-colors duration-200 ease-in-out ${
          checked ? "bg-[#f5f0e8]" : "bg-[#222222]"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 rounded-sm bg-[#0a0a0a] transition-transform duration-200 ease-in-out ${
            checked ? "translate-x-[14px]" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}

export default function AdminProjectsPage() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [config, setConfig] = useState<ConfigState>({
    visibility: {},
    featuredIds: [],
    hasFeaturedOverride: false,
  });
  const [loadedSnapshot, setLoadedSnapshot] = useState<ConfigState | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

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
        const hasOverride = Boolean(cfg?.hasFeaturedOverride);

        setConfig({
          visibility: vis,
          featuredIds: featIds,
          hasFeaturedOverride: hasOverride,
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
  const hasChanges = hasFeaturedChange || hasVisibilityChange;

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
        }),
      });
      if (res.ok) {
        setLoadedSnapshot({
          visibility: { ...currentVisibility },
          featuredIds: [...featuredToSave],
          hasFeaturedOverride: hasOverrideToSave,
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
      <h1 className="text-lg font-mono uppercase tracking-[0.16em] text-[var(--text-primary)]">
        Projects
      </h1>
      <p className="mt-1 text-xs text-[var(--text-secondary)]">
        Liste des projets issus du manifest vidéo. Public / Featured sont
        enregistrés dans la config admin.
      </p>

      {videos.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--text-secondary)]">Chargement…</p>
      ) : (
        <>
          <div className="mt-8 overflow-x-auto rounded-sm border border-[#222222] bg-[#111111]">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#222222]">
                  <th className="px-4 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    Nom
                  </th>
                  <th className="px-4 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    Année
                  </th>
                  <th className="px-4 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    Public
                  </th>
                  <th className="px-4 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                    Featured
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedVideos.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-[#222222] transition-colors duration-200 last:border-b-0 hover:bg-[#161616]"
                  >
                    <td className="px-4 py-3">
                      <span className="truncate font-mono text-sm text-[var(--text-primary)]">
                        {v.title || v.filename || v.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">
                      {v.year ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <AdminToggle
                        label=""
                        checked={isVisible(v.id)}
                        onChange={() => toggleVisibility(v.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <AdminToggle
                        label=""
                        checked={featuredOrder.includes(v.id)}
                        onChange={() => toggleFeatured(v.id)}
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
                className="rounded-sm border border-[#222222] bg-[#161616] px-4 py-2 text-sm font-mono text-[var(--text-primary)] transition-colors duration-200 ease-in-out hover:bg-[#1a1a1a] disabled:opacity-50"
              >
                {saving ? "…" : saveOk ? "Enregistré" : "Enregistrer"}
              </button>
              <span className="text-xs text-[var(--text-secondary)]">
                Modifications non enregistrées
              </span>
            </div>
          )}
        </>
      )}
    </main>
  );
}
