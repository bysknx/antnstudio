// app/api/invoice/[id]/route.ts — lecture publique (sans auth)
import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById } from "@/lib/invoices";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }
  return NextResponse.json(invoice);
}
