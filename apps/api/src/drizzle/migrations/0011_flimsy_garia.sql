ALTER TABLE "users" ADD COLUMN "full_name" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "phone_number" varchar(30);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "id_card" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "department" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "vehicle_type_preference" varchar(100);