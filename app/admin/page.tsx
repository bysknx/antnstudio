"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  FileText,
  TrendingUp,
  Eye,
  LayoutGrid,
} from "lucide-react";

const MOCK_FINANCES = {
  revenueMonth: 2400,
  expensesMonth: 180,
  trendPercent: 12,
};

const MOCK_ACTIVITY_ACTIONS = [
  { date: "14 mars 2025", label: "Projet ONZE envoyé en review" },
  { date: "12 mars 2025", label: "Facture #03 payée" },
  { date: "10 mars 2025", label: "Nouveau projet ajouté — Sceaux rouges" },
];

type VideoItem = {
  id: string;
  projectTitle?: string;
  title: string;
  client?: string;
  year?: number | null;
  createdAt?: string | null;
};

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          {label}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-[#666]" />
      </div>
      <p className="mt-2 font-mono text-xl text-[#F5F0E8]">{value}</p>
    </div>
  );
}

function FinanceCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          {label}
        </span>
        <Icon className="h-4 w-4 shrink-0 text-[#666]" />
      </div>
      <p className="mt-2 font-mono text-xl text-[#F5F0E8]">{value}</p>
      {sub != null && (
        <p className="mt-1 text-xs font-mono text-[#8a8a8a]">{sub}</p>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [recentVideos, setRecentVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    fetch("/api/videos", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        const sorted = [...items]
          .sort(
            (a: VideoItem, b: VideoItem) =>
              (b.year ?? 0) - (a.year ?? 0) ||
              String(b.createdAt ?? "").localeCompare(
                String(a.createdAt ?? ""),
              ),
          )
          .slice(0, 5)
          .map((v: VideoItem) => ({
            id: v.id,
            projectTitle: v.projectTitle ?? v.title,
            title: v.title,
            client: v.client,
            year: v.year,
            createdAt: v.createdAt,
          }));
        setRecentVideos(sorted);
      })
      .catch(() => setRecentVideos([]));
  }, []);

  const soldeNet = MOCK_FINANCES.revenueMonth - MOCK_FINANCES.expensesMonth;
  const trendLabel =
    MOCK_FINANCES.trendPercent >= 0
      ? `+${MOCK_FINANCES.trendPercent} % vs mois précédent`
      : `${MOCK_FINANCES.trendPercent} % vs mois précédent`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-lg font-mono uppercase tracking-[0.16em] text-[#F5F0E8]">
        Dashboard
      </h1>

      <section className="mt-8">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Stats site
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <StatCard label="Visites" value="—" icon={Eye} />
          <StatCard label="Pages vues" value="—" icon={LayoutGrid} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Finances rapides
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <FinanceCard
            label="Revenu du mois"
            value={`${MOCK_FINANCES.revenueMonth.toLocaleString("fr-FR")} €`}
            icon={TrendingUp}
          />
          <FinanceCard
            label="Dépenses du mois"
            value={`${MOCK_FINANCES.expensesMonth.toLocaleString("fr-FR")} €`}
            icon={FileText}
          />
          <FinanceCard
            label="Solde net"
            value={`${soldeNet.toLocaleString("fr-FR")} €`}
            icon={TrendingUp}
          />
          <FinanceCard label="Tendance" value={trendLabel} icon={TrendingUp} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Activité récente
        </h2>
        <div className="rounded-lg border border-[#222] bg-[#111] p-6">
          <ul className="space-y-3">
            {recentVideos.map((v) => (
              <li
                key={v.id}
                className="border-b border-[#222] pb-3 font-mono text-sm last:border-b-0 last:pb-0"
              >
                <span className="text-[#8a8a8a]">{v.year ?? "—"}</span>
                <span className="mx-2 text-[#666]">—</span>
                <span className="text-[#F5F0E8]">
                  {v.projectTitle ?? v.title}
                </span>
                {v.client && (
                  <>
                    <span className="mx-2 text-[#666]">—</span>
                    <span className="text-[#8a8a8a]">{v.client}</span>
                  </>
                )}
              </li>
            ))}
            {MOCK_ACTIVITY_ACTIONS.map((a, i) => (
              <li
                key={`action-${i}`}
                className="border-b border-[#222] pb-3 font-mono text-sm last:border-b-0 last:pb-0"
              >
                <span className="text-[#8a8a8a]">{a.date}</span>
                <span className="mx-2 text-[#666]">—</span>
                <span className="text-[#F5F0E8]">{a.label}</span>
              </li>
            ))}
          </ul>
          {recentVideos.length === 0 && MOCK_ACTIVITY_ACTIONS.length === 0 && (
            <p className="font-mono text-sm text-[#8a8a8a]">
              Aucune activité récente.
            </p>
          )}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Quick actions
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 rounded-lg border border-[#222] bg-[#161616] px-4 py-3 font-mono text-sm text-[#F5F0E8] transition-colors duration-200 hover:border-[#333] hover:bg-[#1a1a1a]"
          >
            <FolderOpen className="h-4 w-4" />
            Nouveau projet
          </Link>
          <Link
            href="/admin/invoices"
            className="inline-flex items-center gap-2 rounded-lg border border-[#222] bg-[#161616] px-4 py-3 font-mono text-sm text-[#F5F0E8] transition-colors duration-200 hover:border-[#333] hover:bg-[#1a1a1a]"
          >
            <FileText className="h-4 w-4" />
            Nouvelle facture
          </Link>
        </div>
      </section>
    </div>
  );
}
