import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import { getCampaigns, getCampaignById, createCampaign, updateCampaign } from "@/lib/reddit/db";
import { executeCampaignWorkflow } from "@/lib/reddit/agents/campaign-runner";
import { getDbPool } from "@/lib/db";

export async function GET() {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const campaigns = await getCampaigns();
    return NextResponse.json({ success: true, campaigns });
  } catch (err: any) {
    console.error("[RedditCampaignsAPI] GET Error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "create" || !action) {
      if (!body.name || !body.product_brief) {
        return NextResponse.json(
          { error: "Campaign name and product brief are required." },
          { status: 400 }
        );
      }

      const campaign = await createCampaign({
        name: body.name,
        product_brief: body.product_brief,
        target_country: body.target_country || "India",
        target_category: body.target_category || "Programming & Software",
        website_url: body.website_url || "https://arova.arenova.in",
        core_angle: body.core_angle,
        auto_post: !!body.auto_post,
      });

      // If runImmediately is true, trigger workflow
      let runResult = null;
      if (body.run_immediately) {
        runResult = await executeCampaignWorkflow({
          campaignId: campaign.id,
          name: campaign.name,
          productBrief: campaign.product_brief,
          targetCountry: campaign.target_country,
          targetCategory: campaign.target_category,
          websiteUrl: campaign.website_url,
          autoPost: campaign.auto_post,
        });
      }

      return NextResponse.json({ success: true, campaign, runResult });
    }

    if (action === "run") {
      const { campaignId } = body;
      if (!campaignId) {
        return NextResponse.json({ error: "campaignId is required." }, { status: 400 });
      }

      const campaign = await getCampaignById(campaignId);
      if (!campaign) {
        return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
      }

      const result = await executeCampaignWorkflow({
        campaignId: campaign.id,
        name: campaign.name,
        productBrief: campaign.product_brief,
        targetCountry: campaign.target_country,
        targetCategory: campaign.target_category,
        websiteUrl: campaign.website_url,
        autoPost: campaign.auto_post,
      });

      return NextResponse.json({ success: true, result });
    }

    if (action === "delete") {
      const { campaignId } = body;
      if (!campaignId) {
        return NextResponse.json({ error: "campaignId is required." }, { status: 400 });
      }

      const pool = getDbPool();
      await pool.query(`DELETE FROM reddit_campaigns WHERE id = $1`, [campaignId]);
      return NextResponse.json({ success: true, message: "Campaign deleted." });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("[RedditCampaignsAPI] POST Error:", err);
    return NextResponse.json({ error: err.message || "Failed to process campaign" }, { status: 500 });
  }
}
