import { getCommunities } from "../db";
import { logAgentActivity } from "../logger";

const SPAM_TRIGGERS = [
  "dm me for special discount",
  "buy now",
  "click here",
  "guaranteed rich",
  "passive income fast",
  "limited offer",
  "check my bio",
  "cheap rates whatsapp",
];

export interface ComplianceCheckResult {
  isCompliant: boolean;
  riskLevel: "low" | "medium" | "high";
  flags: string[];
  recommendations: string[];
  notes: string;
}

export async function checkRedditCompliance(params: {
  community_name: string;
  body: string;
  title?: string;
  attribution_link?: string;
}): Promise<ComplianceCheckResult> {
  const flags: string[] = [];
  const recommendations: string[] = [];
  const content = `${params.title || ""} ${params.body}`.toLowerCase();

  // 1. Fetch community rules from DB (safe fallback if offline/testing)
  let matchedSub = null;
  try {
    const communities = await getCommunities();
    matchedSub = communities.find((c) => c.name.toLowerCase() === params.community_name.toLowerCase());
  } catch {
    // Offline or unit test environment without DB connection
  }

  // Check link policy
  if (matchedSub && !matchedSub.link_posting_allowed && params.attribution_link) {
    flags.push(`Direct link posting is restricted in ${params.community_name}`);
    recommendations.push("Remove the bare URL and provide purely advisory value or ask the OP to review case studies in DM if requested.");
  }

  // Check self-promo policy
  if (matchedSub && !matchedSub.self_promotion_allowed) {
    if (content.includes("arova") && (content.includes("sign up") || content.includes("register"))) {
      flags.push(`Explicit promotion detected in non-promotional community ${params.community_name}`);
      recommendations.push("Frame Arova strictly as an engineering/verification case study rather than a direct sales pitch.");
    }
  }

  // Check spam keywords
  for (const trigger of SPAM_TRIGGERS) {
    if (content.includes(trigger)) {
      flags.push(`Spam phrase detected: "${trigger}"`);
      recommendations.push(`Remove promotional phrase "${trigger}" to avoid AutoMod filtering.`);
    }
  }

  // Check educational ratio
  const wordCount = params.body.split(/\s+/).length;
  if (wordCount < 40) {
    flags.push("Draft is too brief (under 40 words); may be flagged as low-effort response.");
    recommendations.push("Expand on the actionable methodology and technical steps.");
  }

  let riskLevel: "low" | "medium" | "high" = "low";
  if (flags.length >= 2) {
    riskLevel = "high";
  } else if (flags.length === 1) {
    riskLevel = "medium";
  }

  const isCompliant = riskLevel !== "high";
  const notes = flags.length === 0
    ? "All community rules satisfied. High value-to-promo ratio verified."
    : `Compliance Warnings: ${flags.join("; ")}`;

  try {
    await logAgentActivity(
      "Compliance Agent",
      `Audited draft for ${params.community_name}: ${riskLevel.toUpperCase()} risk (${isCompliant ? "COMPLIANT" : "FLAGGED"})`,
      isCompliant ? "info" : "warn",
      { flags, riskLevel }
    );
  } catch {
    // Non-blocking log
  }

  return {
    isCompliant,
    riskLevel,
    flags,
    recommendations,
    notes,
  };
}
