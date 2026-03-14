"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FileDown } from "lucide-react";
import type { Invoice } from "@/lib/invoices";
import { downloadInvoicePdf } from "@/lib/download-invoice-pdf";

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

function computeTotal(invoice: Invoice): number {
  return invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
}

export default function InvoicePage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : null;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/invoice/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Facture introuvable");
        return r.json();
      })
      .then(setInvoice)
      .catch(() => setError("Facture introuvable."))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    return (
      <main className="container mx-auto px-6 py-16">
        <p className="font-mono text-sm text-[#8a8a8a]">ID manquant.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container mx-auto px-6 py-16">
        <p className="font-mono text-sm text-[#8a8a8a]">Chargement…</p>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="container mx-auto px-6 py-16">
        <p className="font-mono text-sm text-[#8a8a8a]">{error ?? "Erreur."}</p>
        <Link
          href="/"
          className="mt-4 inline-block font-mono text-sm text-[#F5F0E8] underline transition-colors hover:text-white"
        >
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  const total = computeTotal(invoice);

  return (
    <main className="container mx-auto max-w-2xl px-6 py-12">
      <div className="border border-[#222] bg-[#111] p-8">
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-lg font-mono uppercase tracking-[0.16em] text-[#F5F0E8]">
            antn.studio
          </h1>
          <span className="font-mono text-sm text-[#8a8a8a]">
            Facture {invoice.number}
          </span>
        </div>

        <div className="mb-8">
          <h2 className="mb-2 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
            Client
          </h2>
          <p className="font-mono text-sm text-[#F5F0E8]">
            {invoice.clientName}
          </p>
          {invoice.clientAddress && (
            <p className="font-mono text-sm text-[#8a8a8a]">
              {invoice.clientAddress}
            </p>
          )}
          {invoice.clientEmail && (
            <p className="font-mono text-sm text-[#8a8a8a]">
              {invoice.clientEmail}
            </p>
          )}
        </div>

        <div className="mb-6 text-xs text-[#8a8a8a]">
          <p>Date : {formatDate(invoice.date)}</p>
          {invoice.paymentTerms && (
            <p>Conditions de paiement : {invoice.paymentTerms}</p>
          )}
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#222]">
              <th className="pb-3 text-left text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
                Description
              </th>
              <th className="pb-3 text-right text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
                Qté
              </th>
              <th className="pb-3 text-right text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
                Prix unit.
              </th>
              <th className="pb-3 text-right text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, i) => (
              <tr key={i} className="border-b border-[#222]">
                <td className="py-3 font-mono text-sm text-[#F5F0E8]">
                  {item.description}
                </td>
                <td className="py-3 text-right font-mono text-sm text-[#8a8a8a]">
                  {item.quantity}
                </td>
                <td className="py-3 text-right font-mono text-sm text-[#8a8a8a]">
                  {formatAmount(item.unitPrice)}
                </td>
                <td className="py-3 text-right font-mono text-sm text-[#F5F0E8]">
                  {formatAmount(item.quantity * item.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end border-t border-[#222] pt-4">
          <span className="font-mono text-sm text-[#8a8a8a]">Total HT</span>
          <span className="ml-4 font-mono text-sm font-medium text-[#F5F0E8]">
            {formatAmount(total)}
          </span>
        </div>

        <p className="mt-8 text-xs text-[#666]">
          Micro-entreprise non assujettie à la TVA (article 293 B du CGI).
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={() => downloadInvoicePdf(invoice)}
          className="flex items-center gap-2 rounded-lg border border-[#222] bg-[#161616] px-4 py-2 font-mono text-sm text-[#F5F0E8] transition-colors duration-200 hover:border-[#333] hover:bg-[#1a1a1a]"
        >
          <FileDown className="h-4 w-4" />
          Télécharger le PDF
        </button>
      </div>
    </main>
  );
}
