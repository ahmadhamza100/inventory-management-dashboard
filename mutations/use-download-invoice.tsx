import { pdf } from "@react-pdf/renderer"
import { useMutation } from "@tanstack/react-query"
import { InvoicePDF } from "@/app/(dashboard)/invoices/_components/invoice-pdf"
import type { InvoiceWithDetails } from "@/stores/use-invoice-modal-store"

export function useDownloadInvoice() {
  const { mutate, isPending, ...mutation } = useMutation({
    mutationFn: async (invoice: InvoiceWithDetails) => {
      const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob()

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${invoice.id}.pdf`
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  })

  return { downloadInvoice: mutate, isDownloading: isPending, ...mutation }
}
