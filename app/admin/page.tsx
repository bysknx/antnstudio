"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderOpen, FileText } from "lucide-react";

const MOCK_FINANCES = {
  revenueMonth: 2400,
  expensesMonth: 180,
  trendPercent: 12,
};

type VideoItem = {
  id: string;
  projectTitle?: string;
  title: string;
  client?: string;
  year?: number | null;
  thumbnail?: string;
  createdAt?: string | null;
};

const linkButtonClass =
  "inline-flex items-center gap-2 rounded-lg border border-[#222] bg-[#161616] px-4 py-3 font-mono text-sm text-[#F5F0E8] transition-colors duration-200 hover:border-[#333] hover:bg-[#1a1a1a]";

export default function AdminPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);

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
          .map((v: VideoItem) => ({
            id: v.id,
            projectTitle: v.projectTitle ?? v.title,
            title: v.title,
            client: v.client,
            year: v.year,
            thumbnail: v.thumbnail,
            createdAt: v.createdAt,
          }));
        setVideos(sorted);
      })
      .catch(() => setVideos([]));
  }, []);

  const soldeNet = MOCK_FINANCES.revenueMonth - MOCK_FINANCES.expensesMonth;
  const trendPercent = MOCK_FINANCES.trendPercent;
  const trendPositive = trendPercent >= 0;
  const trendText =
    trendPercent >= 0
      ? `+${trendPercent} % vs mois précédent`
      : `${trendPercent} % vs mois précédent`;

  const recentThree = videos.slice(0, 3);
  const recentFive = videos.slice(0, 5);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-lg font-mono uppercase tracking-[0.16em] text-[#F5F0E8]">
        Dashboard
      </h1>

      <section className="mt-6 flex flex-wrap gap-4">
        <Link href="/admin/projects" className={linkButtonClass}>
          <FolderOpen className="h-4 w-4" />
          Nouveau projet
        </Link>
        <Link href="/admin/invoices" className={linkButtonClass}>
          <FileText className="h-4 w-4" />
          Nouvelle facture
        </Link>
      </section>

      <p className="mt-6 text-xs text-[#666]">
        Stats site — Vercel Analytics bientôt disponible
      </p>

      <section className="mt-8">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Finances rapides
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
              Revenu du mois
            </span>
            <p className="mt-2 font-mono text-xl text-[#F5F0E8]">
              {MOCK_FINANCES.revenueMonth.toLocaleString("fr-FR")} €
            </p>
          </div>
          <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
              Dépenses
            </span>
            <p className="mt-2 font-mono text-xl text-[#F5F0E8]">
              {MOCK_FINANCES.expensesMonth.toLocaleString("fr-FR")} €
            </p>
          </div>
          <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
              Solde net
            </span>
            <p className="mt-2 font-mono text-xl text-[#F5F0E8]">
              {soldeNet.toLocaleString("fr-FR")} €
            </p>
          </div>
          <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
            <span className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
              Tendance
            </span>
            <p
              className={`mt-2 font-mono text-xl ${trendPositive ? "text-[#a8f08a]" : "text-[#f87171]"}`}
            >
              {trendText}
            </p>
          </div>
        </div>
      </section>

      {recentThree.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
            Projets récents
          </h2>
          <Link
            href="/admin/projects"
            className="block rounded-lg border border-[#222] bg-[#111] p-4 transition-colors duration-200 hover:bg-[#161616]"
          >
            <ul className="space-y-3">
              {recentThree.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center gap-4 border-b border-[#222] pb-3 last:border-b-0 last:pb-0"
                >
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
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-sm text-[#F5F0E8]">
                      {v.projectTitle ?? v.title}
                    </span>
                    {v.client && (
                      <span className="ml-2 font-mono text-xs text-[#8a8a8a]">
                        — {v.client}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Link>
        </section>
      )}

      <section className="mt-10">
        <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
          Activité récente
        </h2>
        <div className="rounded-lg border border-[#222] bg-[#111] p-6">
          {recentFive.length === 0 ? (
            <p className="font-mono text-sm text-[#8a8a8a]">
              Aucune activité récente.
            </p>
          ) : (
            <ul className="space-y-3">
              {recentFive.map((v) => (
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
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
