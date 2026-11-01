import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getRecentAgentLogs } from "@/lib/reddit/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const since = searchParams.get("since") || undefined;

    const logs = await getRecentAgentLogs(limit, since);
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    console.error("[RedditLogsAPI] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch logs" }, { status: 500 });
  }
}

