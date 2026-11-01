import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getRedditOverviewMetrics, getRedditSettings } from "@/lib/reddit/db";
import { getRecentJobs } from "@/lib/reddit/queue";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [metrics, settings, recentJobs] = await Promise.all([
      getRedditOverviewMetrics(),
      getRedditSettings(),
      getRecentJobs(5),
    ]);

    const hasGroqKey = Boolean(settings.groq_api_key || process.env.GROQ_API_KEY);

    return NextResponse.json({
      success: true,
      metrics,
      settings: {
        is_paused: settings.is_paused,
        kill_switch_active: settings.kill_switch_active,
        publishing_mode: settings.publishing_mode,
        ai_model: settings.ai_model,
        has_groq_key: hasGroqKey,
      },
      recentJobs,
    });
  } catch (err: any) {
    console.error("[RedditOverviewAPI] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch overview" }, { status: 500 });
  }
}

