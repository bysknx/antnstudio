"use client";

import { useCallback, useEffect, useState } from "react";
import type { Profile, Preferences, SiteConfig } from "@/lib/admin-config";

type ConfigResponse = {
  siteConfig?: SiteConfig;
  profile?: Profile;
  preferences?: Preferences;
};

const inputClass =
  "w-full rounded-lg border border-[#222] bg-[#161616] px-3 py-2 font-mono text-sm text-[#F5F0E8] outline-none transition-colors duration-200 focus:border-[#444]";
const labelClass =
  "mb-1 block text-xs font-mono uppercase tracking-wider text-[#8a8a8a]";

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<ConfigResponse | null>(null);
  const [envStatus, setEnvStatus] = useState<Record<string, boolean> | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  const [profile, setProfile] = useState<Profile>({});
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({});
  const [preferences, setPreferences] = useState<Preferences>({});

  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwOk, setPwOk] = useState(false);

  const loadConfig = useCallback(() => {
    fetch("/api/admin/config", { cache: "no-store" })
      .then((r) => r.json())
      .then((data: ConfigResponse) => {
        setConfig(data);
        setProfile(data.profile ?? {});
        setSiteConfig(data.siteConfig ?? {});
        setPreferences(data.preferences ?? {});
      })
      .catch(() => setConfig(null));
  }, []);

  const loadEnvStatus = useCallback(() => {
    fetch("/api/admin/env-status", { cache: "no-store" })
      .then((r) => r.json())
      .then(setEnvStatus)
      .catch(() => setEnvStatus(null));
  }, []);

  useEffect(() => {
    loadConfig();
    loadEnvStatus();
  }, [loadConfig, loadEnvStatus]);

  const hasChanges =
    config != null &&
    (JSON.stringify(profile) !== JSON.stringify(config.profile ?? {}) ||
      JSON.stringify(siteConfig) !== JSON.stringify(config.siteConfig ?? {}) ||
      JSON.stringify(preferences) !== JSON.stringify(config.preferences ?? {}));

  const save = async () => {
    setSaving(true);
    setSaveOk(false);
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile,
          siteConfig,
          preferences,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
        setProfile(data.profile ?? {});
        setSiteConfig(data.siteConfig ?? {});
        setPreferences(data.preferences ?? {});
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwOk(false);
    if (pwNew !== pwConfirm) {
      setPwError("La confirmation ne correspond pas au nouveau mot de passe.");
      return;
    }
    if (pwNew.length < 6) {
      setPwError("Le nouveau mot de passe doit faire au moins 6 caractères.");
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: pwCurrent,
          newPassword: pwNew,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwOk(true);
        setPwCurrent("");
        setPwNew("");
        setPwConfirm("");
        setTimeout(() => setPwOk(false), 2000);
      } else {
        setPwError(data.error ?? "Erreur lors du changement.");
      }
    } finally {
      setPwSaving(false);
    }
  };

  const envLabels: Record<string, string> = {
    STRIPE_SECRET_KEY: "Stripe Secret Key",
    STRIPE_PUBLISHABLE_KEY: "Stripe Publishable Key",
    VERCEL_TOKEN: "Vercel Token",
  };

  if (config === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="font-mono text-sm text-[#8a8a8a]">Chargement…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-lg font-mono uppercase tracking-[0.16em] text-[#F5F0E8]">
        Settings
      </h1>

      <section className="mt-8">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Infos personnelles
        </h2>
        <div className="rounded-none border border-[#222] bg-[#111] p-6">
          <div className="space-y-4">
            <label className="block">
              <span className={labelClass}>Nom</span>
              <input
                type="text"
                value={profile.name ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    name: e.target.value || undefined,
                  }))
                }
                className={inputClass}
                placeholder="Anthony"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Email</span>
              <input
                type="email"
                value={profile.email ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    email: e.target.value || undefined,
                  }))
                }
                className={inputClass}
                placeholder="contact@antn.studio"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Téléphone</span>
              <input
                type="text"
                value={profile.phone ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    phone: e.target.value || undefined,
                  }))
                }
                className={inputClass}
                placeholder="+33 6 00 00 00 00"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Adresse</span>
              <textarea
                value={profile.address ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    address: e.target.value || undefined,
                  }))
                }
                className={`${inputClass} min-h-[80px]`}
                placeholder="123 rue Example, 75001 Paris"
                rows={3}
              />
            </label>
            <label className="block">
              <span className={labelClass}>SIRET</span>
              <input
                type="text"
                value={profile.siret ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    siret: e.target.value || undefined,
                  }))
                }
                className={inputClass}
                placeholder="123 456 789 00012"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Config site
        </h2>
        <div className="rounded-none border border-[#222] bg-[#111] p-6">
          <div className="space-y-4">
            <label className="block">
              <span className={labelClass}>Titre</span>
              <input
                type="text"
                value={siteConfig.title ?? ""}
                onChange={(e) =>
                  setSiteConfig((s) => ({
                    ...s,
                    title: e.target.value || undefined,
                  }))
                }
                className={inputClass}
                placeholder="antn.studio — Anthony"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Description meta</span>
              <textarea
                value={siteConfig.description ?? ""}
                onChange={(e) =>
                  setSiteConfig((s) => ({
                    ...s,
                    description: e.target.value || undefined,
                  }))
                }
                className={`${inputClass} min-h-[60px]`}
                placeholder="Front-end & DA minimale..."
                rows={2}
              />
            </label>
            <label className="block">
              <span className={labelClass}>OG Image</span>
              <input
                type="text"
                value={siteConfig.ogImage ?? ""}
                onChange={(e) =>
                  setSiteConfig((s) => ({
                    ...s,
                    ogImage: e.target.value || undefined,
                  }))
                }
                className={inputClass}
                placeholder="/cover.jpg"
              />
            </label>
            <label className="block">
              <span className={labelClass}>Instagram URL</span>
              <input
                type="url"
                value={siteConfig.instagramUrl ?? ""}
                onChange={(e) =>
                  setSiteConfig((s) => ({
                    ...s,
                    instagramUrl: e.target.value || undefined,
                  }))
                }
                className={inputClass}
                placeholder="https://www.instagram.com/antnstudio/"
              />
            </label>
            <label className="block">
              <span className={labelClass}>TikTok URL</span>
              <input
                type="url"
                value={siteConfig.tiktokUrl ?? ""}
                onChange={(e) =>
                  setSiteConfig((s) => ({
                    ...s,
                    tiktokUrl: e.target.value || undefined,
                  }))
                }
                className={inputClass}
                placeholder="https://www.tiktok.com/@antnstudio"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Gestion accès
        </h2>
        <div className="rounded-none border border-[#222] bg-[#111] p-6">
          <h3 className="mb-4 text-sm font-mono text-[#F5F0E8]">
            Changer le mot de passe
          </h3>
          <form onSubmit={changePassword} className="space-y-4">
            <label className="block">
              <span className={labelClass}>Mot de passe actuel</span>
              <input
                type="password"
                value={pwCurrent}
                onChange={(e) => setPwCurrent(e.target.value)}
                className={inputClass}
                autoComplete="current-password"
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Nouveau mot de passe</span>
              <input
                type="password"
                value={pwNew}
                onChange={(e) => setPwNew(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
                required
              />
            </label>
            <label className="block">
              <span className={labelClass}>Confirmer le nouveau</span>
              <input
                type="password"
                value={pwConfirm}
                onChange={(e) => setPwConfirm(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
                required
              />
            </label>
            {pwError && <p className="text-sm text-[#f87171]">{pwError}</p>}
            {pwOk && (
              <p className="text-sm text-[#86EFAC]">Mot de passe mis à jour.</p>
            )}
            <button
              type="submit"
              disabled={
                pwSaving ||
                !pwCurrent.trim() ||
                !pwNew.trim() ||
                !pwConfirm.trim()
              }
              className="rounded-lg border border-[#222] bg-[#161616] px-4 py-2 font-mono text-sm text-[#F5F0E8] transition-colors duration-200 hover:border-[#222] hover:bg-[#1a1a1a] disabled:opacity-50"
            >
              {pwSaving ? "…" : "Changer le mot de passe"}
            </button>
          </form>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Clés API
        </h2>
        <div className="rounded-none border border-[#222] bg-[#111] p-6">
          <p className="mb-4 text-xs text-[#8a8a8a]">
            Les clés API seront configurées via variables d&apos;environnement
            (.env).
          </p>
          {envStatus != null ? (
            <div className="space-y-3">
              {Object.entries(envStatus).map(([key, configured]) => (
                <label key={key} className="block">
                  <span className={labelClass}>{envLabels[key] ?? key}</span>
                  <input
                    type="text"
                    disabled
                    value={configured ? "✓ Configurée" : "✗ Non configurée"}
                    className={`${inputClass} cursor-not-allowed opacity-90`}
                    readOnly
                  />
                </label>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#666]">
              Impossible de charger le statut des variables.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Préférences
        </h2>
        <div className="rounded-none border border-[#222] bg-[#111] p-6">
          <div className="space-y-4">
            <label className="block">
              <span className={labelClass}>Format date</span>
              <select
                value={preferences.dateFormat ?? "fr-FR"}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    dateFormat: e.target.value || undefined,
                  }))
                }
                className={inputClass}
              >
                <option value="fr-FR">fr-FR (FR)</option>
                <option value="en-GB">en-GB (UK)</option>
                <option value="en-US">en-US (US)</option>
              </select>
            </label>
            <label className="block">
              <span className={labelClass}>Devise</span>
              <select
                value={preferences.currency ?? "EUR"}
                onChange={(e) =>
                  setPreferences((p) => ({
                    ...p,
                    currency: e.target.value || undefined,
                  }))
                }
                className={inputClass}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {hasChanges && (
        <div
          className="fixed z-50 transition-opacity duration-200 ease-out"
          style={{
            bottom: "24px",
            right: "24px",
            animation: "settingsFloatingFadeIn 0.2s ease-out",
          }}
        >
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="border-none bg-[#F5F0E8] py-3 font-semibold text-[#0a0a0a] transition-opacity duration-200 ease-out hover:opacity-90 disabled:opacity-50"
            style={{ padding: "12px 24px", fontWeight: 600 }}
          >
            {saving ? "…" : saveOk ? "Enregistré" : "Enregistrer"}
          </button>
        </div>
      )}
    </main>
  );
}
