ALTER TABLE "customers" ADD COLUMN "admin_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "admin_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "admin_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "admin_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "admin_id" text NOT NULL;