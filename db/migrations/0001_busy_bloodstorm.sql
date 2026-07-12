CREATE TYPE "public"."goal_status" AS ENUM('active', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."goal_type" AS ENUM('score_target', 'drill_count', 'session_count', 'firm_readiness', 'dimension_target');--> statement-breakpoint
CREATE TABLE "drill_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"drill_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"response" text NOT NULL,
	"score" numeric(4, 2),
	"feedback" text,
	"improvement_note" text,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"skill_focus" "dimension" NOT NULL,
	"drill_type" "drill_type" NOT NULL,
	"difficulty" "difficulty" NOT NULL,
	"prompt" text NOT NULL,
	"expected_traits" text[] DEFAULT '{}' NOT NULL,
	"estimated_minutes" integer DEFAULT 5 NOT NULL,
	"interview_mode" "interview_type",
	"is_active" boolean DEFAULT true NOT NULL,
	"times_attempted" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"goal_type" "goal_type" NOT NULL,
	"target_value" numeric(5, 2),
	"current_value" numeric(5, 2) DEFAULT '0',
	"dimension" "dimension",
	"firm_style" "firm_style",
	"target_date" date,
	"goal_status" "goal_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "screener_completed" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "behavioral_confidence_rating" integer;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "quant_comfort_rating" integer;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "screener_baseline_response" text;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "screener_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "scorecards" ADD COLUMN "recruiter_summary" text;--> statement-breakpoint
ALTER TABLE "drill_attempts" ADD CONSTRAINT "drill_attempts_drill_id_drills_id_fk" FOREIGN KEY ("drill_id") REFERENCES "public"."drills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drill_attempts" ADD CONSTRAINT "drill_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;