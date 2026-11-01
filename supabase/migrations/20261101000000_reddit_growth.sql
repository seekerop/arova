-- Migration: 20261101000000_reddit_growth.sql
-- Arova Reddit Growth Agent: 12 isolated tables, initial settings, seed communities

CREATE TABLE IF NOT EXISTS reddit_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL,
  account_type TEXT DEFAULT 'standard',
  karma_post INT DEFAULT 0,
  karma_comment INT DEFAULT 0,
  status TEXT DEFAULT 'active',
  client_id TEXT,
  client_secret TEXT,
  refresh_token TEXT,
  access_token TEXT,
  token_expires_at TIMESTAMPTZ,
  daily_post_limit INT DEFAULT 2,
  daily_comment_limit INT DEFAULT 5,
  posts_today INT DEFAULT 0,
  comments_today INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subscribers INT DEFAULT 0,
  rules_summary TEXT,
  self_promotion_allowed BOOLEAN DEFAULT false,
  link_posting_allowed BOOLEAN DEFAULT false,
  karma_requirement INT DEFAULT 0,
  account_age_days INT DEFAULT 0,
  sentiment_score NUMERIC(4,2) DEFAULT 0.85,
  relevance_score NUMERIC(4,2) DEFAULT 0.90,
  status TEXT DEFAULT 'eligible',
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_scan_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'queued',
  target_community TEXT,
  parameters JSONB DEFAULT '{}',
  results_count INT DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL,
  community_name TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT,
  post_url TEXT NOT NULL,
  score INT DEFAULT 50,
  intent_score INT DEFAULT 50,
  urgency_score INT DEFAULT 50,
  reach_score INT DEFAULT 50,
  is_high_intent BOOLEAN DEFAULT false,
  intent_signals TEXT[] DEFAULT '{}',
  pain_points TEXT[] DEFAULT '{}',
  recommended_action TEXT DEFAULT 'comment_reply',
  status TEXT DEFAULT 'discovered',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_content_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES reddit_opportunities(id) ON DELETE SET NULL,
  community_name TEXT NOT NULL,
  category TEXT NOT NULL,
  draft_type TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  attribution_link TEXT,
  utm_source TEXT DEFAULT 'reddit',
  utm_medium TEXT DEFAULT 'organic',
  utm_campaign TEXT,
  compliance_checked BOOLEAN DEFAULT false,
  compliance_notes TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES reddit_content_drafts(id) ON DELETE CASCADE,
  reviewer TEXT DEFAULT 'Admin',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_publish_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID NOT NULL REFERENCES reddit_content_drafts(id) ON DELETE CASCADE,
  mode TEXT DEFAULT 'manual',
  status TEXT DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  reddit_post_id TEXT,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_published_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id UUID REFERENCES reddit_content_drafts(id) ON DELETE SET NULL,
  community_name TEXT NOT NULL,
  post_id TEXT NOT NULL,
  post_url TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  upvotes INT DEFAULT 1,
  comments_count INT DEFAULT 0,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  utm_campaign TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  signups INT DEFAULT 0,
  paid_starter INT DEFAULT 0,
  paid_pro INT DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  target_category TEXT NOT NULL,
  core_angle TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  target_communities TEXT[] DEFAULT '{}',
  budget_goal INT DEFAULT 0,
  posts_planned INT DEFAULT 5,
  posts_published INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name TEXT NOT NULL,
  level TEXT DEFAULT 'info',
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reddit_settings (
  id INT PRIMARY KEY DEFAULT 1,
  gemini_model TEXT DEFAULT 'gemini-1.5-flash',
  publishing_mode TEXT DEFAULT 'manual',
  kill_switch_active BOOLEAN DEFAULT false,
  is_paused BOOLEAN DEFAULT false,
  min_scoring_threshold INT DEFAULT 65,
  daily_post_limit INT DEFAULT 3,
  daily_comment_limit INT DEFAULT 8,
  auto_schedule BOOLEAN DEFAULT false,
  reddit_client_id TEXT DEFAULT '',
  reddit_client_secret TEXT DEFAULT '',
  reddit_username TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Singleton Settings
INSERT INTO reddit_settings (id, gemini_model, publishing_mode, kill_switch_active, is_paused)
VALUES (1, 'gemini-1.5-flash', 'manual', false, false)
ON CONFLICT (id) DO NOTHING;

-- Seed Core High-Authority Communities across Arova's 5 Approved Categories
INSERT INTO reddit_communities (name, display_name, category, subscribers, rules_summary, self_promotion_allowed, link_posting_allowed, karma_requirement, account_age_days, sentiment_score, relevance_score, status)
VALUES
  ('r/freelance', 'Freelancers Community', 'Programming & Software', 345000, 'No direct promo; educational advice allowed with value.', false, false, 50, 30, 0.88, 0.95, 'eligible'),
  ('r/webdev', 'Web Development', 'Website & E-commerce', 2100000, 'Saturday showcase only for promo; technical discussions preferred.', false, true, 100, 30, 0.82, 0.94, 'eligible'),
  ('r/ecommerce', 'E-Commerce Discussion', 'Website & E-commerce', 420000, 'Constructive feedback and case studies welcomed; no spam.', false, false, 50, 14, 0.86, 0.98, 'eligible'),
  ('r/smallbusiness', 'Small Business Owners', 'Website & E-commerce', 1200000, 'Weekly promo thread; helpful problem-solving comments encouraged.', false, false, 30, 14, 0.85, 0.92, 'eligible'),
  ('r/marketing', 'Modern Marketing & Growth', 'Digital Marketing & SEO', 680000, 'Value-first marketing strategies and actionable breakdowns.', false, false, 50, 30, 0.89, 0.96, 'eligible'),
  ('r/SEO', 'Search Engine Optimization', 'Digital Marketing & SEO', 290000, 'Detailed audits and technical insights; no link spamming.', false, false, 30, 14, 0.84, 0.97, 'eligible'),
  ('r/videoediting', 'Video Editors Subreddit', 'Video Editing & Production', 240000, 'Workflow discussions, software critiques, and editing techniques.', false, false, 25, 7, 0.90, 0.95, 'eligible'),
  ('r/videography', 'Videography & Production', 'Video Editing & Production', 190000, 'Commercial video production, camera gear, and client acquisition.', false, false, 25, 14, 0.87, 0.93, 'eligible'),
  ('r/graphic_design', 'Graphic Design Professional', 'Design & Creative', 1400000, 'Portfolio reviews, design critique, client management.', false, false, 50, 30, 0.85, 0.91, 'eligible'),
  ('r/startups', 'Startup Founders & Builders', 'Programming & Software', 1500000, 'Monthly share your startup thread; feedback requests encouraged.', false, true, 50, 30, 0.83, 0.94, 'eligible')
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  category = EXCLUDED.category,
  subscribers = EXCLUDED.subscribers;

-- Initial Agent Log
INSERT INTO reddit_agent_logs (agent_name, level, action, details)
VALUES (
  'System',
  'info',
  'Reddit Growth Agent infrastructure initialized',
  '{"status": "ready", "mode": "manual", "communities_seeded": 10}'::jsonb
);

