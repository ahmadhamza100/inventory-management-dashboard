ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_invoiceId_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "invoice_items" DROP COLUMN "invoiceId";