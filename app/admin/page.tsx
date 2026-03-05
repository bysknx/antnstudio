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

function AdminDashboard() {
  return (
    <div className="mx-auto max-w-4xl space-y-12 px-4 py-12">
      <h1 className="text-2xl font-semibold text-zinc-100">
        Admin — antn.studio
      </h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-200">
          Vidéos VPS (media.antn.studio)
        </h2>
        <p className="max-w-xl text-sm text-zinc-400">
          Liste du contenu sur le VPS et upload de nouvelles vidéos. À brancher
          sur ton API ou script d’upload (ex. presigned URL S3, ou API custom
          sur le VPS). Format web recommandé : H.264/MP4, compression adaptée.
        </p>
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-6 text-zinc-500">
          [À venir : liste des fichiers + formulaire d’upload]
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-200">
          Featured (home page)
        </h2>
        <p className="max-w-xl text-sm text-zinc-400">
          Choisir quelles vidéos apparaissent dans le hero de la home (actuellement
          les 5 plus récentes du manifest).
        </p>
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-6 text-zinc-500">
          [À venir : cases à cocher / ordre drag & drop]
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-200">
          Projets publics
        </h2>
        <p className="max-w-xl text-sm text-zinc-400">
          Définir quelles vidéos sont visibles dans la grille /projects (manifest
          ou source de vérité à connecter).
        </p>
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-6 text-zinc-500">
          [À venir : toggle par vidéo]
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
        <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-6 text-zinc-500">
          [À venir : projets privés, commentaires, lien de téléchargement]
        </div>
      </section>
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
