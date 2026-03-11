"use client";

import { useCallback, useState } from "react";

const ADMIN_ASCII =
  "                   ░██                 ░██           \n" +
  "                  ░██                               \n" +
  " ░██████    ░████████ ░█████████████  ░██░████████  \n" +
  "      ░██  ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ \n" +
  " ░███████  ░██    ░██ ░██   ░██   ░██ ░██░██    ░██ \n" +
  "░██   ░██  ░██   ░███ ░██   ░██   ░██ ░██░██    ░██ \n" +
  " ░█████░██  ░█████░██ ░██   ░██   ░██ ░██░██    ░██ \n";

type AdminLoginProps = {
  onSuccess?: () => void;
};

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
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
          onSuccess?.();
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
          className="whitespace-pre text-center font-mono text-sm leading-tight text-zinc-100"
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
