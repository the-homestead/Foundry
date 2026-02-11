-- Migration: Add enhanced API key management fields
-- Created: 2026-02-08
-- Description: Adds usage tracking, tags, IP restrictions, rate limits, and scopes to apikey table

-- Add usage tracking
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "usage_count" integer DEFAULT 0;
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "last_used_at" timestamp;

-- Add organizational features
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "tags" text[];

-- Add IP restrictions
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "ip_whitelist" text[];
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "ip_blacklist" text[];

-- Add granular rate limiting
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "rate_limit_per_minute" integer;
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "rate_limit_per_hour" integer;
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "rate_limit_per_day" integer;

-- Add scopes/permissions
ALTER TABLE "apikey" ADD COLUMN IF NOT EXISTS "scopes" text[];

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "apikey_last_used_at_idx" ON "apikey"("last_used_at");
CREATE INDEX IF NOT EXISTS "apikey_tags_idx" ON "apikey" USING GIN("tags");
CREATE INDEX IF NOT EXISTS "apikey_scopes_idx" ON "apikey" USING GIN("scopes");

-- Update existing records to have empty arrays for new array columns
UPDATE "apikey" SET "tags" = '{}' WHERE "tags" IS NULL;
UPDATE "apikey" SET "ip_whitelist" = '{}' WHERE "ip_whitelist" IS NULL;
UPDATE "apikey" SET "ip_blacklist" = '{}' WHERE "ip_blacklist" IS NULL;
UPDATE "apikey" SET "scopes" = '{}' WHERE "scopes" IS NULL;
