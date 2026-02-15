import type { InvoiceWithDetails } from "@/stores/use-invoice-modal-store"
import { formatDate, formatPrice } from "@/utils/helpers"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Courier",
    fontSize: 10
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #2563eb",
    paddingBottom: 16
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10
  },
  logoContainer: {
    flexDirection: "column",
    alignItems: "flex-start"
  },
  logo: {
    height: 40,
    borderRadius: 6,
    objectFit: "contain",
    marginBottom: 6
  },
  businessTagline: {
    fontSize: 7,
    color: "#374151",
    lineHeight: 1.4,
    maxWidth: 200,
    marginTop: 4
  },
  invoiceInfo: {
    alignItems: "flex-end"
  },
  invoiceTitle: {
    fontSize: 26,
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
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 4
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    gap: 12
  },
  label: {
    fontSize: 8,
    color: "#6b7280",
    width: 70,
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  value: {
    fontSize: 9,
    color: "#111827",
    flex: 1
  },
  valueBold: {
    fontSize: 9,
    color: "#111827",
    fontWeight: "bold",
    flex: 1
  },
  table: {
    marginTop: 6
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: 6,
    marginBottom: 6
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.3
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottom: "1px solid #f3f4f6"
  },
  tableCell: {
    fontSize: 9,
    color: "#111827"
  },
  tableCellNumber: {
    fontSize: 9,
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
    marginTop: 16,
    paddingTop: 12,
    borderTop: "2px solid #111827"
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingVertical: 3
  },
  summaryLabel: {
    fontSize: 9,
    color: "#374151"
  },
  summaryValue: {
    fontSize: 9,
    color: "#111827",
    fontFamily: "Courier",
    fontWeight: "bold"
  },
  summaryValueTotal: {
    fontSize: 11,
    color: "#111827",
    fontFamily: "Courier",
    fontWeight: "bold"
  },
  footer: {
    marginTop: 30,
    paddingTop: 16,
    borderTop: "2px solid #2563eb",
    fontSize: 7,
    color: "#374151",
    textAlign: "center"
  },
  footerContact: {
    fontSize: 7,
    color: "#111827",
    fontWeight: "bold",
    marginTop: 6,
    lineHeight: 1.5
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    alignSelf: "flex-start"
  },
  statusPaid: {
    backgroundColor: "#d1fae5",
    color: "#065f46"
  },
  statusPending: {
    backgroundColor: "#fef3c7",
    color: "#92400e"
  },
  twoColumnSection: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16
  },
  column: {
    flex: 1
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
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Image src="/logo.jpeg" style={styles.logo} />
              <Text style={styles.businessTagline}>
                Deals in Laparoscope, Urology, ENT,{"\n"}
                General Surgery Instruments &{"\n"}
                Endoscopy Camera Equipment
              </Text>
            </View>
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceNumber}>#{invoice.id}</Text>
            </View>
          </View>
        </View>

        {/* Two Column Layout for Customer Info and Invoice Dates */}
        <View style={styles.twoColumnSection}>
          {/* Customer Information */}
          <View style={styles.column}>
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

          {/* Invoice Dates */}
          <View style={styles.column}>
            <Text style={styles.sectionTitle}>Invoice Dates</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>{formatDate(invoice.createdAt)}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <View
                style={[
                  styles.statusBadge,
                  isPaid ? styles.statusPaid : styles.statusPending
                ]}
              >
                <Text>{isPaid ? "PAID" : "PENDING"}</Text>
              </View>
            </View>
          </View>
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
              { marginTop: 6, paddingTop: 8, borderTop: "1px solid #e5e7eb" }
            ]}
          >
            <Text style={[styles.summaryLabel, { fontWeight: "bold" }]}>
              Balance Due
            </Text>
            <Text style={styles.summaryValueTotal}>
              {formatPrice(Math.abs(balanceDue))}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerContact}>
            Address: 265/4 A-EXT, CITI HOUSING, DASKA ROAD, SIALKOT
          </Text>
          <Text style={styles.footerContact}>
            Cell: 0331-8586827 | 0300-6121417 | 0323-2523333
          </Text>
        </View>
      </Page>
    </Document>
  )
}
