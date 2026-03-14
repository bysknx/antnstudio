"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, FileDown, ExternalLink } from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/lib/invoices";
import { downloadInvoicePdf } from "@/lib/download-invoice-pdf";
import { InvoiceCreateModal } from "@/components/invoice/InvoiceCreateModal";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  sent: "Envoyée",
  paid: "Payée",
  overdue: "En retard",
};

function computeTotal(invoice: Invoice): number {
  return invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
  } catch {
    return "—";
  }
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadInvoices = useCallback(() => {
    fetch("/api/admin/invoices", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data?.items) ? data.items : [];
        setInvoices(items);
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleCreated = () => {
    setModalOpen(false);
    loadInvoices();
  };

  return (
    <main className="min-h-[60svh]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-mono uppercase tracking-[0.16em] text-[#F5F0E8]">
            Invoices
          </h1>
          <p className="mt-1 text-xs text-[#8a8a8a]">
            Liste des factures. Export PDF et lien partageable.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#222] bg-[#161616] text-[#F5F0E8] transition-colors duration-200 ease-out hover:border-[#333] hover:bg-[#1a1a1a]"
          aria-label="Nouvelle facture"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-[#8a8a8a]">Chargement…</p>
      ) : invoices.length === 0 ? (
        <p className="mt-8 text-sm text-[#8a8a8a]">
          Aucune facture. Cliquez + pour en créer une.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto border border-[#222] bg-[#111]">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#222]">
                <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                  N° Facture
                </th>
                <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                  Client
                </th>
                <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                  Montant total
                </th>
                <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                  Date
                </th>
                <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                  Statut
                </th>
                <th className="px-3 py-3 text-xs font-mono uppercase tracking-[0.12em] text-[#8a8a8a]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {[...invoices]
                .sort(
                  (a, b) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-[#222] transition-colors duration-200 last:border-b-0 hover:bg-[#161616]"
                  >
                    <td className="px-3 py-3 font-mono text-sm text-[#F5F0E8]">
                      {inv.number}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-[#F5F0E8]">
                      {inv.clientName || "—"}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm text-[#F5F0E8]">
                      {formatAmount(computeTotal(inv))}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-[#8a8a8a]">
                      {formatDate(inv.date)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-block rounded px-2 py-0.5 text-xs font-mono text-[#8a8a8a]">
                        {STATUS_LABELS[inv.status] ?? inv.status}
                      </span>
                    </td>
                    <td className="flex gap-2 px-3 py-3">
                      <a
                        href={`/invoice/${inv.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222] bg-transparent text-[#8a8a8a] transition-colors duration-200 hover:border-[#333] hover:bg-[#161616] hover:text-[#F5F0E8]"
                        aria-label="Voir la facture"
                        title="Voir la facture"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => downloadInvoicePdf(inv)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222] bg-transparent text-[#8a8a8a] transition-colors duration-200 hover:border-[#333] hover:bg-[#161616] hover:text-[#F5F0E8]"
                        aria-label="Télécharger PDF"
                        title="Télécharger PDF"
                      >
                        <FileDown className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      <InvoiceCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </main>
  );
}
