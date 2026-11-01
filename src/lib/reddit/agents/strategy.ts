import { getRedditSettings } from "../db";
import { logAgentActivity } from "../logger";

export interface CampaignStrategyAngle {
  targetCategory: string;
  campaignSlug: string;
  coreAngle: string;
  recommendedCommunities: string[];
  keyHook: string;
}

export const CAMPAIGN_STRATEGY_TEMPLATES: Record<string, CampaignStrategyAngle> = {
  "Website & E-commerce": {
    targetCategory: "Website & E-commerce",
    campaignSlug: "ecommerce_migration_audit",
    coreAngle: "Diagnosing checkout friction and slow database queries during enterprise migrations",
    recommendedCommunities: ["r/ecommerce", "r/shopify", "r/webdev"],
    keyHook: "Why 80% of WooCommerce migrations stall at 10k+ SKUs (and how to architect clean database indexing).",
  },
  "Programming & Software": {
    targetCategory: "Programming & Software",
    campaignSlug: "b2b_client_acquisition_playbook",
    coreAngle: "How boutique software agencies break past the $10k/mo plateau without reliance on spam scrapers",
    recommendedCommunities: ["r/freelance", "r/startups", "r/reactjs"],
    keyHook: "Scrapers are dead for high-ticket dev work. Here is how verified decision-maker sourcing actually works.",
  },
  "Digital Marketing & SEO": {
    targetCategory: "Digital Marketing & SEO",
    campaignSlug: "performance_attribution_audit",
    coreAngle: "Proving true ROAS on Google Ads funnels by stripping out bot traffic and masked conversions",
    recommendedCommunities: ["r/marketing", "r/SEO", "r/PPC"],
    keyHook: "The tracking mistake costing DTC brands 35% of their ad spend in fake attribution clicks.",
  },
  "Video Editing & Production": {
    targetCategory: "Video Editing & Production",
    campaignSlug: "commercial_ugc_retention_benchmark",
    coreAngle: "A/B testing first-3-second retention hooks for commercial brand campaigns",
    recommendedCommunities: ["r/videoediting", "r/videography", "r/Filmmakers"],
    keyHook: "Analyzing 120 commercial video ads: why dynamic captions and 1.8s cut pacing outperform 4k cinematography in ROAS.",
  },
  "Design & Creative": {
    targetCategory: "Design & Creative",
    campaignSlug: "brand_system_velocity",
    coreAngle: "Delivering design systems that engineering teams actually adopt without token debt",
    recommendedCommunities: ["r/graphic_design", "r/UI_Design"],
    keyHook: "The Figma-to-code gap: How to structure design tokens so devs don't override your typography scale.",
  },
};

export function buildRedditAttributionUrl(params: {
  category: string;
  campaignSlug: string;
  medium?: string;
  contentId?: string;
}): string {
  const baseUrl = "https://arova.arenova.in";
  const url = new URL(baseUrl);
  url.searchParams.set("utm_source", "reddit");
  url.searchParams.set("utm_medium", params.medium || "organic");
  url.searchParams.set("utm_campaign", params.campaignSlug);
  if (params.contentId) {
    url.searchParams.set("utm_content", params.contentId);
  }
  return url.toString();
}

export async function checkDailyQuotaSafe(): Promise<{
  canPost: boolean;
  canComment: boolean;
  dailyPostLimit: number;
  dailyCommentLimit: number;
}> {
  const settings = await getRedditSettings();
  if (settings.kill_switch_active || settings.is_paused) {
    return {
      canPost: false,
      canComment: false,
      dailyPostLimit: settings.daily_post_limit,
      dailyCommentLimit: settings.daily_comment_limit,
    };
  }

  return {
    canPost: true,
    canComment: true,
    dailyPostLimit: settings.daily_post_limit,
    dailyCommentLimit: settings.daily_comment_limit,
  };
}

export async function runCampaignStrategyAgent(category: string): Promise<CampaignStrategyAngle> {
  const matched = CAMPAIGN_STRATEGY_TEMPLATES[category] || CAMPAIGN_STRATEGY_TEMPLATES["Programming & Software"];

  await logAgentActivity(
    "Campaign Strategy",
    `Formulated campaign strategy for [${category}]: ${matched.campaignSlug}`,
    "info",
    { angle: matched.coreAngle, targetCommunities: matched.recommendedCommunities }
  );

  return matched;
}

