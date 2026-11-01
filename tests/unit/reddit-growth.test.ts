import { describe, it, expect } from "vitest";
import { scoreOpportunity } from "@/lib/reddit/agents/scoring";
import { checkRedditCompliance } from "@/lib/reddit/agents/compliance";
import { buildRedditAttributionUrl, CAMPAIGN_STRATEGY_TEMPLATES } from "@/lib/reddit/agents/strategy";

describe("Reddit Growth Agent — Scoring Engine", () => {
  it("accurately identifies high-intent commercial hiring signals", () => {
    const scored = scoreOpportunity({
      title: "Looking to hire a senior Next.js agency with a budget of $5k ASAP",
      content: "We need someone to overhaul our checkout funnel immediately.",
      community_name: "r/freelance",
    });

    expect(scored.score).toBeGreaterThanOrEqual(75);
    expect(scored.is_high_intent).toBe(true);
    expect(scored.intent_signals).toContain("Direct Hiring Intent");
    expect(scored.intent_signals).toContain("Allocated Budget");
    expect(scored.urgency_score).toBeGreaterThanOrEqual(50);
  });

  it("handles non-commercial general discussions with low score baseline", () => {
    const scored = scoreOpportunity({
      title: "What is your favorite mechanical keyboard switch?",
      content: "Just curious what everyone uses for their desk setup.",
      community_name: "r/freelance",
    });

    expect(scored.score).toBeLessThan(65);
    expect(scored.is_high_intent).toBe(false);
    expect(scored.intent_signals).toContain("General Inquirer");
  });

  it("recommends appropriate action archetypes based on score and intent", () => {
    const caseStudyCandidate = scoreOpportunity({
      title: "Recommend an agency for performance marketing audit with budget of $10k ASAP",
      content: "Ready to pay immediately for verified ROAS attribution.",
      community_name: "r/marketing",
    });

    expect(["comment_reply", "case_study"]).toContain(caseStudyCandidate.recommended_action);
  });
});

describe("Reddit Growth Agent — Compliance & Anti-Spam Guard", () => {
  it("flags overt spam triggers and short low-effort content", async () => {
    const audit = await checkRedditCompliance({
      community_name: "r/freelance",
      body: "DM me for special discount buy now!",
    });

    expect(audit.isCompliant).toBe(false);
    expect(audit.riskLevel).toBe("high");
    expect(audit.flags.some((f) => f.includes("Spam phrase"))).toBe(true);
    expect(audit.flags.some((f) => f.includes("too brief"))).toBe(true);
  });

  it("passes high-value, detailed architectural responses", async () => {
    const audit = await checkRedditCompliance({
      community_name: "r/webdev",
      body: `Having resolved this exact database bottleneck on several high-traffic client deployments, here are the 3 architectural fixes that eliminated our latency:
1. First, batch synchronous write operations into chunks of 250 records rather than individual insert statements to avoid transaction pooler exhaustion.
2. Second, index your foreign keys across relational tables before running complex aggregation joins.
3. Third, validate incoming payloads at the edge before sending them to the primary database.
Happy to share our migration checklist or answer questions on database connection tuning.`,
    });

    expect(audit.isCompliant).toBe(true);
    expect(audit.riskLevel).toBe("low");
  });
});

describe("Reddit Growth Agent — Attribution & Strategy", () => {
  it("builds compliant UTM attribution links with proper encoding", () => {
    const url = buildRedditAttributionUrl({
      category: "Website & E-commerce",
      campaignSlug: "ecommerce_migration_audit",
      medium: "organic",
      contentId: "comment_42",
    });

    expect(url).toContain("https://arova.arenova.in/");
    expect(url).toContain("utm_source=reddit");
    expect(url).toContain("utm_medium=organic");
    expect(url).toContain("utm_campaign=ecommerce_migration_audit");
    expect(url).toContain("utm_content=comment_42");
  });

  it("provides tailored strategy angles for all 5 approved Arova categories", () => {
    const categories = [
      "Website & E-commerce",
      "Programming & Software",
      "Digital Marketing & SEO",
      "Video Editing & Production",
      "Design & Creative",
    ];

    for (const cat of categories) {
      const angle = CAMPAIGN_STRATEGY_TEMPLATES[cat];
      expect(angle).toBeDefined();
      expect(angle.targetCategory).toBe(cat);
      expect(angle.recommendedCommunities.length).toBeGreaterThan(0);
      expect(angle.coreAngle.length).toBeGreaterThan(10);
    }
  });
});

