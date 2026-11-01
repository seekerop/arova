import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getCalendarItems, updateContentDraft } from "@/lib/reddit/db";
import { logAgentActivity } from "@/lib/reddit/logger";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const calendar = await getCalendarItems();
    return NextResponse.json({ success: true, ...calendar });
  } catch (err: any) {
    console.error("[RedditCalendarAPI] GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch calendar" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { draftId, scheduledAt } = body;

    if (!draftId || !scheduledAt) {
      return NextResponse.json({ error: "draftId and scheduledAt required" }, { status: 400 });
    }

    const updated = await updateContentDraft(draftId, {
      status: "scheduled",
      scheduled_at: scheduledAt,
    });

    await logAgentActivity(
      "Scheduler",
      `Scheduled draft [${draftId.slice(0, 8)}] for ${new Date(scheduledAt).toLocaleString()}`,
      "info",
      { draftId, scheduledAt }
    );

    return NextResponse.json({ success: true, draft: updated });
  } catch (err: any) {
    console.error("[RedditCalendarAPI] POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to schedule draft" }, { status: 500 });
  }
}
