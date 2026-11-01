import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getCommunities, upsertCommunity } from "@/lib/reddit/db";
import { logAgentActivity } from "@/lib/reddit/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const status = searchParams.get("status") || undefined;

    const communities = await getCommunities({ category, status });
    return NextResponse.json({ success: true, communities });
  } catch (err: any) {
    console.error("[RedditCommunitiesAPI] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch communities" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ error: "Subreddit name required" }, { status: 400 });
    }

    const saved = await upsertCommunity(body);
    await logAgentActivity("Community Discovery", `Added/updated subreddit: ${saved.name}`, "info");

    return NextResponse.json({ success: true, community: saved });
  } catch (err: any) {
    console.error("[RedditCommunitiesAPI] POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to save community" }, { status: 500 });
  }
}

