"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { InvoiceLineItem } from "@/lib/invoices";

const inputClass =
  "w-full rounded-lg border border-[#222] bg-[#161616] px-3 py-2 font-mono text-sm text-[#F5F0E8] outline-none transition-colors duration-200 focus:border-[#444]";
const labelClass =
  "mb-1 block text-xs font-mono uppercase tracking-wider text-[#8a8a8a]";

const MENTIONS_LEGALES =
  "Micro-entreprise non assujettie à la TVA (article 293 B du CGI).";

type InvoiceCreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export function InvoiceCreateModal({
  open,
  onClose,
  onCreated,
}: InvoiceCreateModalProps) {
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState("30 jours");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addLine = () => {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeLine = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, patch: Partial<InvoiceLineItem>) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!clientName.trim()) {
        setError("Le nom du client est requis.");
        return;
      }
      const validItems = lineItems.filter(
        (item) => item.description.trim() && item.quantity > 0,
      );
      if (validItems.length === 0) {
        setError(
          "Au moins une prestation avec description et quantité est requise.",
        );
        return;
      }
      setSaving(true);
      try {
        const res = await fetch("/api/admin/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: clientName.trim(),
            clientAddress: clientAddress.trim() || undefined,
            clientEmail: clientEmail.trim() || undefined,
            lineItems: validItems.map((item) => ({
              description: item.description.trim(),
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
            date,
            paymentTerms: paymentTerms.trim() || undefined,
            status: "sent",
          }),
        });
        const data = await res.json();
        if (res.ok) {
          onCreated();
          setClientName("");
          setClientAddress("");
          setClientEmail("");
          setLineItems([{ description: "", quantity: 1, unitPrice: 0 }]);
          setDate(new Date().toISOString().slice(0, 10));
          setPaymentTerms("30 jours");
        } else {
          setError(data.error ?? "Erreur lors de la création.");
        }
      } catch {
        setError("Erreur réseau.");
      } finally {
        setSaving(false);
      }
    },
    [
      clientName,
      clientAddress,
      clientEmail,
      lineItems,
      date,
      paymentTerms,
      onCreated,
    ],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 transition-opacity duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[#222] bg-[#111]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#222] px-6 py-4">
          <h2 className="text-sm font-mono uppercase tracking-wider text-[#F5F0E8]">
            Nouvelle facture
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222] bg-transparent text-[#8a8a8a] transition-colors duration-200 hover:border-[#333] hover:bg-[#161616] hover:text-[#F5F0E8]"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Client */}
          <section>
            <h3 className="mb-4 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
              Infos client
            </h3>
            <div className="space-y-4">
              <label className="block">
                <span className={labelClass}>Nom</span>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={inputClass}
                  placeholder="Client SA"
                />
              </label>
              <label className="block">
                <span className={labelClass}>Adresse</span>
                <textarea
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  className={`${inputClass} min-h-[60px]`}
                  placeholder="123 rue Example, 75001 Paris"
                  rows={2}
                />
              </label>
              <label className="block">
                <span className={labelClass}>Email</span>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className={inputClass}
                  placeholder="contact@client.com"
                />
              </label>
            </div>
          </section>

          {/* Prestations */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
                Prestations
              </h3>
              <button
                type="button"
                onClick={addLine}
                className="flex items-center gap-1.5 rounded-lg border border-[#222] bg-[#161616] px-3 py-1.5 text-xs font-mono text-[#F5F0E8] transition-colors duration-200 hover:border-[#333] hover:bg-[#1a1a1a]"
              >
                <Plus className="h-3.5 w-3.5" />
                Ajouter une ligne
              </button>
            </div>
            <div className="space-y-3">
              {lineItems.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-end gap-3 border-b border-[#222] pb-3"
                >
                  <div className="min-w-[200px] flex-1">
                    <span className={labelClass}>Description</span>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateLine(i, { description: e.target.value })
                      }
                      className={inputClass}
                      placeholder="Prestation"
                    />
                  </div>
                  <div className="w-20">
                    <span className={labelClass}>Qté</span>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateLine(i, {
                          quantity: Math.max(
                            1,
                            parseInt(e.target.value, 10) || 1,
                          ),
                        })
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="w-28">
                    <span className={labelClass}>Prix unit.</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice || ""}
                      onChange={(e) =>
                        updateLine(i, {
                          unitPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                      className={inputClass}
                      placeholder="0"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
                    disabled={lineItems.length <= 1}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#222] bg-transparent text-[#666] transition-colors duration-200 hover:border-[#333] hover:bg-[#161616] hover:text-[#F5F0E8] disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Supprimer la ligne"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Mentions légales */}
          <section>
            <h3 className="mb-2 text-xs font-mono uppercase tracking-wider text-[#8a8a8a]">
              Mentions légales
            </h3>
            <p className="text-xs text-[#8a8a8a]">{MENTIONS_LEGALES}</p>
          </section>

          {/* Numéro, date, conditions */}
          <section className="flex flex-wrap gap-6">
            <div className="text-xs text-[#666]">
              Numéro : généré automatiquement (ANTN-{new Date().getFullYear()}-
              XXX)
            </div>
            <label>
              <span className={labelClass}>Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </label>
            <label>
              <span className={labelClass}>Conditions de paiement</span>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className={inputClass}
                placeholder="30 jours"
              />
            </label>
          </section>

          {error && <p className="text-sm text-[#f87171]">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-[#222] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#222] bg-[#161616] px-4 py-2 font-mono text-sm text-[#F5F0E8] transition-colors duration-200 hover:border-[#333] hover:bg-[#1a1a1a]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg border border-[#222] bg-[#161616] px-4 py-2 font-mono text-sm text-[#F5F0E8] transition-colors duration-200 hover:border-[#333] hover:bg-[#1a1a1a] disabled:opacity-50"
            >
              {saving ? "Création…" : "Créer la facture"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
