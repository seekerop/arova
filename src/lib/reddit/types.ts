export interface RedditCommunity {
  id: string;
  name: string;
  display_name: string;
  category: string;
  subscribers: number;
  rules_summary: string | null;
  self_promotion_allowed: boolean;
  link_posting_allowed: boolean;
  karma_requirement: number;
  account_age_days: number;
  sentiment_score: number;
  relevance_score: number;
  status: "eligible" | "restricted" | "blocked" | "reviewing";
  last_scanned_at: string | null;
  created_at: string;
}

export interface RedditOpportunity {
  id: string;
  campaign_id?: string | null;
  post_id: string;
  community_name: string;
  category: string;
  title: string;
  author: string;
  content: string | null;
  post_url: string;
  score: number;
  intent_score: number;
  urgency_score: number;
  reach_score: number;
  is_high_intent: boolean;
  intent_signals: string[];
  pain_points: string[];
  recommended_action: "comment_reply" | "value_post" | "case_study";
  status: "discovered" | "drafted" | "approved" | "published" | "dismissed";
  created_at: string;
}

export interface RedditContentDraft {
  id: string;
  campaign_id?: string | null;
  opportunity_id: string | null;
  community_name: string;
  category: string;
  draft_type: "comment_reply" | "educational_post" | "case_study" | "discussion_starter";
  title: string | null;
  body: string;
  attribution_link: string | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string | null;
  compliance_checked: boolean;
  compliance_notes: string | null;
  status: "draft" | "pending_approval" | "approved" | "rejected" | "scheduled" | "published";
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RedditApproval {
  id: string;
  draft_id: string;
  reviewer: string;
  status: "pending" | "approved" | "rejected" | "revision_requested";
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  draft?: RedditContentDraft;
}

export interface RedditPublishJob {
  id: string;
  draft_id: string;
  mode: "manual" | "api";
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  scheduled_at: string | null;
  executed_at: string | null;
  reddit_post_id: string | null;
  error: string | null;
  created_at: string;
}

export interface RedditPublishedPost {
  id: string;
  draft_id: string | null;
  community_name: string;
  post_id: string;
  post_url: string;
  title: string | null;
  body: string;
  upvotes: number;
  comments_count: number;
  last_synced_at: string;
  published_at: string;
}

export interface RedditScanJob {
  id: string;
  job_type: "community_discovery" | "opportunity_scan" | "scoring" | "content_generation" | "strategy_analysis";
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  target_community: string | null;
  parameters: Record<string, any>;
  results_count: number;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface RedditAgentLog {
  id: string;
  agent_name: string;
  level: "info" | "warn" | "error" | "success";
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface RedditSettings {
  id: number;
  gemini_model: string;
  ai_model: string;
  groq_api_key?: string;
  publishing_mode: "manual" | "api";
  kill_switch_active: boolean;
  is_paused: boolean;
  min_scoring_threshold: number;
  daily_post_limit: number;
  daily_comment_limit: number;
  auto_schedule: boolean;
  reddit_client_id: string;
  reddit_client_secret: string;
  reddit_username: string;
  updated_at: string;
}

export interface RedditCampaign {
  id: string;
  name: string;
  product_brief: string;
  target_country: string;
  target_category: string;
  website_url: string;
  core_angle: string;
  status: "active" | "paused" | "completed";
  target_communities: string[];
  budget_goal: number;
  posts_planned: number;
  posts_published: number;
  threads_found: number;
  auto_post: boolean;
  created_at: string;
}

export interface RedditOverviewMetrics {
  communities_discovered: number;
  communities_eligible: number;
  opportunities_discovered: number;
  high_intent_opportunities: number;
  drafts_generated: number;
  pending_approvals: number;
  approved_content: number;
  scheduled_content: number;
  published_posts: number;
  total_upvotes: number;
  total_comments: number;
  website_clicks: number;
  registrations: number;
  paid_subscriptions: number;
  revenue_attributed: number;
}
