ALTER TABLE "apikey" ADD COLUMN "usage_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "last_used_at" timestamp;--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "ip_whitelist" text[];--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "ip_blacklist" text[];--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "rate_limit_per_minute" integer;--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "rate_limit_per_hour" integer;--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "rate_limit_per_day" integer;--> statement-breakpoint
ALTER TABLE "apikey" ADD COLUMN "scopes" text[];