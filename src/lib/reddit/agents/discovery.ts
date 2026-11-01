import { upsertCommunity } from "../db";
import { logAgentActivity } from "../logger";
import { RedditCommunity } from "../types";

export interface DiscoveredSubredditBrief {
  name: string;
  display_name: string;
  category: string;
  subscribers: number;
  rules_summary: string;
  self_promotion_allowed: boolean;
  link_posting_allowed: boolean;
  karma_requirement: number;
  account_age_days: number;
  sentiment_score: number;
  relevance_score: number;
}

const CURATED_EXPANSION_SUBREDDITS: DiscoveredSubredditBrief[] = [
  {
    name: "r/Wordpress",
    display_name: "WordPress Development & Support",
    category: "Website & E-commerce",
    subscribers: 220000,
    rules_summary: "No job postings or self-promotion outside the weekly sticky.",
    self_promotion_allowed: false,
    link_posting_allowed: false,
    karma_requirement: 30,
    account_age_days: 14,
    sentiment_score: 0.88,
    relevance_score: 0.96,
  },
  {
    name: "r/shopify",
    display_name: "Shopify Merchants & Developers",
    category: "Website & E-commerce",
    subscribers: 280000,
    rules_summary: "Helpful store feedback allowed; overt app spam banned.",
    self_promotion_allowed: false,
    link_posting_allowed: false,
    karma_requirement: 50,
    account_age_days: 14,
    sentiment_score: 0.86,
    relevance_score: 0.97,
  },
  {
    name: "r/PPC",
    display_name: "Pay-Per-Click Advertising",
    category: "Digital Marketing & SEO",
    subscribers: 175000,
    rules_summary: "Campaign strategy breakdowns encouraged; zero vendor pitches.",
    self_promotion_allowed: false,
    link_posting_allowed: false,
    karma_requirement: 25,
    account_age_days: 7,
    sentiment_score: 0.91,
    relevance_score: 0.98,
  },
  {
    name: "r/socialmedia",
    display_name: "Social Media Marketing",
    category: "Digital Marketing & SEO",
    subscribers: 310000,
    rules_summary: "Algorithm updates, organic tactics, and industry discussion.",
    self_promotion_allowed: false,
    link_posting_allowed: false,
    karma_requirement: 30,
    account_age_days: 14,
    sentiment_score: 0.84,
    relevance_score: 0.93,
  },
  {
    name: "r/reactjs",
    display_name: "React & Next.js Developers",
    category: "Programming & Software",
    subscribers: 430000,
    rules_summary: "Showcase thread only for personal projects; technical insights welcomed.",
    self_promotion_allowed: false,
    link_posting_allowed: true,
    karma_requirement: 50,
    account_age_days: 30,
    sentiment_score: 0.89,
    relevance_score: 0.94,
  },
  {
    name: "r/Filmmakers",
    display_name: "Independent Filmmakers & Crew",
    category: "Video Editing & Production",
    subscribers: 1900000,
    rules_summary: "Equipment, post-production pipelines, and client project inquiries.",
    self_promotion_allowed: false,
    link_posting_allowed: true,
    karma_requirement: 40,
    account_age_days: 14,
    sentiment_score: 0.87,
    relevance_score: 0.91,
  },
  {
    name: "r/AfterEffects",
    display_name: "Motion Design & After Effects",
    category: "Video Editing & Production",
    subscribers: 280000,
    rules_summary: "Workflow optimization, render issues, and client deliverables.",
    self_promotion_allowed: false,
    link_posting_allowed: false,
    karma_requirement: 20,
    account_age_days: 7,
    sentiment_score: 0.92,
    relevance_score: 0.95,
  },
  {
    name: "r/UI_Design",
    display_name: "UI / UX Design Community",
    category: "Design & Creative",
    subscribers: 210000,
    rules_summary: "Critiques and design system discussions; no solicitation.",
    self_promotion_allowed: false,
    link_posting_allowed: false,
    karma_requirement: 25,
    account_age_days: 14,
    sentiment_score: 0.88,
    relevance_score: 0.94,
  },
  {
    name: "r/Logo_Critique",
    display_name: "Brand & Logo Critiques",
    category: "Design & Creative",
    subscribers: 140000,
    rules_summary: "Constructive branding feedback; professional conduct required.",
    self_promotion_allowed: false,
    link_posting_allowed: false,
    karma_requirement: 20,
    account_age_days: 7,
    sentiment_score: 0.90,
    relevance_score: 0.92,
  },
];

export async function runCommunityDiscoveryAgent(categoryFilter?: string): Promise<{
  discovered: number;
  communities: RedditCommunity[];
}> {
  await logAgentActivity(
    "Community Discovery",
    "Initiating community scan across target commercial categories",
    "info",
    { categoryFilter: categoryFilter || "All" }
  );

  const targets = categoryFilter && categoryFilter !== "All"
    ? CURATED_EXPANSION_SUBREDDITS.filter((s) => s.category === categoryFilter)
    : CURATED_EXPANSION_SUBREDDITS;

  const results: RedditCommunity[] = [];

  for (const sub of targets) {
    const eligibility: "eligible" | "restricted" =
      sub.sentiment_score >= 0.75 && sub.relevance_score >= 0.80 ? "eligible" : "restricted";

    const saved = await upsertCommunity({
      ...sub,
      status: eligibility,
    });
    results.push(saved);
  }

  await logAgentActivity(
    "Community Discovery",
    `Completed community discovery: ${results.length} subreddits evaluated and indexed`,
    "success",
    { count: results.length, subreddits: results.map((r) => r.name) }
  );

  return {
    discovered: results.length,
    communities: results,
  };
}

