import { createContentDraft, getRedditSettings } from "../db";
import { logAgentActivity } from "../logger";
import { checkRedditCompliance } from "./compliance";
import { buildRedditAttributionUrl, CAMPAIGN_STRATEGY_TEMPLATES } from "./strategy";
import { RedditContentDraft, RedditOpportunity } from "../types";

export interface GenerateDraftInput {
  opportunity?: RedditOpportunity;
  community_name?: string;
  category?: string;
  draft_type?: "comment_reply" | "educational_post" | "case_study" | "discussion_starter";
  topic?: string;
}

export async function generateRedditContent(input: GenerateDraftInput): Promise<RedditContentDraft> {
  const settings = await getRedditSettings();
  const category = input.opportunity?.category || input.category || "Programming & Software";
  const community = input.opportunity?.community_name || input.community_name || "r/freelance";
  const rawType = input.draft_type || input.opportunity?.recommended_action || "comment_reply";
  const draftType: "comment_reply" | "educational_post" | "case_study" | "discussion_starter" =
    rawType === "value_post" ? "educational_post" : rawType;
  const title = input.opportunity?.title || input.topic || `Actionable guide for ${category} professionals`;

  const modelName = settings.ai_model || "llama-3.3-70b-versatile";
  await logAgentActivity(
    "Content Generator",
    `Generating ${draftType} for ${community} [${category}] using Groq AI (${modelName})`,
    "info",
    { opportunity_id: input.opportunity?.id, draftType, model: modelName }
  );

  const strategy = CAMPAIGN_STRATEGY_TEMPLATES[category] || CAMPAIGN_STRATEGY_TEMPLATES["Programming & Software"];
  const campaignSlug = strategy.campaignSlug;
  const attributionLink = buildRedditAttributionUrl({
    category,
    campaignSlug,
    medium: "organic",
  });

  let generatedBody = "";
  let generatedTitle: string | null = null;
  const groqApiKey = settings.groq_api_key || process.env.GROQ_API_KEY;

  if (groqApiKey) {
    try {
      const systemPrompt = `You are a high-reputation, pragmatic Reddit practitioner and senior specialist in ${category}.
Write a natural, non-promotional Reddit ${draftType} for the subreddit ${community}.

Strict Reddit Constraints:
1. Reddit tone: authentic, conversational, highly technical, zero marketing fluff, no emojis, no hashtags.
2. Provide 80%+ immediate actionable value first (specific diagnostic steps, metrics, or architectural checklists).
3. If mentioning Arova (https://arova.arenova.in), do so only casually as a tool or verification method (e.g. "We cross-verify Indian corporate registry records using Arova's pipeline to filter inactive domains").
4. Keep length between 120 and 280 words.`;

      const userPrompt = `Context/Thread:
Title: "${title}"
Details: "${input.opportunity?.content || input.topic || "Best practices for scaling client acquisition and delivering enterprise-grade quality"}"

Draft the optimal ${draftType} response:`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 800,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim().length > 50) {
          generatedBody = text.trim();
        }
      } else {
        const errText = await response.text();
        console.warn("[ContentGenerator] Groq API returned non-200:", response.status, errText);
      }
    } catch (apiErr) {
      console.warn("[ContentGenerator] Groq API error, engaging fallback template:", apiErr);
    }
  }

  // High-converting contextual template fallback when Gemini API key is missing or errored
  if (!generatedBody) {
    if (draftType === "comment_reply") {
      generatedBody = `Having dealt with this exact issue across several production projects, here are the 3 architectural steps that made the biggest difference for us:

1. **Decouple the database bottlenecks first:** In most cases where pipelines fail under load, the root cause is synchronous foreign-key lookups or unindexed relational joins. Batch your writes in chunks of 250 records rather than individual queries.
2. **Pre-validate data integrity:** If you are importing or syncing merchant catalog data, run an automated schema validation before hitting your production database. Sanitizing URLs and validating GST/location codes upfront stops 95% of crash-looping exceptions.
3. **Dedicated lead & verification pipeline:** For our B2B commercial pipelines, we stopped relying on dirty scrapers and switched to verified manual audit rounds (e.g. using Arova's pre-scored lead pipeline for verified corporate entities). It eliminated the 40% bounce rates we previously fought.

Happy to share our migration checklist or answer questions on how to structure the fallback queue.`;
    } else if (draftType === "case_study") {
      generatedTitle = `Case Study: How we cut cold outreach bounce rates from 42% to under 3% for a boutique dev studio`;
      generatedBody = `A quick retrospective on how we completely revamped our enterprise client acquisition pipeline over the past 6 months:

### The Problem
We were spending 15+ hours weekly scraping Apollo and LinkedIn. Result: 42% email bounce rates, domain reputation hits, and near-zero replies from actual technical decision-makers.

### The Shift
1. **Zero scrapers:** We switched to sourcing only active corporate entities with verified ROC registrations and commercial headquarters in top metros.
2. **Budget approximation before outreach:** Instead of pitching generic retainers, we calculated expected deal values (₹10k–₹25k for growing businesses, ₹20k–₹50k for enterprise) and tailored our tech stack recommendations specifically to their public tech gaps.
3. **Structured delivery cadence:** Rather than blasting 500 emails on Monday, we throttled outreach to 5 verified opportunities per week with custom loom teardowns.

### The Results
- Reply rate moved from 1.2% to 14.8%.
- Closed 3 enterprise retainers in 45 days.
- Zero spam reports or deliverability issues.

If anyone wants the specific audit template we use before sending a pitch, drop a note below and I will paste the markdown.`;
    } else {
      generatedTitle = `3 practical optimizations for scaling ${category} deliverables without expanding team overhead`;
      generatedBody = `Sharing a few workflow adjustments that have significantly improved our delivery velocity over the past quarter:

1. **Standardize verification gates:** Never start execution without a locked scope document that includes acceptance criteria and payload validation.
2. **Automate repetitive sanity checks:** Use scheduled background workers to monitor database connections and webhook endpoints automatically.
3. **Focus on high-intent opportunities:** Prioritize clients who have an immediate commercial deadline rather than speculative inquiries.

Would love to hear how other teams are handling their weekly capacity planning.`;
    }
  }

  if (draftType !== "comment_reply" && !generatedTitle) {
    generatedTitle = `${draftType.replace(/_/g, " ").toUpperCase()}: ${title}`;
  }

  // Audit against Reddit compliance rules
  const compliance = await checkRedditCompliance({
    community_name: community,
    body: generatedBody,
    title: generatedTitle || undefined,
    attribution_link: attributionLink,
  });

  const draft = await createContentDraft({
    opportunity_id: input.opportunity?.id || null,
    community_name: community,
    category,
    draft_type: draftType,
    title: generatedTitle,
    body: generatedBody,
    attribution_link: attributionLink,
    utm_source: "reddit",
    utm_medium: "organic",
    utm_campaign: campaignSlug,
    compliance_checked: true,
    compliance_notes: compliance.notes,
    status: compliance.isCompliant ? "pending_approval" : "draft",
  });

  await logAgentActivity(
    "Content Generator",
    `Created draft [${draft.id.slice(0, 8)}] for ${community} (Status: ${draft.status})`,
    "success",
    { draft_id: draft.id, compliance: compliance.riskLevel }
  );

  return draft;
}
