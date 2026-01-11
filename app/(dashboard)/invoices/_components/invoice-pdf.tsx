import type { InvoiceWithDetails } from "@/stores/use-invoice-modal-store"
import { formatDate, formatPrice } from "@/utils/helpers"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Courier",
    fontSize: 10
  },
  header: {
    marginBottom: 30,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 20
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20
  },
  logoText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb"
  },
  invoiceTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4
  },
  invoiceNumber: {
    fontSize: 11,
    color: "#6b7280",
    fontFamily: "Courier"
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 4
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 16
  },
  label: {
    fontSize: 9,
    color: "#6b7280",
    width: 80,
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  value: {
    fontSize: 10,
    color: "#111827",
    flex: 1
  },
  valueBold: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "bold",
    flex: 1
  },
  table: {
    marginTop: 8
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 8,
    marginBottom: 8
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottom: "1px solid #f3f4f6"
  },
  tableCell: {
    fontSize: 10,
    color: "#111827"
  },
  tableCellNumber: {
    fontSize: 10,
    color: "#111827",
    fontFamily: "Courier",
    textAlign: "right"
  },
  colProduct: {
    width: "40%"
  },
  colQuantity: {
    width: "15%",
    textAlign: "right"
  },
  colPrice: {
    width: "22.5%",
    textAlign: "right"
  },
  colTotal: {
    width: "22.5%",
    textAlign: "right",
    fontWeight: "bold"
  },
  summary: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: "2px solid #111827"
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingVertical: 4
  },
  summaryLabel: {
    fontSize: 10,
    color: "#374151"
  },
  summaryValue: {
    fontSize: 10,
    color: "#111827",
    fontFamily: "Courier",
    fontWeight: "bold"
  },
  summaryValueTotal: {
    fontSize: 12,
    color: "#111827",
    fontFamily: "Courier",
    fontWeight: "bold"
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1px solid #e5e7eb",
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center"
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5
  },
  statusPaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46"
  },
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e"
  }
})

interface InvoicePDFProps {
  invoice: InvoiceWithDetails
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const balanceDue = Number(invoice.total) - Number(invoice.amountPaid)
  const isPaid = balanceDue <= 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="white"
              stroke="#2563eb"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <Path stroke="none" d="M0 0h24v24H0z" fill="none" />
              <Path d="M12 3a9 9 0 1 1 0 18a9 9 0 0 1 0 -18" />
              <Path d="M6 12a6 6 0 0 1 6 -6" />
            </Svg>
            <Text style={styles.logoText}>Dashboard</Text>
          </View>
          <Text style={styles.invoiceTitle}>Invoice</Text>
          <Text style={styles.invoiceNumber}>#{invoice.id}</Text>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.valueBold}>{invoice.customer.name}</Text>
          </View>
          {invoice.customer.email && (
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{invoice.customer.email}</Text>
            </View>
          )}
          {invoice.customer.phone && (
            <View style={styles.row}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{invoice.customer.phone}</Text>
            </View>
          )}
          {invoice.customer.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{invoice.customer.address}</Text>
            </View>
          )}
        </View>

        {/* Products Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Products</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colProduct]}>
                Product
              </Text>
              <Text style={[styles.tableHeaderText, styles.colQuantity]}>
                Qty
              </Text>
              <Text style={[styles.tableHeaderText, styles.colPrice]}>
                Price
              </Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>
                Total
              </Text>
            </View>
            {invoice.products.map((product, index) => {
              const itemTotal = Number(product.price) * product.quantity
              return (
                <View key={index} style={styles.tableRow}>
                  <Text style={[styles.tableCell, styles.colProduct]}>
                    {product.name || "Unknown Product"}
                  </Text>
                  <Text style={[styles.tableCellNumber, styles.colQuantity]}>
                    {product.quantity}
                  </Text>
                  <Text style={[styles.tableCellNumber, styles.colPrice]}>
                    {formatPrice(product.price)}
                  </Text>
                  <Text style={[styles.tableCellNumber, styles.colTotal]}>
                    {formatPrice(itemTotal)}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(invoice.total)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Paid</Text>
            <Text style={styles.summaryValue}>
              {formatPrice(invoice.amountPaid)}
            </Text>
          </View>
          <View
            style={[
              styles.summaryRow,
              { marginTop: 8, paddingTop: 12, borderTop: "1px solid #e5e7eb" }
            ]}
          >
            <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>
              Balance Due
            </Text>
            <Text style={styles.summaryValueTotal}>
              {formatPrice(Math.abs(balanceDue))}
            </Text>
          </View>
          <View style={[styles.row, { marginTop: 12 }]}>
            <Text style={styles.label}>Status</Text>
            <View
              style={[
                styles.statusBadge,
                isPaid ? styles.statusPaid : styles.statusPending
              ]}
            >
              <Text>{isPaid ? "Paid" : "Pending"}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Dates</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>{formatDate(invoice.createdAt)}</Text>
          </View>
          {invoice.updatedAt && (
            <View style={styles.row}>
              <Text style={styles.label}>Updated</Text>
              <Text style={styles.value}>{formatDate(invoice.updatedAt)}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Thank you for your business. This is a computer-generated invoice.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
