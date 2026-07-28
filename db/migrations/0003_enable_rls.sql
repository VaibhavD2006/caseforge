-- Enable Row Level Security on all tables.
-- The app connects via the postgres superuser (DATABASE_URL pooler connection)
-- which bypasses RLS automatically, so this does not affect the application.
-- This blocks any direct access via Supabase's anon/authenticated keys.

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."verification_tokens" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."candidate_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."interview_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."transcripts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."scorecards" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."weakness_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."drill_recommendations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."progress_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."goals" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."drill_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."leaderboard_profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."leaderboard_score_cache" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."leaderboard_rank_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."case_library" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."drills" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."interview_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."prompt_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "public"."rubric_configs" ENABLE ROW LEVEL SECURITY;
