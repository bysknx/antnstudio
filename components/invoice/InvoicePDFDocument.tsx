"use client";

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { Invoice } from "@/lib/invoices";

const MENTIONS_LEGALES =
  "Micro-entreprise non assujettie à la TVA (article 293 B du CGI).";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 8,
    color: "#666",
    marginBottom: 4,
  },
  clientBlock: {
    marginBottom: 24,
  },
  table: {
    marginTop: 16,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#222",
    paddingBottom: 8,
    marginBottom: 4,
  },
  colDesc: { flex: 3 },
  colQty: { width: 60, textAlign: "right" },
  colUnit: { width: 70, textAlign: "right" },
  colTotal: { width: 80, textAlign: "right" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    paddingTop: 8,
  },
  totalLabel: {
    marginRight: 16,
  },
  mentions: {
    marginTop: 32,
    fontSize: 8,
    color: "#666",
  },
});

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

export function InvoicePDFDocument({ invoice }: { invoice: Invoice }) {
  const total = computeTotal(invoice);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>antn.studio</Text>
          <Text>Facture {invoice.number}</Text>
        </View>

        <View style={styles.clientBlock}>
          <Text style={styles.label}>Client</Text>
          <Text>{invoice.clientName}</Text>
          {invoice.clientAddress && <Text>{invoice.clientAddress}</Text>}
          {invoice.clientEmail && <Text>{invoice.clientEmail}</Text>}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Date : {new Date(invoice.date).toLocaleDateString("fr-FR")}
          </Text>
          {invoice.paymentTerms && (
            <Text style={styles.label}>
              Conditions : {invoice.paymentTerms}
            </Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colDesc}>Description</Text>
            <Text style={styles.colQty}>Qté</Text>
            <Text style={styles.colUnit}>Prix unit.</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>
          {invoice.lineItems.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.colDesc}>{item.description}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colUnit}>{formatAmount(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>
                {formatAmount(item.quantity * item.unitPrice)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total HT</Text>
          <Text>{formatAmount(total)}</Text>
        </View>

        <Text style={styles.mentions}>{MENTIONS_LEGALES}</Text>
      </Page>
    </Document>
  );
}
