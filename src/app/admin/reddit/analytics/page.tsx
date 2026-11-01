"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import {
  BarChart3,
  TrendingUp,
  Link as LinkIcon,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  DollarSign,
  Users,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";

export default function RedditAnalyticsPage() {
  const [attribution, setAttribution] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Link Builder State
  const [targetCategory, setTargetCategory] = useState("Website & E-commerce");
  const [campaignName, setCampaignName] = useState("freelance_migration_audit");
  const [medium, setMedium] = useState("organic");
  const [contentRef, setContentRef] = useState("comment_01");
  const [copied, setCopied] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reddit/analytics");
      if (res.ok) {
        const data = await res.json();
        setAttribution(data.attribution || []);
      }
    } catch (err) {
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const generatedUrl = `https://arova.arenova.in/?utm_source=reddit&utm_medium=${encodeURIComponent(
    medium
  )}&utm_campaign=${encodeURIComponent(campaignName)}&utm_content=${encodeURIComponent(contentRef)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalClicks = attribution.reduce((acc, row) => acc + parseInt(row.total_clicks || "0", 10), 0);
  const totalSignups = attribution.reduce((acc, row) => acc + parseInt(row.total_signups || "0", 10), 0);
  const totalPaidSubs = attribution.reduce(
    (acc, row) => acc + parseInt(row.starter_subs || "0", 10) + parseInt(row.pro_subs || "0", 10),
    0
  );
  const totalRevenue = attribution.reduce((acc, row) => acc + parseFloat(row.total_revenue || "0"), 0);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
            Reddit Attribution &amp; Revenue Metrics
          </h1>
          <p className="text-xs text-[#A39E93] mt-1">
            Tracking website traffic, user signups, and subscription conversions (₹499 / ₹999) attributable to Reddit outreach.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          <div className="flex items-center justify-between text-[#A39E93]">
            <span className="text-xs font-medium">Attributed Clicks</span>
            <MousePointerClick className="w-4 h-4 text-[#FFAA3D]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-technical text-[#F3F0E8]">
            {totalClicks}
          </div>
          <span className="text-[10px] text-[#A39E93]">From organic links &amp; mentions</span>
        </Card>

        <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          <div className="flex items-center justify-between text-[#A39E93]">
            <span className="text-xs font-medium">New Registrations</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-technical text-[#F3F0E8]">
            {totalSignups}
          </div>
          <span className="text-[10px] text-[#A39E93]">
            {totalClicks > 0 ? `${((totalSignups / totalClicks) * 100).toFixed(1)}%` : "0%"} signup conversion
          </span>
        </Card>

        <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          <div className="flex items-center justify-between text-[#A39E93]">
            <span className="text-xs font-medium">Paid Subscriptions</span>
            <Sparkles className="w-4 h-4 text-[#E84B2C]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-technical text-[#F3F0E8]">
            {totalPaidSubs}
          </div>
          <span className="text-[10px] text-[#A39E93]">Starter &amp; Pro members</span>
        </Card>

        <Card className="p-5 bg-[#111110] border-[rgba(232,75,44,0.3)] bg-[rgba(232,75,44,0.04)]">
          <div className="flex items-center justify-between text-[#A39E93]">
            <span className="text-xs font-medium text-[#FFAA3D]">Attributed Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#34D399]" />
          </div>
          <div className="mt-2 text-2xl font-bold font-technical text-[#34D399]">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#A39E93]">Calculated from real DB records</span>
        </Card>
      </div>

      {/* Attribution By Campaign Table */}
      <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
        <div className="p-4 border-b border-[rgba(243,240,232,0.06)] flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-[#F3F0E8]">
            Attribution Breakdown by Campaign Slug
          </h3>
          <span className="text-xs text-[#A39E93] font-mono">
            {attribution.length} campaigns tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#A39E93] uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Clicks</th>
                <th className="py-3 px-4">Signups</th>
                <th className="py-3 px-4">Starter (₹499)</th>
                <th className="py-3 px-4">Pro (₹999)</th>
                <th className="py-3 px-4 text-right">Revenue (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.05)] text-[#D0CBC1]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#A39E93]">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#E84B2C]" />
                    Loading campaign attribution...
                  </td>
                </tr>
              ) : attribution.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#A39E93]">
                    No attribution data recorded yet. Published Reddit links with UTM tags will populate automatically.
                  </td>
                </tr>
              ) : (
                attribution.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#161514]/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-[#F3F0E8]">
                      {row.utm_campaign}
                    </td>
                    <td className="py-3 px-4 font-technical">{row.total_clicks}</td>
                    <td className="py-3 px-4 font-technical">{row.total_signups}</td>
                    <td className="py-3 px-4 font-technical text-amber-400">{row.starter_subs}</td>
                    <td className="py-3 px-4 font-technical text-[#FFAA3D]">{row.pro_subs}</td>
                    <td className="py-3 px-4 text-right font-technical font-bold text-[#34D399]">
                      ₹{parseFloat(row.total_revenue || "0").toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* UTM Link Generator */}
      <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
        <div>
          <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-[#E84B2C]" />
            Reddit UTM Tracking Link Generator
          </h3>
          <p className="text-xs text-[#A39E93] mt-0.5">
            Generate compliant tracking URLs with automated Arova attribution parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#D0CBC1]">Commercial Domain</label>
            <Select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="text-xs"
            >
              {APPROVED_CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#D0CBC1]">Campaign Identifier</label>
            <Input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#D0CBC1]">Medium</label>
            <Input
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-[#D0CBC1]">Content Identifier</label>
            <Input
              type="text"
              value={contentRef}
              onChange={(e) => setContentRef(e.target.value)}
              className="text-xs font-mono"
            />
          </div>
        </div>

        <div className="p-3 rounded-lg bg-[#161514] border border-[rgba(243,240,232,0.06)] flex items-center justify-between gap-4">
          <span className="text-xs font-mono text-[#FFAA3D] truncate">{generatedUrl}</span>
          <Button variant="secondary" size="sm" onClick={handleCopyLink} className="shrink-0 text-xs">
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-[#34D399]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy Link
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}

