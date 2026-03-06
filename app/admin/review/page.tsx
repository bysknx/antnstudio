"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Comment = {
  id: string;
  text: string;
  timecode: number;
  createdAt: string;
};

type ReviewVersion = {
  id: string;
  label: string;
  videoUrl: string | null;
  comments: Comment[];
};

type ReviewProject = {
  id: string;
  name: string;
  client: string;
  versions: ReviewVersion[];
};

const MOCK_PROJECTS: ReviewProject[] = [
  {
    id: "proj-1",
    name: "Campagne Brand X",
    client: "Client A",
    versions: [
      { id: "v1", label: "V1", videoUrl: null, comments: [] },
      { id: "v2", label: "V2", videoUrl: null, comments: [] },
    ],
  },
  {
    id: "proj-2",
    name: "Film institutionnel",
    client: "Client B",
    versions: [
      { id: "v1", label: "V1", videoUrl: null, comments: [] },
    ],
  },
];

function formatTimecode(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function VideoPlayerWithTimecode({
  src,
  onCaptureTimecode,
}: {
  src: string | null;
  currentTimecode?: number;
  onCaptureTimecode?: (seconds: number) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTimeUpdate = () => setCurrentTime(v.currentTime);
    const onLoadedMetadata = () => setDuration(v.duration);
    v.addEventListener("timeupdate", onTimeUpdate);
    v.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      v.removeEventListener("timeupdate", onTimeUpdate);
      v.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [src]);

  if (!src) {
    return (
      <div className="aspect-video bg-zinc-900/50 rounded-lg border border-white/10 flex items-center justify-center text-zinc-500 text-sm">
        Aucune vidéo — déposez un fichier ci-dessous
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <video
        ref={videoRef}
        src={src}
        controls
        className="w-full aspect-video rounded-lg bg-black"
      />
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
        <span>
          {formatTimecode(currentTime)} / {formatTimecode(duration)}
        </span>
        {onCaptureTimecode && (
          <button
            type="button"
            onClick={() => onCaptureTimecode(currentTime)}
            className="rounded bg-white/10 px-2 py-1 hover:bg-white/20 transition"
          >
            Capturer pour commentaire
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminReviewPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [projects, setProjects] = useState<ReviewProject[]>(MOCK_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<ReviewProject | null>(
    MOCK_PROJECTS[0] ?? null,
  );
  const [selectedVersion, setSelectedVersion] = useState<ReviewVersion | null>(
    MOCK_PROJECTS[0]?.versions[0] ?? null,
  );
  const [newComment, setNewComment] = useState("");
  const [newCommentTimecode, setNewCommentTimecode] = useState(0);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    if (authenticated === false) {
      router.replace("/admin");
    }
  }, [authenticated, router]);

  const addComment = useCallback(
    (versionId: string) => {
      if (!newComment.trim()) return;
      setProjects((prev) =>
        prev.map((p) => ({
          ...p,
          versions: p.versions.map((v) =>
            v.id === versionId
              ? {
                  ...v,
                  comments: [
                    ...v.comments,
                    {
                      id: crypto.randomUUID(),
                      text: newComment.trim(),
                      timecode: newCommentTimecode,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : v,
          ),
        })),
      );
      setNewComment("");
      setNewCommentTimecode(0);
    },
    [newComment, newCommentTimecode],
  );

  const handleFileUpload = useCallback(
    (versionId: string, projectId: string) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/mp4,video/webm";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        setUploading(true);
        try {
          const fd = new FormData();
          fd.set("file", file);
          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: fd,
          });
          const data = await res.json();
          if (res.ok && data.url) {
            setProjects((prev) =>
              prev.map((p) =>
                p.id === projectId
                  ? {
                      ...p,
                      versions: p.versions.map((v) =>
                        v.id === versionId
                          ? { ...v, videoUrl: data.url }
                          : v,
                      ),
                    }
                  : p,
              ),
            );
          }
        } finally {
          setUploading(false);
        }
      };
      input.click();
    },
    [],
  );

  if (authenticated === null) {
    return (
      <main className="flex min-h-[50svh] items-center justify-center">
        <p className="text-zinc-500">Chargement…</p>
      </main>
    );
  }

  if (!authenticated) return null;

  const currentVersion = selectedProject?.versions.find(
    (v) => v.id === selectedVersion?.id,
  ) ?? selectedVersion;

  return (
    <main className="min-h-[100svh] pb-24">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm text-zinc-400 hover:text-zinc-200 transition"
            >
              ← Admin
            </Link>
            <h1 className="text-2xl font-semibold text-zinc-100">
              Versions clients (Review)
            </h1>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr_320px]">
          {/* Liste des projets / versions */}
          <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4">
            <h2 className="mb-3 text-sm font-medium text-zinc-300">
              Projets
            </h2>
            <ul className="space-y-1">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProject(p);
                      setSelectedVersion(p.versions[0] ?? null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                      selectedProject?.id === p.id
                        ? "bg-white/10 text-white"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    {p.name}
                  </button>
                  {selectedProject?.id === p.id && (
                    <ul className="ml-3 mt-1 space-y-0.5">
                      {p.versions.map((v) => (
                        <li key={v.id}>
                          <button
                            type="button"
                            onClick={() => setSelectedVersion(v)}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                              selectedVersion?.id === v.id
                                ? "bg-white/15 text-white"
                                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                            }`}
                          >
                            {v.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Lecteur vidéo + timecode */}
          <div className="space-y-4">
            {currentVersion && (
              <>
                <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4">
                  <h2 className="mb-3 text-sm font-medium text-zinc-300">
                    {currentVersion.label}
                  </h2>
                  <VideoPlayerWithTimecode
                    src={currentVersion.videoUrl}
                    onCaptureTimecode={setNewCommentTimecode}
                  />
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() =>
                        selectedProject &&
                        handleFileUpload(currentVersion.id, selectedProject.id)
                      }
                      disabled={uploading}
                      className="rounded bg-white/10 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/20 disabled:opacity-50"
                    >
                      {uploading ? "Envoi…" : "Upload vidéo"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Commentaires */}
          <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4">
            <h2 className="mb-3 text-sm font-medium text-zinc-300">
              Commentaires
            </h2>
            {currentVersion ? (
              <>
                <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto">
                  {currentVersion.comments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded bg-zinc-800/50 px-2 py-1.5 text-xs"
                    >
                      <span className="font-mono text-zinc-500">
                        {formatTimecode(c.timecode)}
                      </span>{" "}
                      {c.text}
                    </li>
                  ))}
                  {currentVersion.comments.length === 0 && (
                    <li className="text-zinc-500 text-xs">
                      Aucun commentaire
                    </li>
                  )}
                </ul>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nouveau commentaire…"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && currentVersion) {
                        addComment(currentVersion.id);
                      }
                    }}
                    className="w-full rounded border border-white/10 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-200 placeholder-zinc-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      Timecode: {formatTimecode(newCommentTimecode)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        currentVersion && addComment(currentVersion.id)
                      }
                      disabled={!newComment.trim()}
                      className="rounded bg-white/10 px-2 py-1 text-xs text-zinc-200 hover:bg-white/20 disabled:opacity-50"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-zinc-500 text-sm">
                Sélectionnez une version
              </p>
            )}
          </div>
        </div>

        <p className="mt-8 text-xs text-zinc-500">
          Phase 1 : interface uniquement. Le backend (stockage, auth par lien
          secret) sera ajouté ultérieurement.
        </p>
      </div>
    </main>
  );
}
