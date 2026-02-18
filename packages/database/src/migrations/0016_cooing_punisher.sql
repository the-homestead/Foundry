CREATE TABLE "user_notification_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email_security" boolean DEFAULT true NOT NULL,
	"email_account_updates" boolean DEFAULT true NOT NULL,
	"email_organization" boolean DEFAULT true NOT NULL,
	"email_apikey" boolean DEFAULT true NOT NULL,
	"email_marketing" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_notification_settings" ADD CONSTRAINT "user_notification_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "userNotification_userId_idx" ON "user_notification_settings" USING btree ("user_id");