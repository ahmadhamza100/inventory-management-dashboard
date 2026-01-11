"use client"

import { useInvoiceModalStore } from "@/stores/use-invoice-modal-store"
import { formatDate, formatPrice } from "@/utils/helpers"
import { IconDownload, IconX, IconPhoto } from "@tabler/icons-react"
import { CopyButton } from "@/components/copy-button"
import { useDownloadInvoice } from "@/mutations/use-download-invoice"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Divider,
  Chip,
  Image,
  cn
} from "@heroui/react"

export function ViewInvoiceDrawer() {
  const onClose = useInvoiceModalStore((state) => state.onClose)
  const invoice = useInvoiceModalStore((state) => state.invoice)
  const isOpen = useInvoiceModalStore(
    (state) => state.isOpen && state.type === "view"
  )
  const { downloadInvoice, isDownloading } = useDownloadInvoice()

  if (!invoice) return null

  const balanceDue = Number(invoice.total) - Number(invoice.amountPaid)
  const isPaid = balanceDue <= 0

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size="lg"
      hideCloseButton
    >
      <DrawerContent>
        <DrawerHeader className="flex flex-col gap-1 border-b border-divider/50">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <h2 className="text-xl font-semibold">Invoice Details</h2>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-mono text-sm text-default-500">
                    Invoice #{invoice.id}
                  </p>
                  <CopyButton text={invoice.id} className="h-6 w-6 min-w-6" />
                </div>
              </div>
            </div>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onPress={onClose}
              className="absolute right-4"
            >
              <IconX size={20} />
            </Button>
          </div>
        </DrawerHeader>
        <DrawerBody className="px-6 py-6">
          <div className="flex flex-col gap-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Chip
                color={isPaid ? "success" : "warning"}
                variant="flat"
                size="lg"
              >
                {isPaid ? "Paid" : "Pending"}
              </Chip>
              <Button
                color="primary"
                variant="flat"
                startContent={<IconDownload size={18} />}
                isLoading={isDownloading}
                isDisabled={isDownloading}
                onPress={() => downloadInvoice(invoice)}
              >
                Download Invoice
              </Button>
            </div>

            <Divider />

            {/* Customer Information */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold tracking-wide text-default-600 uppercase">
                Customer Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-default-500">Name</p>
                  <p className="text-sm font-medium">{invoice.customer.name}</p>
                </div>
                {invoice.customer.email && (
                  <div>
                    <p className="text-xs text-default-500">Email</p>
                    <p className="text-sm text-default-600">
                      {invoice.customer.email}
                    </p>
                  </div>
                )}
                {invoice.customer.phone && (
                  <div>
                    <p className="text-xs text-default-500">Phone</p>
                    <p className="text-sm text-default-600">
                      {invoice.customer.phone}
                    </p>
                  </div>
                )}
                {invoice.customer.address && (
                  <div>
                    <p className="text-xs text-default-500">Address</p>
                    <p className="text-sm text-default-600">
                      {invoice.customer.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Divider />

            {/* Invoice Items */}
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
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name || "Product"}
                        width={64}
                        height={64}
                        radius="md"
                        className="shrink-0 object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-default-100">
                        <IconPhoto className="size-6 text-default-400" />
                      </div>
                    )}
                    <div className="flex flex-1 items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {product.name || "Unknown Product"}
                        </p>
                        <p className="text-xs text-default-500">
                          Quantity: {product.quantity} ×{" "}
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
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

            <Divider />

            {/* Invoice Summary */}
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
                <Divider />
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

            <Divider />

            {/* Invoice Dates */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold tracking-wide text-default-600 uppercase">
                Invoice Dates
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-default-500">Created</p>
                  <p className="text-sm text-default-600">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
                {invoice.updatedAt && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-default-500">Last Updated</p>
                    <p className="text-sm text-default-600">
                      {formatDate(invoice.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter className="border-t border-divider/50">
          <Button variant="flat" onPress={onClose} fullWidth>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
