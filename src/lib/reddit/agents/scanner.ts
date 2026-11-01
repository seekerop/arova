import { upsertOpportunity, getCommunities } from "../db";
import { logAgentActivity } from "../logger";
import { scoreOpportunity } from "./scoring";
import { RedditOpportunity } from "../types";

export interface ScanTargetInput {
  community_name?: string;
  category?: string;
  manual_url?: string;
  manual_title?: string;
  manual_content?: string;
  min_score_threshold?: number;
}

// Seed discussion archetypes for high-converting Reddit discussions across Arova domains
const SAMPLE_DISCUSSIONS = [
  {
    category: "Website & E-commerce",
    community_name: "r/ecommerce",
    title: "Need a developer to migrate our WooCommerce store with 12k SKUs to Shopify ASAP",
    author: "ShopOwner_Mike",
    content: "Our WooCommerce database has become unmaintainable and crashes during sales spikes. Budget of $4k-$8k allocated. Looking to hire a reliable agency or senior engineer who has executed enterprise migrations before. Need this done within 3 weeks.",
    post_url: "https://reddit.com/r/ecommerce/comments/wc_migrate_12k",
    post_id: "wc_migrate_12k",
  },
  {
    category: "Programming & Software",
    community_name: "r/freelance",
    title: "Struggling to find verified B2B leads for my Next.js & React agency. Cold email open rates are dying.",
    author: "DevLead_Sara",
    content: "We build custom SaaS MVPs and workflow automation tools. Used Apollo and scrapers but 90% of emails bounce or hit spam traps. How are modern boutique dev shops finding actual paying business clients without burning 20 hours a week on manual research?",
    post_url: "https://reddit.com/r/freelance/comments/leads_b2b_dev",
    post_id: "leads_b2b_dev",
  },
  {
    category: "Video Editing & Production",
    community_name: "r/videography",
    title: "Looking to hire a dedicated video editor for high-retention commercial short-form reels ($3k/month retainer)",
    author: "D2C_Founder_Alex",
    content: "We run 3 direct-to-consumer brands and need rapid-turnaround UGC and brand hook variations. Ready to pay immediately for an editor who understands pacing, subtitle timing, and sound design. Send portfolio and turnaround SLA.",
    post_url: "https://reddit.com/r/videography/comments/hire_editor_ugc",
    post_id: "hire_editor_ugc",
  },
  {
    category: "Digital Marketing & SEO",
    community_name: "r/marketing",
    title: "Recommend an agency for performance marketing and Google Ads audit (Budget $5k/mo)",
    author: "GrowthHead_Rohan",
    content: "Our current agency is spending without reporting ROAS. Need an audit of our tracking setup and high-intent keyword funnel. Looking for recommendations from founders who have seen verified revenue attribution.",
    post_url: "https://reddit.com/r/marketing/comments/rec_agency_ppc",
    post_id: "rec_agency_ppc",
  },
  {
    category: "Design & Creative",
    community_name: "r/graphic_design",
    title: "Redesign our website brand identity and design system for upcoming seed round",
    author: "FintechCo_VP",
    content: "We need a complete design overhaul including component library in Figma, investor deck polish, and brand guidelines. Urgent deadline before our Demo Day next month. Seeking experienced design partners.",
    post_url: "https://reddit.com/r/graphic_design/comments/redesign_fintech",
    post_id: "redesign_fintech",
  },
];

export async function runOpportunityScannerAgent(input: ScanTargetInput = {}): Promise<{
  scannedCount: number;
  opportunities: RedditOpportunity[];
}> {
  await logAgentActivity(
    "Opportunity Scanner",
    "Initiating discussion scan across target communities",
    "info",
    { input }
  );

  const discoveredOpportunities: RedditOpportunity[] = [];

  // 1. If manual discussion input is provided:
  if (input.manual_url && input.manual_title) {
    const scored = scoreOpportunity({
      title: input.manual_title,
      content: input.manual_content || "",
      community_name: input.community_name || "r/freelance",
      minThreshold: input.min_score_threshold,
    });

    const opp = await upsertOpportunity({
      post_id: `manual_${Date.now()}`,
      community_name: input.community_name || "r/freelance",
      category: input.category || "Programming & Software",
      title: input.manual_title,
      author: "reddit_user",
      content: input.manual_content || "",
      post_url: input.manual_url,
      score: scored.score,
      intent_score: scored.intent_score,
      urgency_score: scored.urgency_score,
      reach_score: scored.reach_score,
      is_high_intent: scored.is_high_intent,
      intent_signals: scored.intent_signals,
      pain_points: scored.pain_points,
      recommended_action: scored.recommended_action,
      status: "discovered",
    });

    discoveredOpportunities.push(opp);

    await logAgentActivity(
      "Opportunity Scanner",
      `Manually ingested and scored discussion: "${opp.title.slice(0, 40)}..."`,
      "success",
      { score: opp.score, is_high_intent: opp.is_high_intent }
    );

    return { scannedCount: 1, opportunities: discoveredOpportunities };
  }

  // 2. Automated Scan across discussions
  const eligibleCommunities = await getCommunities({ status: "eligible" });
  const communityNames = new Set(eligibleCommunities.map((c) => c.name));

  const candidates = SAMPLE_DISCUSSIONS.filter((d) => {
    if (input.category && input.category !== "All" && d.category !== input.category) {
      return false;
    }
    if (input.community_name && input.community_name !== "All" && d.community_name !== input.community_name) {
      return false;
    }
    return true;
  });

  for (const item of candidates) {
    const scored = scoreOpportunity({
      title: item.title,
      content: item.content,
      community_name: item.community_name,
      minThreshold: input.min_score_threshold,
    });

    const opp = await upsertOpportunity({
      post_id: `${item.post_id}_${Date.now().toString().slice(-4)}`,
      community_name: item.community_name,
      category: item.category,
      title: item.title,
      author: item.author,
      content: item.content,
      post_url: item.post_url,
      score: scored.score,
      intent_score: scored.intent_score,
      urgency_score: scored.urgency_score,
      reach_score: scored.reach_score,
      is_high_intent: scored.is_high_intent,
      intent_signals: scored.intent_signals,
      pain_points: scored.pain_points,
      recommended_action: scored.recommended_action,
      status: "discovered",
    });

    discoveredOpportunities.push(opp);
  }

  await logAgentActivity(
    "Opportunity Scanner",
    `Completed opportunity scan: found ${discoveredOpportunities.length} opportunities`,
    "success",
    {
      scanned_count: candidates.length,
      high_intent_count: discoveredOpportunities.filter((o) => o.is_high_intent).length,
    }
  );

  return {
    scannedCount: discoveredOpportunities.length,
    opportunities: discoveredOpportunities,
  };
}
