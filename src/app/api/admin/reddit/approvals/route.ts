import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getApprovals, reviewApproval } from "@/lib/reddit/db";
import { logAgentActivity } from "@/lib/reddit/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    const approvals = await getApprovals(status);
    return NextResponse.json({ success: true, approvals });
  } catch (err: any) {
    console.error("[RedditApprovalsAPI] GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch approvals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { approvalId, action, notes } = body;

    if (!approvalId || !action) {
      return NextResponse.json({ error: "approvalId and action required" }, { status: 400 });
    }

    const approval = await reviewApproval(approvalId, action, notes);
    await logAgentActivity(
      "Approval Engine",
      `Reviewed draft approval: marked as ${action.toUpperCase()}`,
      action === "approved" ? "success" : "warn",
      { approvalId, action, notes }
    );

    return NextResponse.json({ success: true, approval });
  } catch (err: any) {
    console.error("[RedditApprovalsAPI] POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process review" }, { status: 500 });
  }
}
