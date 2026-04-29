CREATE TABLE "invoice_counters" (
	"admin_id" text PRIMARY KEY NOT NULL,
	"next_value" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "invoice_counters" ("admin_id", "next_value", "updated_at")
SELECT
	"admin_id",
	COALESCE(MAX(CAST(SUBSTRING("id" FROM '\d+$') AS integer)), 0) + 1,
	now()
FROM "invoices"
GROUP BY "admin_id";
--> statement-breakpoint
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_invoiceId_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_pkey";--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_admin_id_id_pk" PRIMARY KEY("admin_id","id");--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_admin_id_invoiceId_invoices_admin_id_id_fk" FOREIGN KEY ("admin_id","invoiceId") REFERENCES "public"."invoices"("admin_id","id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoice_items_admin_invoice_id_idx" ON "invoice_items" USING btree ("admin_id","invoiceId");
