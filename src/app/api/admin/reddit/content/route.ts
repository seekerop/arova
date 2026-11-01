import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getContentDrafts, updateContentDraft, getOpportunities } from "@/lib/reddit/db";
import { generateRedditContent } from "@/lib/reddit/agents/content";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;

    const drafts = await getContentDrafts({ status, category });
    return NextResponse.json({ success: true, drafts });
  } catch (err: any) {
    console.error("[RedditContentAPI] GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch drafts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.action === "update") {
      const { id, ...updates } = body;
      if (!id) return NextResponse.json({ error: "Draft ID required" }, { status: 400 });
      const updated = await updateContentDraft(id, updates);
      return NextResponse.json({ success: true, draft: updated });
    }

    // Default: generate new draft
    let opp = body.opportunity;
    if (!opp && body.opportunityId) {
      const opps = await getOpportunities();
      opp = opps.find((o) => o.id === body.opportunityId);
    }

    const draft = await generateRedditContent({
      opportunity: opp,
      community_name: body.community_name,
      category: body.category,
      draft_type: body.draft_type,
      topic: body.topic,
    });

    return NextResponse.json({ success: true, draft });
  } catch (err: any) {
    console.error("[RedditContentAPI] POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process draft" }, { status: 500 });
  }
}
