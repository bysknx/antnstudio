"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import AdminLogin from "@/components/admin/AdminLogin";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Phase de chargement initiale : écran neutre sans shell
  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[var(--text-secondary)]">
        <p className="text-sm font-mono">Chargement…</p>
      </div>
    );
  }

  // Non authentifié : login plein écran, aucune sidebar / aucune page enfant
  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[var(--text-primary)]">
        <AdminLogin onSuccess={() => setAuthenticated(true)} />
      </div>
    );
  }

  // Authentifié : shell complet + pages enfants
  return (
    <div className="min-h-screen bg-[#050505] text-[var(--text-primary)]">
      <div className="hidden lg:flex">
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((v) => !v)}
        />
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <div className="px-6 py-6 lg:px-10 lg:py-8">{children}</div>
        </main>
      </div>

      {/* Mobile shell */}
      <div className="lg:hidden">
        <header className="flex items-center justify-between border-b border-[#222222] bg-[#050505] px-4 py-3">
          <span className="text-xs font-mono uppercase tracking-[0.16em] text-[var(--text-secondary)]">
            antn.studio admin
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <span className="block h-[2px] w-4 bg-[var(--text-secondary)]" />
          </button>
        </header>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black">
            <div className="flex h-full">
              <AdminSidebar
                collapsed={false}
                onToggleCollapsed={() => undefined}
                onCloseMobile={() => setMobileOpen(false)}
              />
              <div
                className="flex-1"
                onClick={() => setMobileOpen(false)}
                aria-hidden
              />
            </div>
          </div>
        )}
        <main className="px-4 py-6">{children}</main>
      </div>
    </div>
  );
}
