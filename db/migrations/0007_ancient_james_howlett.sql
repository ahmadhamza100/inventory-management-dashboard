CREATE INDEX "customers_admin_deleted_idx" ON "customers" USING btree ("admin_id","deletedAt");--> statement-breakpoint
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items" USING btree ("invoiceId");--> statement-breakpoint
CREATE INDEX "invoice_items_product_id_idx" ON "invoice_items" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "invoices_admin_deleted_idx" ON "invoices" USING btree ("admin_id","deletedAt");--> statement-breakpoint
CREATE INDEX "invoices_customer_id_idx" ON "invoices" USING btree ("customerId");--> statement-breakpoint
CREATE INDEX "products_admin_deleted_idx" ON "products" USING btree ("admin_id","deletedAt");--> statement-breakpoint
CREATE INDEX "transactions_admin_deleted_idx" ON "transactions" USING btree ("admin_id","deletedAt");