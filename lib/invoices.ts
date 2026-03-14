// lib/invoices.ts — factures stockées dans data/invoices.json

import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceStatus = "sent" | "paid" | "overdue";

export type Invoice = {
  id: string;
  number: string;
  date: string;
  clientName: string;
  clientAddress?: string;
  clientEmail?: string;
  lineItems: InvoiceLineItem[];
  paymentTerms?: string;
  status: InvoiceStatus;
  createdAt?: string;
};

export type InvoicesData = Record<string, Invoice>;

const INVOICES_FILENAME = "invoices.json";
const DATA_DIR = "data";

function dataPath(): string {
  return join(process.cwd(), DATA_DIR, INVOICES_FILENAME);
}

export async function getInvoices(): Promise<InvoicesData> {
  try {
    const path = dataPath();
    const raw = await readFile(path, "utf-8");
    const data = JSON.parse(raw);
    if (data && typeof data === "object") {
      return data as InvoicesData;
    }
  } catch {
    // fichier inexistant ou invalide
  }
  return {};
}

export async function setInvoices(data: InvoicesData): Promise<InvoicesData> {
  try {
    const dir = join(process.cwd(), DATA_DIR);
    await mkdir(dir, { recursive: true });
    await writeFile(dataPath(), JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // production (Vercel) : filesystem read-only, on ne fait que retourner
  }
  return data;
}

export async function addInvoice(invoice: Invoice): Promise<Invoice> {
  const invoices = await getInvoices();
  invoices[invoice.id] = invoice;
  await setInvoices(invoices);
  return invoice;
}

export async function getInvoiceById(id: string): Promise<Invoice | null> {
  const invoices = await getInvoices();
  return invoices[id] ?? null;
}

export function computeNextInvoiceNumber(invoices: InvoicesData): string {
  const year = new Date().getFullYear();
  const prefix = `ANTN-${year}-`;
  const sameYear = Object.values(invoices).filter((i) =>
    i.number.startsWith(prefix),
  );
  const maxSeq = sameYear.reduce((max, i) => {
    const seq = parseInt(i.number.replace(prefix, ""), 10);
    return isNaN(seq) ? max : Math.max(max, seq);
  }, 0);
  const seq = (maxSeq + 1).toString().padStart(3, "0");
  return `${prefix}${seq}`;
}
