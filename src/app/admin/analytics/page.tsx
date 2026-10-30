"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { TrafficChart } from "@/components/analytics/traffic-chart";
import {
  AnalyticsDatePreset,
  AnalyticsOverviewKPIs,
  TimeSeriesDataPoint,
  RealtimeAnalytics,
  TrafficSourceBreakdown,
  PageAnalyticsRow,
  GeographicBreakdown,
  DeviceBreakdown,
  CampaignPerformanceRow,
  LandingExitPages,
} from "@/lib/analytics/types";
import {
  Users,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  RefreshCw,
  Radio,
  Globe2,
  Monitor,
  Smartphone,
  Tablet,
  Compass,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const [preset, setPreset] = useState<AnalyticsDatePreset>("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [pageSortBy, setPageSortBy] = useState<"views" | "visitors">("views");
  const [campaignSourceFilter, setCampaignSourceFilter] = useState("all");
  const [campaignMediumFilter, setCampaignMediumFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [realtimeLoading, setRealtimeLoading] = useState(false);
  const [autoRefreshRealtime, setAutoRefreshRealtime] = useState(true);

  // Analytics states
  const [overview, setOverview] = useState<AnalyticsOverviewKPIs | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesDataPoint[]>([]);
  const [realtime, setRealtime] = useState<RealtimeAnalytics | null>(null);
  const [sources, setSources] = useState<TrafficSourceBreakdown[]>([]);
  const [topPages, setTopPages] = useState<PageAnalyticsRow[]>([]);
  const [landingExit, setLandingExit] = useState<LandingExitPages | null>(null);
  const [geo, setGeo] = useState<GeographicBreakdown | null>(null);
  const [devices, setDevices] = useState<DeviceBreakdown | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignPerformanceRow[]>([]);

  // Fetch full analytics dataset
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("preset", preset);
      if (preset === "custom" && customStart && customEnd) {
        params.set("startDate", customStart);
        params.set("endDate", customEnd);
      }
      params.set("sortBy", pageSortBy);
      if (campaignSourceFilter !== "all") params.set("campaignSource", campaignSourceFilter);
      if (campaignMediumFilter !== "all") params.set("campaignMedium", campaignMediumFilter);

      const res = await fetch(`/api/admin/analytics?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOverview(data.overview || null);
        setTimeSeries(data.timeSeries || []);
        setRealtime(data.realtime || null);
        setSources(data.sources || []);
        setTopPages(data.topPages || []);
        setLandingExit(data.landingExit || null);
        setGeo(data.geo || null);
        setDevices(data.devices || null);
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  }, [preset, customStart, customEnd, pageSortBy, campaignSourceFilter, campaignMediumFilter]);

  // Fetch real-time heartbeat separately
  const fetchRealtime = useCallback(async () => {
    try {
      setRealtimeLoading(true);
      const res = await fetch("/api/admin/analytics?section=realtime");
      if (res.ok) {
        const data = await res.json();
        setRealtime(data.realtime);
      }
    } catch (err) {
      console.error("Realtime fetch failed:", err);
    } finally {
      setRealtimeLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Real-time auto-refresh interval (15s)
  useEffect(() => {
    if (!autoRefreshRealtime) return;
    const interval = setInterval(() => {
      fetchRealtime();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefreshRealtime, fetchRealtime]);

  const formatSeconds = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const renderTrendBadge = (
    pct: number | null,
    isInverse = false,
    hasComparison = true
  ) => {
    if (!hasComparison || pct === null) {
      return (
        <span className="text-[10px] text-[#A39E93] font-technical">
          Baseline period
        </span>
      );
    }

    const isPositive = pct > 0;
    // For bounce rate, a decrease is positive
    const isGood = isInverse ? !isPositive : isPositive;

    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[11px] font-technical font-medium ${
          pct === 0
            ? "text-[#A39E93]"
            : isGood
            ? "text-[#34D399]"
            : "text-[#E84B2C]"
        }`}
      >
        {isPositive ? (
          <ArrowUpRight className="w-3 h-3" />
        ) : (
          <ArrowDownRight className="w-3 h-3" />
        )}
        <span>{Math.abs(pct)}%</span>
      </span>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Website Traffic Analytics"
        subtitle="Real-time traffic telemetry, visitor acquisition channels, and conversion intelligence"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Telemetry
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Control Bar: Temporal Date Range Presets */}
        <div className="p-4 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7d", label: "Last 7 Days" },
              { id: "30d", label: "Last 30 Days" },
              { id: "90d", label: "Last 90 Days" },
              { id: "this_month", label: "This Month" },
              { id: "last_month", label: "Last Month" },
              { id: "custom", label: "Custom Range" },
            ].map((p) => {
              const active = preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.id as AnalyticsDatePreset)}
                  className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-all ${
                    active
                      ? "bg-[#161514] text-[#FFAA3D] border border-[rgba(232,75,44,0.4)] shadow-[0_0_12px_rgba(232,75,44,0.1)]"
                      : "text-[#D0CBC1] hover:text-[#F3F0E8] hover:bg-[#161514]/60"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Real-time Indicator & Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAutoRefreshRealtime(!autoRefreshRealtime)}
              className="flex items-center gap-2 text-xs text-[#A39E93] hover:text-[#F3F0E8] transition-colors"
            >
              <span className="relative flex h-2.5 w-2.5">
                {autoRefreshRealtime && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    autoRefreshRealtime ? "bg-[#34D399]" : "bg-[#A39E93]"
                  }`}
                />
              </span>
              <span>{autoRefreshRealtime ? "Live Sync (15s)" : "Paused"}</span>
            </button>
          </div>
        </div>

        {/* Custom Range Picker Drawer */}
        {preset === "custom" && (
          <div className="p-4 rounded-[10px] bg-[#161514] border border-[rgba(232,75,44,0.25)] flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#A39E93]">Start Date:</span>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-40 text-xs font-technical"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#A39E93]">End Date:</span>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-40 text-xs font-technical"
              />
            </div>
            <Button variant="primary" size="sm" onClick={fetchAnalytics}>
              Apply Custom Range
            </Button>
          </div>
        )}

        {/* A. Overview KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-1">
            <span className="text-xs text-[#A39E93]">Total Visitors</span>
            <div className="text-2xl font-bold font-technical text-[#F3F0E8]">
              {overview?.totalVisitors.current.toLocaleString() ?? 0}
            </div>
            <div className="pt-1 flex items-center justify-between">
              {renderTrendBadge(
                overview?.totalVisitors.percentageChange ?? null,
                false,
                overview?.hasHistoricalComparison ?? false
              )}
              <Users className="w-3.5 h-3.5 text-[#FFAA3D] opacity-60" />
            </div>
          </Card>

          <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-1">
            <span className="text-xs text-[#A39E93]">Unique Visitors</span>
            <div className="text-2xl font-bold font-technical text-[#34D399]">
              {overview?.uniqueVisitors.current.toLocaleString() ?? 0}
            </div>
            <div className="pt-1 flex items-center justify-between">
              {renderTrendBadge(
                overview?.uniqueVisitors.percentageChange ?? null,
                false,
                overview?.hasHistoricalComparison ?? false
              )}
              <Users className="w-3.5 h-3.5 text-[#34D399] opacity-60" />
            </div>
          </Card>

          <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-1">
            <span className="text-xs text-[#A39E93]">Total Page Views</span>
            <div className="text-2xl font-bold font-technical text-[#E84B2C]">
              {overview?.totalPageViews.current.toLocaleString() ?? 0}
            </div>
            <div className="pt-1 flex items-center justify-between">
              {renderTrendBadge(
                overview?.totalPageViews.percentageChange ?? null,
                false,
                overview?.hasHistoricalComparison ?? false
              )}
              <Eye className="w-3.5 h-3.5 text-[#E84B2C] opacity-60" />
            </div>
          </Card>

          <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-1">
            <span className="text-xs text-[#A39E93]">Total Sessions</span>
            <div className="text-2xl font-bold font-technical text-[#FFAA3D]">
              {overview?.totalSessions.current.toLocaleString() ?? 0}
            </div>
            <div className="pt-1 flex items-center justify-between">
              {renderTrendBadge(
                overview?.totalSessions.percentageChange ?? null,
                false,
                overview?.hasHistoricalComparison ?? false
              )}
              <Layers className="w-3.5 h-3.5 text-[#FFAA3D] opacity-60" />
            </div>
          </Card>

          <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-1">
            <span className="text-xs text-[#A39E93]">Avg Duration</span>
            <div className="text-2xl font-bold font-technical text-[#F3F0E8]">
              {formatSeconds(overview?.avgSessionDurationSeconds.current ?? 0)}
            </div>
            <div className="pt-1 flex items-center justify-between">
              {renderTrendBadge(
                overview?.avgSessionDurationSeconds.percentageChange ?? null,
                false,
                overview?.hasHistoricalComparison ?? false
              )}
              <Clock className="w-3.5 h-3.5 text-[#A39E93] opacity-60" />
            </div>
          </Card>

          <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-1">
            <span className="text-xs text-[#A39E93]">Bounce Rate</span>
            <div className="text-2xl font-bold font-technical text-[#F3F0E8]">
              {(overview?.bounceRate.current ?? 0).toFixed(1)}%
            </div>
            <div className="pt-1 flex items-center justify-between">
              {renderTrendBadge(
                overview?.bounceRate.percentageChange ?? null,
                true,
                overview?.hasHistoricalComparison ?? false
              )}
              <Compass className="w-3.5 h-3.5 text-[#A39E93] opacity-60" />
            </div>
          </Card>
        </div>

        {/* B. Traffic Overview Interactive Time-Series Chart */}
        <TrafficChart data={timeSeries} loading={loading} />

        {/* C. Real-Time Analytics Monitor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#34D399]" />
              </span>
              <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
                Real-Time Visitor Monitor
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRealtime}
              disabled={realtimeLoading}
              className="text-xs"
            >
              <RefreshCw
                className={`w-3 h-3 mr-1.5 ${realtimeLoading ? "animate-spin" : ""}`}
              />
              Pulse Update
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Real-time Big Number Card */}
            <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs text-[#A39E93] uppercase font-technical font-semibold">
                  Active On Site Right Now
                </span>
                <div className="mt-2 flex items-baseline gap-3">
                  <span className="font-technical text-5xl font-bold text-[#34D399]">
                    {realtime?.activeVisitorsRightNow ?? 0}
                  </span>
                  <span className="text-xs text-[#A39E93]">
                    in last 5 minutes
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] text-xs text-[#D0CBC1] space-y-1">
                <div className="flex justify-between">
                  <span>Past 30 mins active:</span>
                  <span className="font-technical font-bold text-[#FFAA3D]">
                    {realtime?.visitorsLast30Minutes ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Distinct pages viewed:</span>
                  <span className="font-technical font-bold text-[#F3F0E8]">
                    {realtime?.pagesActiveCount ?? 0}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#FFAA3D] uppercase font-technical">
                  Active Pages Breakdown
                </span>
                {(!realtime?.topActivePages || realtime.topActivePages.length === 0) ? (
                  <p className="text-xs text-[#A39E93]">
                    No concurrent visitors browsing pages.
                  </p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {realtime.topActivePages.map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-[6px] bg-[#161514]"
                      >
                        <span className="text-[#F3F0E8] font-technical truncate max-w-[180px]">
                          {p.pagePath}
                        </span>
                        <Badge variant="success" size="sm">
                          {p.activeVisitors} online
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Live Stream of Recent Events */}
            <Card className="lg:col-span-2 p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(243,240,232,0.06)]">
                  <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
                    Live Telemetry Stream
                  </h4>
                  <span className="text-[11px] text-[#A39E93] font-technical">
                    Latest pageviews & interactions
                  </span>
                </div>

                {(!realtime?.recentEvents || realtime.recentEvents.length === 0) ? (
                  <div className="p-8 text-center text-xs text-[#A39E93]">
                    Waiting for inbound visitor events...
                  </div>
                ) : (
                  <div className="divide-y divide-[rgba(243,240,232,0.04)] max-h-72 overflow-y-auto text-xs">
                    {realtime.recentEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="py-2.5 flex items-center justify-between gap-3 hover:bg-[#161514]/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              evt.eventName === "page_view"
                                ? "bg-[#34D399]"
                                : evt.eventName === "cta_click"
                                ? "bg-[#E84B2C]"
                                : "bg-[#FFAA3D]"
                            }`}
                          />
                          <span className="font-technical text-[#F3F0E8] truncate">
                            {evt.pagePath}
                          </span>
                          <span className="text-[10px] text-[#A39E93] hidden sm:inline">
                            ({evt.eventName})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {evt.deviceType && (
                            <Badge variant="outline" size="sm" className="capitalize">
                              {evt.deviceType}
                            </Badge>
                          )}
                          {evt.city && (
                            <span className="text-[11px] text-[#D0CBC1]">
                              {evt.city}
                            </span>
                          )}
                          <span className="text-[10px] text-[#A39E93] font-technical">
                            {new Date(evt.timestamp).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* D. Traffic Sources & Acquisition Channels */}
        <div className="space-y-4">
          <div>
            <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
              Acquisition Channels & Traffic Sources
            </h3>
            <p className="text-xs text-[#A39E93]">
              Categorized origin of inbound visits and UTM attribution
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
              <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
                Channel Breakdown
              </h4>

              {sources.length === 0 ? (
                <p className="text-xs text-[#A39E93] text-center py-8">
                  No traffic sources recorded in this period.
                </p>
              ) : (
                <div className="space-y-3.5">
                  {sources.map((s) => (
                    <div key={s.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#F3F0E8]">
                          {s.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-technical text-[#FFAA3D]">
                            {s.sessions} sessions
                          </span>
                          <span className="text-[11px] text-[#A39E93]">
                            ({s.percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-[#161514] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#E84B2C] to-[#FFAA3D] rounded-full"
                          style={{ width: `${Math.min(100, s.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Campaign UTM Performance */}
            <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
                  UTM Campaign Performance
                </h4>
                <div className="flex items-center gap-2 text-xs">
                  <Select
                    value={campaignSourceFilter}
                    onChange={(e) => setCampaignSourceFilter(e.target.value)}
                    className="h-7 text-xs py-0 w-28"
                  >
                    <option value="all">All Sources</option>
                    <option value="google">Google</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">X/Twitter</option>
                    <option value="newsletter">Newsletter</option>
                  </Select>
                </div>
              </div>

              {campaigns.length === 0 ? (
                <p className="text-xs text-[#A39E93] text-center py-8">
                  No active UTM campaigns recorded in this period.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.06)]">
                      <tr>
                        <th className="p-2 font-medium">Campaign</th>
                        <th className="p-2 font-medium">Source / Medium</th>
                        <th className="p-2 font-medium text-right">Sessions</th>
                        <th className="p-2 font-medium text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[rgba(243,240,232,0.04)]">
                      {campaigns.map((c, i) => (
                        <tr key={i} className="hover:bg-[#161514]/40">
                          <td className="p-2 font-medium text-[#F3F0E8] truncate max-w-[120px]">
                            {c.campaignName}
                          </td>
                          <td className="p-2 text-[#A39E93] font-technical">
                            {c.source} / {c.medium}
                          </td>
                          <td className="p-2 text-right font-technical font-semibold text-[#34D399]">
                            {c.sessions}
                          </td>
                          <td className="p-2 text-right font-technical text-[#F3F0E8]">
                            {c.pageViews}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* E. Top Viewed Pages & Content Engagement */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
                Top Visited Content & Engagement
              </h3>
              <p className="text-xs text-[#A39E93]">
                Telemetry by route path, unique readers, and bounce percentages
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageSortBy("views")}
                className={`px-3 py-1 rounded-[6px] text-xs font-medium ${
                  pageSortBy === "views"
                    ? "bg-[#161514] text-[#FFAA3D] border border-[rgba(232,75,44,0.4)]"
                    : "text-[#A39E93] hover:text-[#F3F0E8]"
                }`}
              >
                Sort by Views
              </button>
              <button
                type="button"
                onClick={() => setPageSortBy("visitors")}
                className={`px-3 py-1 rounded-[6px] text-xs font-medium ${
                  pageSortBy === "visitors"
                    ? "bg-[#161514] text-[#34D399] border border-[rgba(52,211,153,0.4)]"
                    : "text-[#A39E93] hover:text-[#F3F0E8]"
                }`}
              >
                Sort by Visitors
              </button>
            </div>
          </div>

          <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
            {topPages.length === 0 ? (
              <p className="text-xs text-[#A39E93] text-center p-8">
                No page views recorded in this period.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                    <tr>
                      <th className="p-4 font-medium">Page Title / URL Path</th>
                      <th className="p-4 font-medium text-right">Page Views</th>
                      <th className="p-4 font-medium text-right">Unique Visitors</th>
                      <th className="p-4 font-medium text-right">Avg Duration</th>
                      <th className="p-4 font-medium text-right">Bounce Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                    {topPages.map((page) => (
                      <tr
                        key={page.pagePath}
                        className="hover:bg-[#161514]/40 transition-colors"
                      >
                        <td className="p-4">
                          <span className="font-semibold text-[#F3F0E8] block">
                            {page.pageTitle}
                          </span>
                          <span className="font-technical text-[11px] text-[#A39E93]">
                            {page.pagePath}
                          </span>
                        </td>
                        <td className="p-4 text-right font-technical font-bold text-[#E84B2C]">
                          {page.pageViews.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-technical text-[#34D399]">
                          {page.uniqueVisitors.toLocaleString()}
                        </td>
                        <td className="p-4 text-right font-technical text-[#D0CBC1]">
                          {formatSeconds(page.avgEngagementTimeSeconds)}
                        </td>
                        <td className="p-4 text-right font-technical text-[#FFAA3D]">
                          {page.bounceRate.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* F & G. Geographic & Technology Infrastructure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Geographic Breakdown */}
          <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#FFAA3D]" />
                <span>Geographic Distribution</span>
              </h4>
              <Badge variant="outline" size="sm">
                IP Transient Derived
              </Badge>
            </div>

            {(!geo?.topCountries || geo.topCountries.length === 0) ? (
              <p className="text-xs text-[#A39E93] text-center py-8">
                No geographic telemetry recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3">
                  <span className="text-[11px] text-[#FFAA3D] font-technical uppercase font-semibold block">
                    Top Countries
                  </span>
                  {geo.topCountries.map((c) => (
                    <div key={c.country} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#F3F0E8] font-medium">
                          {c.country}
                        </span>
                        <span className="font-technical text-[#FFAA3D]">
                          {c.visitors} visitors ({c.percentage}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#161514] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#34D399] rounded-full"
                          style={{ width: `${Math.min(100, c.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {geo.topCities && geo.topCities.length > 0 && (
                  <div className="pt-2 border-t border-[rgba(243,240,232,0.06)] space-y-2">
                    <span className="text-[11px] text-[#A39E93] font-technical uppercase font-semibold block">
                      Top Metropolitan Regions
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-technical">
                      {geo.topCities.map((city, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-[6px] bg-[#161514] flex justify-between"
                        >
                          <span className="text-[#D0CBC1] truncate">
                            {city.city}
                          </span>
                          <span className="text-[#34D399] font-bold">
                            {city.visitors}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Device & Client Technology */}
          <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
            <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
              Device, Browser & Platform
            </h4>

            {/* Device Proportions */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: "desktop", label: "Desktop", icon: Monitor },
                { type: "mobile", label: "Mobile", icon: Smartphone },
                { type: "tablet", label: "Tablet", icon: Tablet },
              ].map((d) => {
                const Icon = d.icon;
                const match = devices?.deviceTypes.find((x) => x.type === d.type);
                const pct = match ? match.percentage : 0;
                const count = match ? match.visitors : 0;

                return (
                  <div
                    key={d.type}
                    className="p-3 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] text-center space-y-1.5"
                  >
                    <Icon className="w-5 h-5 text-[#FFAA3D] mx-auto opacity-70" />
                    <span className="text-xs text-[#F3F0E8] font-medium block">
                      {d.label}
                    </span>
                    <span className="font-technical text-base font-bold text-[#34D399] block">
                      {pct}%
                    </span>
                    <span className="text-[10px] text-[#A39E93] block">
                      {count} visitors
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Top Browsers & Operating Systems */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[rgba(243,240,232,0.06)]">
              <div>
                <span className="text-[11px] text-[#FFAA3D] font-technical uppercase font-semibold block mb-2">
                  Top Browsers
                </span>
                <div className="space-y-1.5 text-xs">
                  {devices?.browsers.slice(0, 5).map((b) => (
                    <div
                      key={b.browser}
                      className="flex justify-between p-1.5 rounded-[4px] bg-[#161514]"
                    >
                      <span className="text-[#D0CBC1]">{b.browser}</span>
                      <span className="font-technical text-[#F3F0E8] font-semibold">
                        {b.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#FFAA3D] font-technical uppercase font-semibold block mb-2">
                  Operating Systems
                </span>
                <div className="space-y-1.5 text-xs">
                  {devices?.operatingSystems.slice(0, 5).map((os) => (
                    <div
                      key={os.os}
                      className="flex justify-between p-1.5 rounded-[4px] bg-[#161514]"
                    >
                      <span className="text-[#D0CBC1]">{os.os}</span>
                      <span className="font-technical text-[#F3F0E8] font-semibold">
                        {os.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* I. Common Landing & Exit Pages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-3">
            <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
              Entry / Landing Pages
            </h4>
            <p className="text-xs text-[#A39E93]">
              First page viewed by visitors starting a session
            </p>

            {(!landingExit?.landingPages || landingExit.landingPages.length === 0) ? (
              <p className="text-xs text-[#A39E93] text-center py-6">
                No entry paths recorded in this period.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {landingExit.landingPages.map((l) => (
                  <div
                    key={l.pagePath}
                    className="p-2.5 rounded-[6px] bg-[#161514] flex items-center justify-between"
                  >
                    <span className="font-technical text-[#F3F0E8] truncate max-w-[200px]">
                      {l.pagePath}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-technical text-[#FFAA3D]">
                        {l.sessions} sessions
                      </span>
                      <Badge variant="outline" size="sm">
                        {l.bounceRate}% bounce
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-3">
            <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
              Common Exit Pages
            </h4>
            <p className="text-xs text-[#A39E93]">
              Last route viewed before session departure
            </p>

            {(!landingExit?.exitPages || landingExit.exitPages.length === 0) ? (
              <p className="text-xs text-[#A39E93] text-center py-6">
                No exit paths recorded in this period.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {landingExit.exitPages.map((e) => (
                  <div
                    key={e.pagePath}
                    className="p-2.5 rounded-[6px] bg-[#161514] flex items-center justify-between"
                  >
                    <span className="font-technical text-[#F3F0E8] truncate max-w-[200px]">
                      {e.pagePath}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-technical text-[#E84B2C]">
                        {e.exits} exits
                      </span>
                      <Badge variant="outline" size="sm">
                        {e.exitRate}% exit rate
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
