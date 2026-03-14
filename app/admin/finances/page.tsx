"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MONTHS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

function buildMockMonthlyData(year: number) {
  return MONTHS.map((month, i) => ({
    month,
    revenues: 1500 + Math.round(Math.random() * 1500) + (i % 3) * 100,
    expenses: 80 + Math.round(Math.random() * 120) + (i % 2) * 30,
  }));
}

const MOCK_REVENUS = [
  { label: "Projet Client A", amount: 1200 },
  { label: "Projet Client B", amount: 800 },
  { label: "Stripe — Facture #12", amount: 450 },
  { label: "Vente formation", amount: 200 },
];

const MOCK_DEPENSES_RECURRENTES = [
  { label: "VPS", amount: 25 },
  { label: "Adobe Creative Cloud", amount: 62 },
  { label: "Domaine antn.studio", amount: 12 },
];

const MOCK_DEPENSES_PONCTUELLES = [
  { label: "Matériel photo", amount: 180 },
  { label: "Formation en ligne", amount: 89 },
];

const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2];

type ViewMode = "mois" | "trimestre" | "annee";

const tooltipContentStyle = {
  backgroundColor: "#161616",
  border: "1px solid #222",
  borderRadius: "8px",
  color: "#F5F0E8",
  fontSize: "12px",
  padding: "8px 12px",
};

export default function AdminFinancesPage() {
  const [year, setYear] = useState(currentYear);
  const [view, setView] = useState<ViewMode>("mois");

  const chartData = useMemo(() => buildMockMonthlyData(year), [year]);

  const totalRevenues = useMemo(
    () => chartData.reduce((s, d) => s + d.revenues, 0),
    [chartData],
  );
  const totalExpenses = useMemo(
    () => chartData.reduce((s, d) => s + d.expenses, 0),
    [chartData],
  );
  const soldeNet = totalRevenues - totalExpenses;

  const selectClass =
    "rounded-lg border border-[#222] bg-[#161616] px-3 py-2 font-mono text-sm text-[#F5F0E8] outline-none transition-colors duration-200 focus:border-[#444]";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-lg font-mono uppercase tracking-[0.16em] text-[#F5F0E8]">
        Finances
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
            Année
          </span>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className={selectClass}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
            Vue
          </span>
          <select
            value={view}
            onChange={(e) => setView(e.target.value as ViewMode)}
            className={selectClass}
          >
            <option value="mois">Mois</option>
            <option value="trimestre">Trimestre</option>
            <option value="annee">Année</option>
          </select>
        </label>
      </div>

      <section className="mt-8">
        <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
          <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
            Revenus et dépenses par mois
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#8a8a8a", fontSize: 11 }}
                  axisLine={{ stroke: "#222" }}
                  tickLine={{ stroke: "#222" }}
                />
                <YAxis
                  tick={{ fill: "#8a8a8a", fontSize: 11 }}
                  axisLine={{ stroke: "#222" }}
                  tickLine={{ stroke: "#222" }}
                  tickFormatter={(v) => `${v} €`}
                />
                <Tooltip
                  contentStyle={tooltipContentStyle}
                  labelStyle={{ color: "#8a8a8a" }}
                  formatter={(value) =>
                    `${Number(value ?? 0).toLocaleString("fr-FR")} €`
                  }
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value) => (
                    <span style={{ color: "#F5F0E8" }}>{value}</span>
                  )}
                />
                <Bar
                  dataKey="revenues"
                  name="Revenus"
                  fill="#a8f08a"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Dépenses"
                  fill="#f87171"
                  radius={[0, 0, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
          <span className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
            Solde net {year}
          </span>
          <p
            className={`mt-2 font-mono text-xl ${soldeNet >= 0 ? "text-[#a8f08a]" : "text-[#f87171]"}`}
          >
            {soldeNet.toLocaleString("fr-FR")} €
          </p>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
          <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
            Revenus
          </h2>
          <ul className="space-y-3">
            {MOCK_REVENUS.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between border-b border-[#222] pb-3 last:border-b-0 last:pb-0"
              >
                <span className="font-mono text-sm text-[#F5F0E8]">
                  {r.label}
                </span>
                <span className="font-mono text-sm text-[#a8f08a]">
                  +{r.amount.toLocaleString("fr-FR")} €
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-[#222] bg-[#111] p-6 transition-colors duration-200">
          <h2 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
            Dépenses
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-[10px] font-mono uppercase tracking-wider text-[#666]">
                Récurrentes
              </h3>
              <ul className="space-y-2">
                {MOCK_DEPENSES_RECURRENTES.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between font-mono text-sm"
                  >
                    <span className="text-[#F5F0E8]">{d.label}</span>
                    <span className="text-[#f87171]">
                      -{d.amount.toLocaleString("fr-FR")} €
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 text-[10px] font-mono uppercase tracking-wider text-[#666]">
                Ponctuelles
              </h3>
              <ul className="space-y-2">
                {MOCK_DEPENSES_PONCTUELLES.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between font-mono text-sm"
                  >
                    <span className="text-[#F5F0E8]">{d.label}</span>
                    <span className="text-[#f87171]">
                      -{d.amount.toLocaleString("fr-FR")} €
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
