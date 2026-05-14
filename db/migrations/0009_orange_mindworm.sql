CREATE TABLE "product_sku_counters" (
	"admin_id" text PRIMARY KEY NOT NULL,
	"next_value" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
