import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getOpportunities } from "@/lib/reddit/db";
import { runOpportunityScannerAgent } from "@/lib/reddit/agents/scanner";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const isHighIntentParam = searchParams.get("is_high_intent");
    const is_high_intent = isHighIntentParam !== null ? isHighIntentParam === "true" : undefined;
    const status = searchParams.get("status") || undefined;
    const minScoreParam = searchParams.get("min_score");
    const min_score = minScoreParam ? parseInt(minScoreParam, 10) : undefined;

    const opportunities = await getOpportunities({
      category,
      is_high_intent,
      status,
      min_score,
    });

    return NextResponse.json({ success: true, opportunities });
  } catch (err: any) {
    console.error("[RedditOpportunitiesAPI] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch opportunities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const result = await runOpportunityScannerAgent(body);

    return NextResponse.json({
      success: true,
      scannedCount: result.scannedCount,
      opportunities: result.opportunities,
    });
  } catch (err: any) {
    console.error("[RedditOpportunitiesAPI] POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process opportunity" }, { status: 500 });
  }
}

