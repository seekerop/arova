import { getDbPool } from "@/lib/db";
import {
  RedditCommunity,
  RedditOpportunity,
  RedditContentDraft,
  RedditApproval,
  RedditPublishedPost,
  RedditSettings,
  RedditOverviewMetrics,
  RedditScanJob,
} from "./types";

export async function getRedditSettings(): Promise<RedditSettings> {
  const pool = getDbPool();
  const res = await pool.query(`SELECT * FROM reddit_settings WHERE id = 1 LIMIT 1`);
  if (res.rows.length === 0) {
    const insertRes = await pool.query(
      `INSERT INTO reddit_settings (id, gemini_model, publishing_mode, kill_switch_active, is_paused)
       VALUES (1, 'gemini-1.5-flash', 'manual', false, false)
       RETURNING *`
    );
    return insertRes.rows[0] as RedditSettings;
  }
  return res.rows[0] as RedditSettings;
}

export async function updateRedditSettings(updates: Partial<RedditSettings>): Promise<RedditSettings> {
  const pool = getDbPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(updates)) {
    if (key !== "id" && val !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
  }

  fields.push(`updated_at = NOW()`);
  values.push(1);

  const res = await pool.query(
    `UPDATE reddit_settings SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return res.rows[0] as RedditSettings;
}

export async function getRedditOverviewMetrics(): Promise<RedditOverviewMetrics> {
  const pool = getDbPool();
  const [
    commRes,
    oppRes,
    draftRes,
    pubRes,
    analyticsRes,
  ] = await Promise.all([
    pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'eligible') as eligible
      FROM reddit_communities
    `),
    pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_high_intent = true) as high_intent
      FROM reddit_opportunities
    `),
    pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending_approval') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled
      FROM reddit_content_drafts
    `),
    pool.query(`
      SELECT 
        COUNT(*) as total,
        COALESCE(SUM(upvotes), 0) as upvotes,
        COALESCE(SUM(comments_count), 0) as comments
      FROM reddit_published_posts
    `),
    pool.query(`
      SELECT 
        COALESCE(SUM(clicks), 0) as clicks,
        COALESCE(SUM(signups), 0) as signups,
        COALESCE(SUM(paid_starter + paid_pro), 0) as paid_subs,
        COALESCE(SUM(revenue), 0) as revenue
      FROM reddit_analytics
    `),
  ]);

  return {
    communities_discovered: parseInt(commRes.rows[0]?.total || "0", 10),
    communities_eligible: parseInt(commRes.rows[0]?.eligible || "0", 10),
    opportunities_discovered: parseInt(oppRes.rows[0]?.total || "0", 10),
    high_intent_opportunities: parseInt(oppRes.rows[0]?.high_intent || "0", 10),
    drafts_generated: parseInt(draftRes.rows[0]?.total || "0", 10),
    pending_approvals: parseInt(draftRes.rows[0]?.pending || "0", 10),
    approved_content: parseInt(draftRes.rows[0]?.approved || "0", 10),
    scheduled_content: parseInt(draftRes.rows[0]?.scheduled || "0", 10),
    published_posts: parseInt(pubRes.rows[0]?.total || "0", 10),
    total_upvotes: parseInt(pubRes.rows[0]?.upvotes || "0", 10),
    total_comments: parseInt(pubRes.rows[0]?.comments || "0", 10),
    website_clicks: parseInt(analyticsRes.rows[0]?.clicks || "0", 10),
    registrations: parseInt(analyticsRes.rows[0]?.signups || "0", 10),
    paid_subscriptions: parseInt(analyticsRes.rows[0]?.paid_subs || "0", 10),
    revenue_attributed: parseFloat(analyticsRes.rows[0]?.revenue || "0"),
  };
}

export async function getCommunities(filter?: { category?: string; status?: string }): Promise<RedditCommunity[]> {
  const pool = getDbPool();
  let query = `SELECT * FROM reddit_communities`;
  const conditions: string[] = [];
  const params: any[] = [];

  if (filter?.category && filter.category !== "All") {
    params.push(filter.category);
    conditions.push(`category = $${params.length}`);
  }
  if (filter?.status && filter.status !== "All") {
    params.push(filter.status);
    conditions.push(`status = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY subscribers DESC`;
  const res = await pool.query(query, params);
  return res.rows as RedditCommunity[];
}

export async function upsertCommunity(community: Partial<RedditCommunity>): Promise<RedditCommunity> {
  const pool = getDbPool();
  const res = await pool.query(
    `INSERT INTO reddit_communities (
      name, display_name, category, subscribers, rules_summary,
      self_promotion_allowed, link_posting_allowed, karma_requirement,
      account_age_days, sentiment_score, relevance_score, status, last_scanned_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
    ON CONFLICT (name) DO UPDATE SET
      display_name = EXCLUDED.display_name,
      category = EXCLUDED.category,
      subscribers = EXCLUDED.subscribers,
      rules_summary = COALESCE(EXCLUDED.rules_summary, reddit_communities.rules_summary),
      self_promotion_allowed = EXCLUDED.self_promotion_allowed,
      link_posting_allowed = EXCLUDED.link_posting_allowed,
      status = EXCLUDED.status,
      last_scanned_at = NOW()
    RETURNING *`,
    [
      community.name,
      community.display_name || community.name,
      community.category || "Programming & Software",
      community.subscribers || 0,
      community.rules_summary || null,
      community.self_promotion_allowed ?? false,
      community.link_posting_allowed ?? false,
      community.karma_requirement ?? 0,
      community.account_age_days ?? 0,
      community.sentiment_score ?? 0.85,
      community.relevance_score ?? 0.90,
      community.status || "eligible",
    ]
  );
  return res.rows[0] as RedditCommunity;
}

export async function getOpportunities(filter?: {
  category?: string;
  is_high_intent?: boolean;
  status?: string;
  min_score?: number;
}): Promise<RedditOpportunity[]> {
  const pool = getDbPool();
  let query = `SELECT * FROM reddit_opportunities`;
  const conditions: string[] = [];
  const params: any[] = [];

  if (filter?.category && filter.category !== "All") {
    params.push(filter.category);
    conditions.push(`category = $${params.length}`);
  }
  if (filter?.is_high_intent !== undefined) {
    params.push(filter.is_high_intent);
    conditions.push(`is_high_intent = $${params.length}`);
  }
  if (filter?.status && filter.status !== "All") {
    params.push(filter.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filter?.min_score) {
    params.push(filter.min_score);
    conditions.push(`score >= $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY score DESC, created_at DESC`;
  const res = await pool.query(query, params);
  return res.rows as RedditOpportunity[];
}

export async function upsertOpportunity(opp: Partial<RedditOpportunity>): Promise<RedditOpportunity> {
  const pool = getDbPool();
  const res = await pool.query(
    `INSERT INTO reddit_opportunities (
      post_id, community_name, category, title, author, content, post_url,
      score, intent_score, urgency_score, reach_score, is_high_intent,
      intent_signals, pain_points, recommended_action, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      opp.post_id || `post_${Date.now()}`,
      opp.community_name,
      opp.category,
      opp.title,
      opp.author || "redditor",
      opp.content || "",
      opp.post_url,
      opp.score ?? 50,
      opp.intent_score ?? 50,
      opp.urgency_score ?? 50,
      opp.reach_score ?? 50,
      opp.is_high_intent ?? false,
      opp.intent_signals || [],
      opp.pain_points || [],
      opp.recommended_action || "comment_reply",
      opp.status || "discovered",
    ]
  );
  return res.rows[0] as RedditOpportunity;
}

export async function getContentDrafts(filter?: {
  status?: string;
  category?: string;
}): Promise<RedditContentDraft[]> {
  const pool = getDbPool();
  let query = `SELECT * FROM reddit_content_drafts`;
  const conditions: string[] = [];
  const params: any[] = [];

  if (filter?.status && filter.status !== "All") {
    params.push(filter.status);
    conditions.push(`status = $${params.length}`);
  }
  if (filter?.category && filter.category !== "All") {
    params.push(filter.category);
    conditions.push(`category = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(" AND ");
  }

  query += ` ORDER BY created_at DESC`;
  const res = await pool.query(query, params);
  return res.rows as RedditContentDraft[];
}

export async function createContentDraft(draft: Partial<RedditContentDraft>): Promise<RedditContentDraft> {
  const pool = getDbPool();
  const res = await pool.query(
    `INSERT INTO reddit_content_drafts (
      opportunity_id, community_name, category, draft_type, title, body,
      attribution_link, utm_source, utm_medium, utm_campaign,
      compliance_checked, compliance_notes, status, scheduled_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *`,
    [
      draft.opportunity_id || null,
      draft.community_name,
      draft.category,
      draft.draft_type || "comment_reply",
      draft.title || null,
      draft.body,
      draft.attribution_link || null,
      draft.utm_source || "reddit",
      draft.utm_medium || "organic",
      draft.utm_campaign || null,
      draft.compliance_checked ?? false,
      draft.compliance_notes || null,
      draft.status || "draft",
      draft.scheduled_at || null,
    ]
  );

  const createdDraft = res.rows[0] as RedditContentDraft;

  // Auto-create approval queue item if pending_approval
  if (createdDraft.status === "pending_approval") {
    await pool.query(
      `INSERT INTO reddit_approvals (draft_id, status) VALUES ($1, 'pending')`,
      [createdDraft.id]
    );
  }

  return createdDraft;
}

export async function updateContentDraft(id: string, updates: Partial<RedditContentDraft>): Promise<RedditContentDraft> {
  const pool = getDbPool();
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;

  for (const [key, val] of Object.entries(updates)) {
    if (key !== "id" && val !== undefined) {
      fields.push(`${key} = $${idx}`);
      values.push(val);
      idx++;
    }
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const res = await pool.query(
    `UPDATE reddit_content_drafts SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );

  const updatedDraft = res.rows[0] as RedditContentDraft;

  // Ensure approval record exists if status is pending_approval
  if (updatedDraft.status === "pending_approval") {
    await pool.query(
      `INSERT INTO reddit_approvals (draft_id, status) VALUES ($1, 'pending')
       ON CONFLICT DO NOTHING`,
      [updatedDraft.id]
    );
  }

  return updatedDraft;
}

export async function getApprovals(status: string = "pending"): Promise<RedditApproval[]> {
  const pool = getDbPool();
  let query = `
    SELECT a.*, row_to_json(d.*) as draft
    FROM reddit_approvals a
    JOIN reddit_content_drafts d ON a.draft_id = d.id
  `;
  const params: any[] = [];

  if (status !== "All") {
    params.push(status);
    query += ` WHERE a.status = $1`;
  }

  query += ` ORDER BY a.created_at DESC`;
  const res = await pool.query(query, params);
  return res.rows as RedditApproval[];
}

export async function reviewApproval(
  approvalId: string,
  status: "approved" | "rejected" | "revision_requested",
  notes?: string
): Promise<RedditApproval> {
  const pool = getDbPool();
  const res = await pool.query(
    `UPDATE reddit_approvals
     SET status = $1, notes = $2, reviewed_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, notes || null, approvalId]
  );

  const approval = res.rows[0] as RedditApproval;

  // Update associated draft status
  const draftStatus = status === "approved" ? "approved" : status === "rejected" ? "rejected" : "draft";
  await pool.query(
    `UPDATE reddit_content_drafts SET status = $1, updated_at = NOW() WHERE id = $2`,
    [draftStatus, approval.draft_id]
  );

  return approval;
}

export async function getCalendarItems(): Promise<{
  scheduled: RedditContentDraft[];
  published: RedditPublishedPost[];
}> {
  const pool = getDbPool();
  const [scheduledRes, publishedRes] = await Promise.all([
    pool.query(`
      SELECT * FROM reddit_content_drafts
      WHERE status IN ('approved', 'scheduled')
      ORDER BY scheduled_at ASC NULLS LAST, created_at DESC
    `),
    pool.query(`
      SELECT * FROM reddit_published_posts
      ORDER BY published_at DESC
      LIMIT 50
    `),
  ]);

  return {
    scheduled: scheduledRes.rows as RedditContentDraft[],
    published: publishedRes.rows as RedditPublishedPost[],
  };
}

export async function createPublishedPost(post: {
  draft_id?: string;
  community_name: string;
  post_id: string;
  post_url: string;
  title?: string;
  body: string;
}): Promise<RedditPublishedPost> {
  const pool = getDbPool();
  const res = await pool.query(
    `INSERT INTO reddit_published_posts (
      draft_id, community_name, post_id, post_url, title, body, upvotes, comments_count, published_at
    ) VALUES ($1, $2, $3, $4, $5, $6, 1, 0, NOW())
    RETURNING *`,
    [
      post.draft_id || null,
      post.community_name,
      post.post_id,
      post.post_url,
      post.title || null,
      post.body,
    ]
  );

  if (post.draft_id) {
    await pool.query(
      `UPDATE reddit_content_drafts SET status = 'published', updated_at = NOW() WHERE id = $1`,
      [post.draft_id]
    );
  }

  return res.rows[0] as RedditPublishedPost;
}

export async function getAnalyticsAttribution() {
  const pool = getDbPool();
  const res = await pool.query(`
    SELECT 
      utm_campaign,
      SUM(views) as total_views,
      SUM(clicks) as total_clicks,
      SUM(signups) as total_signups,
      SUM(paid_starter) as starter_subs,
      SUM(paid_pro) as pro_subs,
      SUM(revenue) as total_revenue
    FROM reddit_analytics
    GROUP BY utm_campaign
    ORDER BY total_revenue DESC, total_clicks DESC
  `);
  return res.rows;
}

export async function recordRedditAttributionEvent(event: {
  campaign: string;
  type: "view" | "click" | "signup" | "starter_conversion" | "pro_conversion";
}) {
  const pool = getDbPool();
  const date = new Date().toISOString().split("T")[0];

  const col =
    event.type === "view"
      ? "views"
      : event.type === "click"
      ? "clicks"
      : event.type === "signup"
      ? "signups"
      : event.type === "starter_conversion"
      ? "paid_starter"
      : "paid_pro";

  const revInc = event.type === "starter_conversion" ? 499 : event.type === "pro_conversion" ? 999 : 0;

  await pool.query(
    `INSERT INTO reddit_analytics (utm_campaign, date, ${col}, revenue)
     VALUES ($1, $2, 1, $3)
     ON CONFLICT DO NOTHING`,
    [event.campaign, date, revInc]
  );
}
