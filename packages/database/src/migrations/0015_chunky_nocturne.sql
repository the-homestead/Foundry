CREATE TABLE "oauth_application" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"icon" text,
	"metadata" text,
	"client_id" text,
	"client_secret" text,
	"redirect_urls" text,
	"type" text,
	"disabled" boolean DEFAULT false,
	"user_id" text,
	"created_at" timestamp,
	"updated_at" timestamp,
	CONSTRAINT "oauth_application_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
ALTER TABLE "oauth_client" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "oauth_refresh_token" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE IF EXISTS "oauth_client" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "oauth_refresh_token" CASCADE;--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP CONSTRAINT IF EXISTS "oauth_access_token_token_unique";--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP CONSTRAINT IF EXISTS "oauth_access_token_client_id_oauth_client_client_id_fk";--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP CONSTRAINT IF EXISTS "oauth_access_token_session_id_session_id_fk";--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP CONSTRAINT IF EXISTS "oauth_access_token_refresh_id_oauth_refresh_token_id_fk";--> statement-breakpoint
ALTER TABLE "oauth_consent" DROP CONSTRAINT IF EXISTS "oauth_consent_client_id_oauth_client_client_id_fk";--> statement-breakpoint
ALTER TABLE "oauth_access_token" ALTER COLUMN "client_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ALTER COLUMN "scopes" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ALTER COLUMN "scopes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_consent" ALTER COLUMN "client_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_consent" ALTER COLUMN "scopes" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "oauth_consent" ALTER COLUMN "scopes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD COLUMN "access_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD COLUMN "refresh_token_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD COLUMN "updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "oauth_consent" ADD COLUMN "consent_given" boolean;--> statement-breakpoint
ALTER TABLE "oauth_application" ADD CONSTRAINT "oauth_application_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "oauthApplication_userId_idx" ON "oauth_application" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_client_id_oauth_application_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."oauth_application"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_consent" ADD CONSTRAINT "oauth_consent_client_id_oauth_application_client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."oauth_application"("client_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "oauthAccessToken_clientId_idx" ON "oauth_access_token" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "oauthAccessToken_userId_idx" ON "oauth_access_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "oauthConsent_clientId_idx" ON "oauth_consent" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "oauthConsent_userId_idx" ON "oauth_consent" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP COLUMN IF EXISTS "token";--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP COLUMN IF EXISTS "session_id";--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP COLUMN IF EXISTS "reference_id";--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP COLUMN IF EXISTS "refresh_id";--> statement-breakpoint
ALTER TABLE "oauth_access_token" DROP COLUMN IF EXISTS "expires_at";--> statement-breakpoint
ALTER TABLE "oauth_consent" DROP COLUMN IF EXISTS "reference_id";--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_access_token_unique" UNIQUE("access_token");--> statement-breakpoint
ALTER TABLE "oauth_access_token" ADD CONSTRAINT "oauth_access_token_refresh_token_unique" UNIQUE("refresh_token");