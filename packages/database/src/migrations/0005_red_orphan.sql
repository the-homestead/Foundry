CREATE TABLE "project_files" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"version" varchar(32) NOT NULL,
	"size" varchar(32) NOT NULL,
	"uploaded" timestamp with time zone NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"unique_downloads" integer,
	"channel" varchar(32) NOT NULL,
	"last_downloaded" timestamp with time zone,
	"banner_url" text,
	"dependencies" jsonb
);
--> statement-breakpoint
CREATE TABLE "project_gallery" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"title" text NOT NULL,
	"tone" varchar(64) NOT NULL,
	"aspect" integer NOT NULL,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "project_gantt" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" jsonb NOT NULL,
	"lane" varchar(32) NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE TABLE "project_gantt_markers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"label" text NOT NULL,
	"date" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_kanban_cards" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL,
	"column" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_kanban_columns" (
	"id" uuid PRIMARY KEY NOT NULL,
	"project_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"metadata" jsonb NOT NULL,
	"categories" jsonb NOT NULL,
	"sub_categories" jsonb NOT NULL,
	"description" text NOT NULL,
	"license" text,
	"version" varchar(32) NOT NULL,
	"links" jsonb NOT NULL,
	"status" integer NOT NULL,
	"type" varchar(32) NOT NULL,
	"body" text NOT NULL,
	"icon_url" text,
	"banner_url" text,
	"color" varchar(16),
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL,
	"owner_id" uuid NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "project_files" ADD CONSTRAINT "project_files_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_gallery" ADD CONSTRAINT "project_gallery_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_gantt" ADD CONSTRAINT "project_gantt_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_gantt_markers" ADD CONSTRAINT "project_gantt_markers_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_kanban_cards" ADD CONSTRAINT "project_kanban_cards_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_kanban_cards" ADD CONSTRAINT "project_kanban_cards_column_project_kanban_columns_id_fk" FOREIGN KEY ("column") REFERENCES "public"."project_kanban_columns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_kanban_columns" ADD CONSTRAINT "project_kanban_columns_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;