CREATE TABLE "coupons" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" integer,
	"code" varchar(64) NOT NULL,
	"discount_percent" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "grammar_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" integer,
	"title" varchar(256) NOT NULL,
	"pattern" varchar(256) NOT NULL,
	"meaning" text NOT NULL,
	"explanation" text NOT NULL,
	"level" varchar(12) DEFAULT 'N5',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"brand_id" integer,
	"amount" integer NOT NULL,
	"currency" varchar(12) DEFAULT 'INR' NOT NULL,
	"gateway" varchar(32) DEFAULT 'stripe' NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"reference_id" varchar(256),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grammar_rules" ADD CONSTRAINT "grammar_rules_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_code_unique" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "coupons_brand_idx" ON "coupons" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "grammar_rules_brand_idx" ON "grammar_rules" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "grammar_rules_level_idx" ON "grammar_rules" USING btree ("level");--> statement-breakpoint
CREATE INDEX "transactions_user_idx" ON "transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "transactions_brand_idx" ON "transactions" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "transactions_status_idx" ON "transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "transactions_ref_idx" ON "transactions" USING btree ("reference_id");--> statement-breakpoint
CREATE VIEW "public"."view_course_lessons" AS (select "lessons"."id", "lessons"."title", "lessons"."slug", "modules"."title", "courses"."title", "courses"."slug" from "lessons" inner join "modules" on "lessons"."module_id" = "modules"."id" inner join "courses" on "modules"."course_id" = "courses"."id");--> statement-breakpoint
CREATE VIEW "public"."view_media_usage" AS (select "assets"."id", "assets"."url", "assets"."title", "asset_folders"."name", "asset_collections"."name" from "assets" left join "asset_folders" on "assets"."folder_id" = "asset_folders"."id" left join "asset_collections" on "assets"."collection_id" = "asset_collections"."id");--> statement-breakpoint
CREATE VIEW "public"."view_user_progress" AS (select "users"."id", "users"."email", "users"."display_name", "learner_gamification"."xp", "learner_gamification"."streak_days", "learner_gamification"."level", "learner_gamification"."level_title" from "users" left join "learner_gamification" on "users"."id" = "learner_gamification"."user_id");--> statement-breakpoint
CREATE MATERIALIZED VIEW "public"."mv_leaderboard_standings" AS (select "id", "display_name", "xp", "rank", "league", "streak_days" from "leaderboards" order by "leaderboards"."xp" desc);