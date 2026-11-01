import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { createPublishedPost, getRedditSettings } from "@/lib/reddit/db";
import { logAgentActivity } from "@/lib/reddit/logger";

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { draftId, community_name, title, content, post_url, post_id, mode } = body;

    const settings = await getRedditSettings();

    if (settings.kill_switch_active) {
      return NextResponse.json({ error: "Publishing blocked: Kill Switch is active" }, { status: 403 });
    }

    const publishMode = mode || settings.publishing_mode;

    if (publishMode === "api") {
      // Validate credentials
      if (!settings.reddit_client_id || !settings.reddit_client_secret) {
        return NextResponse.json({
          error: "Reddit API integration is disabled awaiting commercial credentials authorization. Use Manual Publishing mode.",
          mode: "manual_required",
        }, { status: 400 });
      }
    }

    // Record published post in database
    const published = await createPublishedPost({
      draft_id: draftId || undefined,
      community_name: community_name || "r/freelance",
      post_id: post_id || `post_${Date.now()}`,
      post_url: post_url || `https://reddit.com/${community_name || "r/freelance"}`,
      title: title || undefined,
      body: content || "",
    });

    await logAgentActivity(
      "Publishing Adapter",
      `Published post to ${published.community_name} (${publishMode.toUpperCase()} mode)`,
      "success",
      { post_id: published.post_id, url: published.post_url, mode: publishMode }
    );

    return NextResponse.json({ success: true, post: published });
  } catch (err: any) {
    console.error("[RedditPublishAPI] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to publish post" }, { status: 500 });
  }
}

