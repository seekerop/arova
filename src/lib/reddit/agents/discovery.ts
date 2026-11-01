import { upsertCommunity, getRedditSettings, updateCampaign, getCampaignById } from "../db";
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

// Country-specific community clusters
const COUNTRY_COMMUNITY_FALLBACKS: Record<string, string[]> = {
  india: ["r/developersIndia", "r/IndiaInvestments", "r/bangalore", "r/mumbai", "r/IndianEntreprenuers"],
  us: ["r/smallbusiness", "r/entrepreneur", "r/freelance", "r/startups", "r/SaaS"],
  uk: ["r/UKJobs", "r/UKPersonalFinance", "r/smallbusinessuk", "r/freelanceuk"],
  global: ["r/freelance", "r/smallbusiness", "r/startups", "r/webdev", "r/marketing"],
};

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

export async function scrapeCommunitiesForCampaign(params: {
  campaignId: string;
  productBrief?: string;
  targetCountry?: string;
  targetCategory?: string;
}): Promise<{
  scrapedCount: number;
  communities: RedditCommunity[];
  warning?: string;
}> {
  const settings = await getRedditSettings();
  const groqApiKey = settings.groq_api_key || process.env.GROQ_API_KEY;

  let brief = params.productBrief || "";
  let country = params.targetCountry || "India";
  let category = params.targetCategory || "Programming & Software";

  if (params.campaignId && (!brief || !country)) {
    const campaign = await getCampaignById(params.campaignId);
    if (campaign) {
      brief = brief || campaign.product_brief;
      country = country || campaign.target_country;
      category = category || campaign.target_category;
    }
  }

  await logAgentActivity(
    "Community Discovery",
    `Scraping subreddits for campaign [${params.campaignId.slice(0, 8)}] (Target Country: ${country})`,
    "info",
    { country, category, hasGroqKey: Boolean(groqApiKey) }
  );

  let targetNames: { name: string; description: string; relevance: number }[] = [];
  let warningMessage: string | undefined = undefined;

  if (groqApiKey) {
    try {
      const prompt = `You are a Reddit research agent.
Find 6 to 8 active, highly relevant subreddits where decision-makers or potential buyers in ${country} would look for or discuss:
Product Brief: "${brief}"
Category: "${category}"

Return ONLY valid JSON matching this schema:
{
  "subreddits": [
    { "name": "r/SubName", "description": "Why it is relevant", "relevance": 0.95 }
  ]
}`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: settings.ai_model || "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 600,
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const parsed = JSON.parse(data?.choices?.[0]?.message?.content || "{}");
        if (Array.isArray(parsed.subreddits)) {
          targetNames = parsed.subreddits;
        }
      }
    } catch (err: any) {
      console.warn("[CommunityScraper] Groq call failed:", err);
      warningMessage = `Groq API call encountered an error (${err.message}). Used country-based directory fallback.`;
    }
  } else {
    warningMessage = "Groq API key is not configured. Used geo-curated directory fallback.";
  }

  // Fallback to geo clusters if LLM didn't return list
  if (targetNames.length === 0) {
    const geoKey = country.toLowerCase().includes("india")
      ? "india"
      : country.toLowerCase().includes("uk") || country.toLowerCase().includes("kingdom")
      ? "uk"
      : country.toLowerCase().includes("us") || country.toLowerCase().includes("united states")
      ? "us"
      : "global";

    const cluster = COUNTRY_COMMUNITY_FALLBACKS[geoKey] || COUNTRY_COMMUNITY_FALLBACKS.global;
    targetNames = cluster.map((name) => ({
      name,
      description: `Active ${country} community discussing business, technology, and commercial requirements.`,
      relevance: 0.92,
    }));
  }

  const savedCommunities: RedditCommunity[] = [];

  for (const item of targetNames) {
    const cleanName = item.name.startsWith("r/") ? item.name : `r/${item.name}`;

    // Optionally fetch public Reddit metadata
    let subscriberCount = 100000;
    try {
      const redditRes = await fetch(`https://www.reddit.com/${cleanName}/about.json`, {
        headers: { "User-Agent": "ArovaGrowthAgent/1.0 (Commercial Outreach Verification)" },
        next: { revalidate: 3600 },
      });
      if (redditRes.ok) {
        const redditData = await redditRes.json();
        if (redditData?.data?.subscribers) {
          subscriberCount = redditData.data.subscribers;
        }
      }
    } catch {
      // Safe fallback on public rate limits
    }

    const saved = await upsertCommunity({
      name: cleanName,
      display_name: cleanName.replace("r/", ""),
      category,
      subscribers: subscriberCount,
      rules_summary: item.description,
      relevance_score: item.relevance || 0.9,
      status: "eligible",
    });

    savedCommunities.push(saved);
  }

  // Link to campaign
  if (params.campaignId) {
    await updateCampaign(params.campaignId, {
      target_communities: savedCommunities.map((c) => c.name),
    });
  }

  await logAgentActivity(
    "Community Discovery",
    `Scraped ${savedCommunities.length} communities for campaign [${params.campaignId.slice(0, 8)}]`,
    "success",
    { count: savedCommunities.length, subreddits: savedCommunities.map((c) => c.name) }
  );

  return {
    scrapedCount: savedCommunities.length,
    communities: savedCommunities,
    warning: warningMessage,
  };
}
