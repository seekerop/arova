import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getRedditSettings, updateRedditSettings } from "@/lib/reddit/db";
import { logAgentActivity } from "@/lib/reddit/logger";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getRedditSettings();
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        groq_api_key: settings.groq_api_key ? "••••••••" + settings.groq_api_key.slice(-4) : "",
        reddit_client_secret: settings.reddit_client_secret ? "••••••••" : "",
      },
    });
  } catch (err: any) {
    console.error("[RedditSettingsAPI] GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const updates: any = {};

    if (body.ai_model !== undefined) updates.ai_model = body.ai_model;
    if (body.groq_api_key !== undefined && !body.groq_api_key.includes("••••")) {
      updates.groq_api_key = body.groq_api_key;
    }
    if (body.publishing_mode !== undefined) updates.publishing_mode = body.publishing_mode;
    if (body.min_scoring_threshold !== undefined) updates.min_scoring_threshold = parseInt(body.min_scoring_threshold, 10);
    if (body.daily_post_limit !== undefined) updates.daily_post_limit = parseInt(body.daily_post_limit, 10);
    if (body.daily_comment_limit !== undefined) updates.daily_comment_limit = parseInt(body.daily_comment_limit, 10);
    if (body.auto_schedule !== undefined) updates.auto_schedule = !!body.auto_schedule;
    if (body.reddit_client_id !== undefined) updates.reddit_client_id = body.reddit_client_id;
    if (body.reddit_client_secret !== undefined && !body.reddit_client_secret.includes("••••")) {
      updates.reddit_client_secret = body.reddit_client_secret;
    }
    if (body.reddit_username !== undefined) updates.reddit_username = body.reddit_username;
    if (body.kill_switch_active !== undefined) updates.kill_switch_active = !!body.kill_switch_active;
    if (body.is_paused !== undefined) updates.is_paused = !!body.is_paused;

    const updated = await updateRedditSettings(updates);
    await logAgentActivity("System", "Updated Reddit Growth Agent configuration", "info");

    return NextResponse.json({
      success: true,
      settings: {
        ...updated,
        groq_api_key: updated.groq_api_key ? "••••••••" + updated.groq_api_key.slice(-4) : "",
        reddit_client_secret: updated.reddit_client_secret ? "••••••••" : "",
      },
    });
  } catch (err: any) {
    console.error("[RedditSettingsAPI] POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to update settings" }, { status: 500 });
  }
}

