// app/api/admin/invoices/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getInvoiceById } from "@/lib/invoices";

const COOKIE_NAME = "admin_session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token !== "1") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }
  return NextResponse.json(invoice);
}
