"use client"

import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { formatDate, formatPrice } from "@/utils/helpers"
import { IconDownload } from "@tabler/icons-react"
import { CopyButton } from "@/components/copy-button"
import { ProductThumbnail } from "@/components/product-thumbnail"
import { useDownloadInvoice } from "@/mutations/use-download-invoice"
import {
  Drawer,
  useOverlayState,
  Button,
  Chip,
  Spinner,
  toast,
  cn
} from "@heroui/react"

function SectionRule() {
  return (
    <hr
      className="my-5 shrink-0 border-0 border-t border-divider"
      aria-hidden="true"
    />
  )
}

export function ViewInvoiceDrawer() {
  const onClose = useInvoiceModalStore((state) => state.onClose)
  const invoice = useInvoiceModalStore((state) => state.invoice)
  const storeOpen = useInvoiceModalStore(
    (state) => state.isOpen && state.type === "view"
  )
  const { downloadInvoice, isDownloading } = useDownloadInvoice()

  const overlay = useOverlayState({
    isOpen: storeOpen,
    onOpenChange: (open) => {
      if (!open) onClose()
    }
  })

  if (!invoice) return null

  const balanceDue = Number(invoice.total) - Number(invoice.amountPaid)
  const isPaid = balanceDue <= 0

  return (
    <Drawer state={overlay}>
      <Drawer.Backdrop className="z-[100]">
        <Drawer.Content
          placement="right"
          className="z-[100] flex h-full max-h-[100dvh] min-h-0 max-w-none"
        >
          <Drawer.Dialog
            data-app-drawer-shell
            className={cn(
              "flex !h-full max-h-[100dvh] !max-h-[100dvh] flex-col border-0 !p-0",
              "w-[min(100vw,22rem)] bg-overlay text-left shadow-2xl sm:w-[28rem]"
            )}
          >
            <Drawer.Header className="border-divider relative shrink-0 border-b px-5 pb-4 pt-5 pr-12">
              <Drawer.CloseTrigger className="absolute end-3 top-3" />
              <div className="flex flex-col gap-1">
                <Drawer.Heading className="text-xl font-semibold">
                  Invoice Details
                </Drawer.Heading>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-sm text-default-500">
                    Invoice #{invoice.id}
                  </p>
                  <CopyButton text={invoice.id} className="h-6 w-6 min-w-6" />
                </div>
              </div>
            </Drawer.Header>

            <Drawer.Body
              className={cn(
                "min-h-0 flex-1 overflow-x-hidden overflow-y-auto !p-0",
                "overscroll-y-contain [-webkit-overflow-scrolling:touch]",
                "[scrollbar-gutter:stable]"
              )}
            >
              <div className="min-w-0 px-4 pb-8 pt-4">
                <div className="flex flex-col p-1">
                  <div className="flex items-center justify-between gap-3">
                    <Chip
                      color={isPaid ? "success" : "warning"}
                      variant="soft"
                      size="lg"
                    >
                      {isPaid ? "Paid" : "Pending"}
                    </Chip>
                    <Button
                      variant="secondary"
                      isDisabled={isDownloading}
                      onPress={async () => {
                        try {
                          await downloadInvoice(invoice)
                        } catch {
                          toast.danger("Failed to download invoice")
                        }
                      }}
                    >
                      {isDownloading ? (
                        <Spinner size="sm" color="current" />
                      ) : (
                        <>
                          <IconDownload size={18} className="inline-block md:mr-2" />
                          <span className="hidden md:inline">Download Invoice</span>
                          <span className="inline md:hidden">Download</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <SectionRule />

                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold tracking-wide text-default-600 uppercase">
                      Customer Information
                    </h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-default-500">Name</p>
                        <p className="text-sm font-medium">{invoice.customer.name}</p>
                      </div>
                      {invoice.customer.email ? (
                        <div>
                          <p className="text-xs text-default-500">Email</p>
                          <p className="text-sm text-default-600">
                            {invoice.customer.email}
                          </p>
                        </div>
                      ) : null}
                      {invoice.customer.phone ? (
                        <div>
                          <p className="text-xs text-default-500">Phone</p>
                          <p className="text-sm text-default-600">
                            {invoice.customer.phone}
                          </p>
                        </div>
                      ) : null}
                      {invoice.customer.address ? (
                        <div>
                          <p className="text-xs text-default-500">Address</p>
                          <p className="text-sm text-default-600">
                            {invoice.customer.address}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <SectionRule />

                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold tracking-wide text-default-600 uppercase">
                      Products
                    </h3>
                    <div className="space-y-3">
                      {invoice.products.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-lg border border-divider/50 bg-content1 p-3"
                        >
                          <ProductThumbnail
                            src={product.images?.[0]}
                            alt={product.name || "Product"}
                            boxClassName="size-16 shrink-0 rounded-md"
                          />
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">
                                {product.name || "Unknown Product"}
                              </p>
                              <p className="text-xs text-default-500">
                                Quantity: {product.quantity} ×{" "}
                                {formatPrice(product.price)}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold tabular-nums">
                                {formatPrice(
                                  Number(product.price) * product.quantity
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <SectionRule />

                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold tracking-wide text-default-600 uppercase">
                      Summary
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-default-600">Subtotal</p>
                        <p className="text-sm font-medium tabular-nums">
                          {formatPrice(invoice.total)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-default-600">Amount Paid</p>
                        <p className="text-sm font-medium text-success tabular-nums">
                          {formatPrice(invoice.amountPaid)}
                        </p>
                      </div>
                      <div className="border-divider mt-3 border-t border-dashed pt-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">Balance Due</p>
                          <p
                            className={cn(
                              "text-sm font-bold tabular-nums",
                              isPaid ? "text-success" : "text-danger"
                            )}
                          >
                            {formatPrice(Math.abs(balanceDue))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <SectionRule />

                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold tracking-wide text-default-600 uppercase">
                      Invoice Dates
                    </h3>
                    <div className="space-y-2">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <p className="text-xs text-default-500">Created</p>
                        <p className="text-sm tabular-nums whitespace-nowrap text-default-600">
                          {formatDate(invoice.createdAt)}
                        </p>
                      </div>
                      {invoice.updatedAt ? (
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <p className="text-xs text-default-500">Last Updated</p>
                          <p className="text-sm tabular-nums whitespace-nowrap text-default-600">
                            {formatDate(invoice.updatedAt)}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </Drawer.Body>

            <Drawer.Footer className="bg-overlay border-divider sticky bottom-0 z-10 shrink-0 border-t px-5 py-4">
              <Button
                variant="secondary"
                onPress={() => overlay.close()}
                fullWidth
              >
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  )
}
