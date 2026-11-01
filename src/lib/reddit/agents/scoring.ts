import { RedditOpportunity } from "../types";

const HIGH_INTENT_PATTERNS = [
  { phrase: "looking to hire", weight: 35, signal: "Direct Hiring Intent" },
  { phrase: "recommend an agency", weight: 30, signal: "Agency Search" },
  { phrase: "need a developer", weight: 25, signal: "Technical Requirement" },
  { phrase: "need an editor", weight: 25, signal: "Video Production Requirement" },
  { phrase: "budget of", weight: 30, signal: "Allocated Budget" },
  { phrase: "ready to pay", weight: 30, signal: "Active Buyer" },
  { phrase: "struggling with leads", weight: 25, signal: "Sales Pipeline Pain" },
  { phrase: "outreach not working", weight: 25, signal: "Cold Outreach Friction" },
  { phrase: "redesign our website", weight: 25, signal: "High-Ticket Web Opportunity" },
  { phrase: "quote for", weight: 20, signal: "Commercial Inquiry" },
  { phrase: "recommendations for", weight: 15, signal: "Recommendation Request" },
  { phrase: "how much should i charge", weight: 15, signal: "Pricing / Scoping Discovery" },
];

const URGENCY_PATTERNS = [
  { phrase: "asap", weight: 30 },
  { phrase: "this week", weight: 25 },
  { phrase: "immediately", weight: 30 },
  { phrase: "urgent", weight: 25 },
  { phrase: "deadline", weight: 20 },
  { phrase: "started yesterday", weight: 20 },
  { phrase: "within 48 hours", weight: 25 },
];

export interface ScoredOpportunityResult {
  score: number;
  intent_score: number;
  urgency_score: number;
  reach_score: number;
  is_high_intent: boolean;
  intent_signals: string[];
  pain_points: string[];
  recommended_action: "comment_reply" | "value_post" | "case_study";
}

export function scoreOpportunity(params: {
  title: string;
  content: string;
  community_name: string;
  minThreshold?: number;
}): ScoredOpportunityResult {
  const text = `${params.title} ${params.content}`.toLowerCase();
  const threshold = params.minThreshold ?? 65;

  let intentScore = 30; // base intent baseline
  const intentSignals: string[] = [];
  const painPoints: string[] = [];

  for (const item of HIGH_INTENT_PATTERNS) {
    if (text.includes(item.phrase)) {
      intentScore += item.weight;
      intentSignals.push(item.signal);
    }
  }

  // Detect pain points
  if (text.includes("lead") || text.includes("client") || text.includes("outreach")) {
    painPoints.push("Client acquisition bottleneck");
  }
  if (text.includes("expensive") || text.includes("agency fee") || text.includes("overpriced")) {
    painPoints.push("Budget sensitivity & pricing skepticism");
  }
  if (text.includes("slow") || text.includes("delayed") || text.includes("communication")) {
    painPoints.push("Delivery speed and accountability");
  }
  if (text.includes("conversion") || text.includes("bounce rate") || text.includes("traffic")) {
    painPoints.push("Funnel conversion underperformance");
  }

  let urgencyScore = 20;
  for (const item of URGENCY_PATTERNS) {
    if (text.includes(item.phrase)) {
      urgencyScore += item.weight;
    }
  }

  // Reach estimation based on target community prestige
  let reachScore = 50;
  if (params.community_name.includes("freelance") || params.community_name.includes("startups")) {
    reachScore = 75;
  } else if (params.community_name.includes("webdev") || params.community_name.includes("marketing")) {
    reachScore = 80;
  }

  // Cap individual scores
  intentScore = Math.min(100, Math.max(10, intentScore));
  urgencyScore = Math.min(100, Math.max(10, urgencyScore));
  reachScore = Math.min(100, Math.max(10, reachScore));

  // Weighted overall: 50% Intent + 30% Urgency + 20% Reach
  const overallScore = Math.round(intentScore * 0.5 + urgencyScore * 0.3 + reachScore * 0.2);
  const isHighIntent = overallScore >= threshold;

  let recommendedAction: "comment_reply" | "value_post" | "case_study" = "comment_reply";
  if (intentSignals.includes("Agency Search") || intentSignals.includes("Direct Hiring Intent")) {
    recommendedAction = "comment_reply";
  } else if (overallScore >= 80) {
    recommendedAction = "case_study";
  } else {
    recommendedAction = "value_post";
  }

  return {
    score: overallScore,
    intent_score: intentScore,
    urgency_score: urgencyScore,
    reach_score: reachScore,
    is_high_intent: isHighIntent,
    intent_signals: intentSignals.length > 0 ? intentSignals : ["General Inquirer"],
    pain_points: painPoints.length > 0 ? painPoints : ["Service vendor evaluation"],
    recommended_action: recommendedAction,
  };
}

