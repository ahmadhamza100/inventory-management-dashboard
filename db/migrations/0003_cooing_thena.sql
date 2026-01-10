ALTER TABLE "invoices" ALTER COLUMN "id" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "invoiceId" varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_invoices_id_fk" FOREIGN KEY ("invoiceId") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;