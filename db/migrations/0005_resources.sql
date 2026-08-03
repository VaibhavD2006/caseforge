-- resource_format enum
DO $$ BEGIN
  CREATE TYPE resource_format AS ENUM ('guide','case_book','video','book','drill_ref','link','pdf','definition','checklist');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- resource_difficulty enum
DO $$ BEGIN
  CREATE TYPE resource_difficulty AS ENUM ('beginner','intermediate','advanced','all_levels');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- resource_categories
CREATE TABLE IF NOT EXISTS resource_categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

-- resources
CREATE TABLE IF NOT EXISTS resources (
  id text PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  content text,
  format resource_format NOT NULL,
  difficulty resource_difficulty NOT NULL DEFAULT 'all_levels',
  category_id text REFERENCES resource_categories(id) ON DELETE SET NULL,
  external_url text,
  file_url text,
  author text,
  source text,
  tags text[] NOT NULL DEFAULT '{}',
  is_featured boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT true,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- practice_listings
CREATE TABLE IF NOT EXISTS practice_listings (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  type text NOT NULL,
  booking_url text,
  host_name text,
  duration_minutes integer,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now()
);

-- Seed categories
INSERT INTO resource_categories (id, name, slug, description, icon, sort_order) VALUES
  (gen_random_uuid()::text, 'Consulting Basics', 'consulting-basics', 'What is consulting, MBB, and case interviews', 'Lightbulb', 1),
  (gen_random_uuid()::text, 'Frameworks', 'frameworks', 'Case frameworks and structured thinking', 'Network', 2),
  (gen_random_uuid()::text, 'Case Books', 'case-books', 'School case books from Darden, Penn, and more', 'BookOpen', 3),
  (gen_random_uuid()::text, 'Guides & Articles', 'guides', 'In-depth prep guides and how-tos', 'FileText', 4),
  (gen_random_uuid()::text, 'Recommended Books', 'books', 'Books worth reading for consulting prep', 'Book', 5),
  (gen_random_uuid()::text, 'Videos & Primers', 'videos', 'Video walkthroughs and primers', 'Play', 6)
ON CONFLICT DO NOTHING;

-- Seed some starter resources
INSERT INTO resources (id, title, slug, description, format, difficulty, tags, is_featured, is_published)
SELECT
  gen_random_uuid()::text, title, slug, description, format::resource_format, difficulty::resource_difficulty, tags, is_featured, true
FROM (VALUES
  ('What is Management Consulting?', 'what-is-consulting', 'A clear explanation of what consultants do, who hires them, and why it matters for your career.', 'definition', 'beginner', ARRAY['consulting','basics','101'], true),
  ('What is a Case Interview?', 'what-is-case-interview', 'Everything you need to know about case interviews — structure, format, and what interviewers are looking for.', 'definition', 'beginner', ARRAY['case interview','basics','101'], true),
  ('What is MBB?', 'what-is-mbb', 'McKinsey, BCG, and Bain explained — culture, differences, and how to target them.', 'definition', 'beginner', ARRAY['MBB','McKinsey','BCG','Bain'], true),
  ('Profitability Framework Guide', 'profitability-framework', 'Step-by-step guide to structuring a profitability case from revenues and costs to root cause.', 'guide', 'intermediate', ARRAY['framework','profitability','structure'], true),
  ('Market Sizing: How to Estimate Anything', 'market-sizing-guide', 'A structured approach to market sizing with examples and common estimation anchors.', 'guide', 'intermediate', ARRAY['market sizing','math','estimation'], false),
  ('Case Interview Fundamentals', 'case-interview-fundamentals', 'The complete beginner guide to case interviews — from opening to recommendation.', 'guide', 'beginner', ARRAY['fundamentals','structure','synthesis'], true),
  ('Case in Point', 'case-in-point', 'The classic case interview prep book by Marc Cosentino. Covers frameworks, math, and practice cases.', 'book', 'all_levels', ARRAY['book','frameworks','cases'], false),
  ('Fit Interview Prep Guide', 'fit-interview-guide', 'How to prepare your personal experience stories using the STAR method for consulting behavioral rounds.', 'guide', 'beginner', ARRAY['fit','behavioral','STAR'], false)
) AS t(title, slug, description, format, difficulty, tags, is_featured)
ON CONFLICT DO NOTHING;

-- Seed practice listings
INSERT INTO practice_listings (id, title, description, type, booking_url, host_name, duration_minutes, sort_order) VALUES
  (gen_random_uuid()::text, 'Book a Mock Interview with 180DC', 'Schedule a live case practice session with an experienced 180 Degrees Consulting team member.', 'expert', NULL, '180DC NC State', 45, 1),
  (gen_random_uuid()::text, 'Shadow a Case Session', 'Observe a live case interview between experienced members to learn best practices.', 'shadow', NULL, '180DC NC State', 30, 2),
  (gen_random_uuid()::text, 'Peer Practice Matching', 'Get paired with another student for mutual case practice. Great for building confidence.', 'peer', NULL, NULL, 30, 3)
ON CONFLICT DO NOTHING;
