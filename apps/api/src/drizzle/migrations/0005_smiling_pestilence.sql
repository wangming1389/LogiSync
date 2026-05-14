CREATE TABLE "negotiation_rounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quotation_id" uuid NOT NULL,
	"role" varchar(10) NOT NULL,
	"proposed_price" integer NOT NULL,
	"proposed_delivery_days" integer NOT NULL,
	"note" text,
	"is_accepted" boolean DEFAULT false NOT NULL,
	"submitted_by" uuid NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quotations" RENAME COLUMN "delivery_days" TO "estimated_delivery_date";--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "final_unit_price" integer;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "final_payment_terms" text;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD COLUMN "final_delivery_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "unit_price" integer;--> statement-breakpoint
ALTER TABLE "quotations" ADD COLUMN "delivery_terms" text;--> statement-breakpoint
ALTER TABLE "rfqs" ADD COLUMN "parent_rfq_id" uuid;--> statement-breakpoint
ALTER TABLE "rfqs" ADD COLUMN "supplier_workspace_id" uuid;--> statement-breakpoint
ALTER TABLE "rfqs" ADD COLUMN "is_locked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "negotiation_rounds" ADD CONSTRAINT "negotiation_rounds_quotation_id_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "negotiation_rounds" ADD CONSTRAINT "negotiation_rounds_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_supplier_workspace_id_workspaces_id_fk" FOREIGN KEY ("supplier_workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_products_workspace_status_name" ON "products" USING btree ("workspace_id","status","name");--> statement-breakpoint
CREATE INDEX "idx_products_workspace_status_sku" ON "products" USING btree ("workspace_id","status","sku");