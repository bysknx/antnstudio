// app/api/admin/invoices/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getInvoices,
  addInvoice,
  computeNextInvoiceNumber,
  type Invoice,
} from "@/lib/invoices";

const COOKIE_NAME = "admin_session";

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token !== "1") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const invoices = await getInvoices();
  return NextResponse.json({ items: Object.values(invoices) });
}

export async function POST(req: NextRequest) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token !== "1") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: Partial<Invoice> & {
    clientName: string;
    lineItems: Invoice["lineItems"];
  } = {} as never;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const invoices = await getInvoices();
  const number = computeNextInvoiceNumber(invoices);
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `inv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const invoice: Invoice = {
    id,
    number,
    date: body.date ?? new Date().toISOString().slice(0, 10),
    clientName: body.clientName ?? "",
    clientAddress: body.clientAddress,
    clientEmail: body.clientEmail,
    lineItems: Array.isArray(body.lineItems) ? body.lineItems : [],
    paymentTerms: body.paymentTerms,
    status: (body.status as Invoice["status"]) ?? "sent",
    createdAt: new Date().toISOString(),
  };

  await addInvoice(invoice);
  return NextResponse.json(invoice);
}
