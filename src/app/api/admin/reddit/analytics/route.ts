import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getAnalyticsAttribution, recordRedditAttributionEvent } from "@/lib/reddit/db";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const attribution = await getAnalyticsAttribution();
    return NextResponse.json({ success: true, attribution });
  } catch (err: any) {
    console.error("[RedditAnalyticsAPI] GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { campaign, type } = body;

    if (!campaign || !type) {
      return NextResponse.json({ error: "campaign and type required" }, { status: 400 });
    }

    await recordRedditAttributionEvent({ campaign, type });
    return NextResponse.json({ success: true, message: "Attribution event recorded" });
  } catch (err: any) {
    console.error("[RedditAnalyticsAPI] POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to record event" }, { status: 500 });
  }
}
