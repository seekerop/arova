import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/security/roles";
import {
  getAnalyticsOverview,
  getTimeSeriesMetrics,
  getRealtimeAnalytics,
  getTrafficSources,
  getTopPages,
  getGeographicMetrics,
  getDeviceMetrics,
  getCampaignMetrics,
  getLandingAndExitPages,
} from "@/lib/analytics/service";
import { AnalyticsDatePreset } from "@/lib/analytics/types";

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAdminSession();
    if (!session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized administrative access" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const section = searchParams.get("section") || "all";
    const preset = (searchParams.get("preset") || "7d") as AnalyticsDatePreset;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const sortBy = (searchParams.get("sortBy") as "views" | "visitors") || "views";
    const campaignSource = searchParams.get("campaignSource") || undefined;
    const campaignMedium = searchParams.get("campaignMedium") || undefined;

    if (section === "realtime") {
      const realtime = await getRealtimeAnalytics();
      return NextResponse.json({ success: true, realtime });
    }

    if (section === "overview") {
      const [overview, timeSeries] = await Promise.all([
        getAnalyticsOverview(preset, startDate, endDate),
        getTimeSeriesMetrics(preset, startDate, endDate),
      ]);
      return NextResponse.json({ success: true, overview, timeSeries });
    }

    if (section === "sources") {
      const sources = await getTrafficSources(preset, startDate, endDate);
      return NextResponse.json({ success: true, sources });
    }

    if (section === "pages") {
      const [topPages, landingExit] = await Promise.all([
        getTopPages(preset, startDate, endDate, sortBy),
        getLandingAndExitPages(preset, startDate, endDate),
      ]);
      return NextResponse.json({ success: true, topPages, landingExit });
    }

    if (section === "geo") {
      const geo = await getGeographicMetrics(preset, startDate, endDate);
      return NextResponse.json({ success: true, geo });
    }

    if (section === "devices") {
      const devices = await getDeviceMetrics(preset, startDate, endDate);
      return NextResponse.json({ success: true, devices });
    }

    if (section === "campaigns") {
      const campaigns = await getCampaignMetrics(preset, startDate, endDate, campaignSource, campaignMedium);
      return NextResponse.json({ success: true, campaigns });
    }

    // Default: "all"
    const [
      overview,
      timeSeries,
      realtime,
      sources,
      topPages,
      landingExit,
      geo,
      devices,
      campaigns,
    ] = await Promise.all([
      getAnalyticsOverview(preset, startDate, endDate),
      getTimeSeriesMetrics(preset, startDate, endDate),
      getRealtimeAnalytics(),
      getTrafficSources(preset, startDate, endDate),
      getTopPages(preset, startDate, endDate, sortBy),
      getLandingAndExitPages(preset, startDate, endDate),
      getGeographicMetrics(preset, startDate, endDate),
      getDeviceMetrics(preset, startDate, endDate),
      getCampaignMetrics(preset, startDate, endDate, campaignSource, campaignMedium),
    ]);

    return NextResponse.json({
      success: true,
      preset,
      overview,
      timeSeries,
      realtime,
      sources,
      topPages,
      landingExit,
      geo,
      devices,
      campaigns,
    });
  } catch (err: any) {
    console.error("Admin analytics error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve analytics metrics" },
      { status: 500 }
    );
  }
}
