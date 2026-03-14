// lib/download-invoice-pdf.tsx — génère et télécharge le PDF (client-side)
"use client";

import { pdf } from "@react-pdf/renderer";
import { InvoicePDFDocument } from "@/components/invoice/InvoicePDFDocument";
import type { Invoice } from "@/lib/invoices";

export async function downloadInvoicePdf(invoice: Invoice): Promise<void> {
  const blob = await pdf(<InvoicePDFDocument invoice={invoice} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `facture-${invoice.number}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
