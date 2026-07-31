-- Migration: admin roles, AI cost tracking, config settings
-- Run directly in Supabase SQL editor or via: psql $DATABASE_URL -f db/migrations/0004_admin_config.sql

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'admin', 'super_admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS organization text;

ALTER TABLE interview_sessions
  ADD COLUMN IF NOT EXISTS ai_cost_estimate_cents decimal(10,4) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS config_settings (
  key        text PRIMARY KEY,
  value_json jsonb NOT NULL DEFAULT '{}',
  description text,
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Seed default config values
INSERT INTO config_settings (key, value_json, description) VALUES
  ('leaderboard.min_sessions',   '3',       'Minimum evaluated sessions to appear on leaderboard'),
  ('leaderboard.decay_days',     '90',      'Score decay half-life in days'),
  ('leaderboard.max_per_day',    '3',       'Max sessions per day counted toward score'),
  ('season.start_date',          'null',    'Current recruiting season start (ISO date or null)'),
  ('season.end_date',            'null',    'Current recruiting season end (ISO date or null)'),
  ('features.leaderboard',       'true',    'Enable leaderboard feature'),
  ('features.drills',            'true',    'Enable drills feature')
ON CONFLICT (key) DO NOTHING;
