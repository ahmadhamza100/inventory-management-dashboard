ALTER TABLE "customers" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "deletedAt" timestamp;