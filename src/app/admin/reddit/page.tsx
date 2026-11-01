"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Globe,
  Target,
  FileText,
  CheckSquare,
  Calendar,
  BarChart3,
  Bot,
  Play,
  Pause,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { RedditOverviewMetrics, RedditScanJob } from "@/lib/reddit/types";

export default function RedditOverviewPage() {
  const [metrics, setMetrics] = useState<RedditOverviewMetrics | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [recentJobs, setRecentJobs] = useState<RedditScanJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "warn" | "error"; message: string } | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reddit/overview");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setSettings(data.settings);
        setRecentJobs(data.recentJobs || []);
      }
    } catch (err) {
      console.error("Failed to load Reddit overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleTriggerAction = async (action: string) => {
    setActionLoading(true);
    setFeedback({ type: "warn", message: "Executing research run..." });
    try {
      const res = await fetch("/api/admin/reddit/agents/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.warning) {
          setFeedback({ type: "warn", message: `${data.message} (${data.warning})` });
        } else {
          setFeedback({ type: "success", message: data.message || "Research run completed successfully!" });
        }
        await fetchOverview();
      } else {
        setFeedback({ type: "error", message: data.error || "Action failed." });
      }
    } catch (err: any) {
      console.error("Action error:", err);
      setFeedback({ type: "error", message: err.message || "Network error." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
              Reddit Growth Intelligence
            </h1>
            <Badge variant="outline" className="bg-[rgba(232,75,44,0.15)] text-[#FFAA3D] border-[rgba(232,75,44,0.3)] text-[10px]">
              AI Growth Engine
            </Badge>
          </div>
          <p className="text-xs text-[#A39E93] mt-1">
            Autonomous opportunity discovery, contextual value drafting, and attribution tracking for Arova.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOverview}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleTriggerAction("start_research")}
            isLoading={actionLoading}
            className="text-xs"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            Start Research Run
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]"
              : feedback.type === "warn"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-mono text-xs opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* System Status Banner */}
      <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(232,75,44,0.15)] border border-[rgba(232,75,44,0.3)] flex items-center justify-center text-[#E84B2C]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#F3F0E8]">
                Growth Engine Status:
              </span>
              {settings?.kill_switch_active ? (
                <Badge variant="destructive" className="text-[10px]">KILL SWITCH ACTIVE</Badge>
              ) : settings?.is_paused ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">PAUSED</Badge>
              ) : !settings?.has_groq_key ? (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]">KEY MISSING (FALLBACK ACTIVE)</Badge>
              ) : (
                <Badge variant="outline" className="bg-[#34D399]/10 text-[#34D399] border-[#34D399]/20 text-[10px]">OPERATIONAL (GROQ ACTIVE)</Badge>
              )}
            </div>
            <p className="text-[11px] text-[#A39E93] mt-0.5">
              Publishing Mode: <span className="text-[#F3F0E8] font-medium uppercase">{settings?.publishing_mode || "MANUAL"}</span> • Engine: <span className="text-[#FFAA3D] font-mono">{settings?.ai_model || "openai/gpt-oss-120b"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/reddit/agents">
            <Button variant="secondary" size="sm" className="text-xs">
              <Bot className="w-3.5 h-3.5 mr-1.5" />
              Agent Console
            </Button>
          </Link>
          <Link href="/admin/reddit/settings">
            <Button variant="outline" size="sm" className="text-xs">
              Configure
            </Button>
          </Link>
        </div>
      </Card>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          <div className="flex items-center justify-between text-[#A39E93]">
            <span className="text-[11px] font-medium">Communities</span>
            <Globe className="w-3.5 h-3.5 text-[#FFAA3D]" />
          </div>
          <div className="mt-2 text-xl font-bold font-technical text-[#F3F0E8]">
            {metrics?.communities_discovered ?? 0}
          </div>
          <span className="text-[10px] text-[#34D399] block mt-0.5">
            {metrics?.communities_eligible ?? 0} eligible for outreach
          </span>
        </Card>

        <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          <div className="flex items-center justify-between text-[#A39E93]">
            <span className="text-[11px] font-medium">Opportunities</span>
            <Target className="w-3.5 h-3.5 text-[#E84B2C]" />
          </div>
          <div className="mt-2 text-xl font-bold font-technical text-[#F3F0E8]">
            {metrics?.opportunities_discovered ?? 0}
          </div>
          <span className="text-[10px] text-[#FFAA3D] block mt-0.5">
            {metrics?.high_intent_opportunities ?? 0} high-intent targets
          </span>
        </Card>

        <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          <div className="flex items-center justify-between text-[#A39E93]">
            <span className="text-[11px] font-medium">Content Drafts</span>
            <FileText className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-technical text-[#F3F0E8]">
            {metrics?.drafts_generated ?? 0}
          </div>
          <span className="text-[10px] text-[#A39E93] block mt-0.5">
            {metrics?.pending_approvals ?? 0} awaiting approval
          </span>
        </Card>

        <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          <div className="flex items-center justify-between text-[#A39E93]">
            <span className="text-[11px] font-medium">Published Posts</span>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-technical text-[#F3F0E8]">
            {metrics?.published_posts ?? 0}
          </div>
          <span className="text-[10px] text-[#A39E93] block mt-0.5">
            {metrics?.scheduled_content ?? 0} currently scheduled
          </span>
        </Card>

        <Card className="p-4 bg-[#111110] border-[rgba(232,75,44,0.3)] bg-[rgba(232,75,44,0.04)] col-span-2 md:col-span-4 lg:col-span-1">
          <div className="flex items-center justify-between text-[#A39E93]">
            <span className="text-[11px] font-medium text-[#FFAA3D]">Attributed Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#34D399]" />
          </div>
          <div className="mt-2 text-xl font-bold font-technical text-[#34D399]">
            ₹{(metrics?.revenue_attributed ?? 0).toLocaleString("en-IN")}
          </div>
          <span className="text-[10px] text-[#A39E93] block mt-0.5">
            {metrics?.paid_subscriptions ?? 0} conversions (₹499 / ₹999)
          </span>
        </Card>
      </div>

      {/* Engagement & Funnel Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.06)]">
          <span className="text-[11px] text-[#A39E93] block">Website Clicks</span>
          <span className="text-lg font-bold font-technical text-[#F3F0E8] mt-1 block">
            {metrics?.website_clicks ?? 0}
          </span>
          <span className="text-[10px] text-[#A39E93]">Tracked via UTM source</span>
        </Card>

        <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.06)]">
          <span className="text-[11px] text-[#A39E93] block">New Registrations</span>
          <span className="text-lg font-bold font-technical text-[#F3F0E8] mt-1 block">
            {metrics?.registrations ?? 0}
          </span>
          <span className="text-[10px] text-[#A39E93]">Arova accounts created</span>
        </Card>

        <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.06)]">
          <span className="text-[11px] text-[#A39E93] block">Total Upvotes</span>
          <span className="text-lg font-bold font-technical text-[#F3F0E8] mt-1 block">
            {metrics?.total_upvotes ?? 0}
          </span>
          <span className="text-[10px] text-[#A39E93]">On published content</span>
        </Card>

        <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.06)]">
          <span className="text-[11px] text-[#A39E93] block">Discussion Comments</span>
          <span className="text-lg font-bold font-technical text-[#F3F0E8] mt-1 block">
            {metrics?.total_comments ?? 0}
          </span>
          <span className="text-[10px] text-[#A39E93]">Community replies generated</span>
        </Card>
      </div>

      {/* Action Quick Links & Background Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launchpad */}
        <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
          <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FFAA3D]" />
            Growth Modules
          </h3>

          <div className="space-y-2">
            <Link
              href="/admin/reddit/opportunities"
              className="flex items-center justify-between p-3 rounded-lg bg-[#161514] border border-[rgba(243,240,232,0.06)] hover:border-[rgba(232,75,44,0.3)] transition-colors group"
            >
              <div>
                <span className="text-xs font-medium text-[#F3F0E8] group-hover:text-[#FFAA3D] block">
                  Review Opportunities
                </span>
                <span className="text-[10px] text-[#A39E93]">
                  Score and prioritize prospective buyers
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#A39E93] group-hover:text-[#FFAA3D]" />
            </Link>

            <Link
              href="/admin/reddit/approvals"
              className="flex items-center justify-between p-3 rounded-lg bg-[#161514] border border-[rgba(243,240,232,0.06)] hover:border-[rgba(232,75,44,0.3)] transition-colors group"
            >
              <div>
                <span className="text-xs font-medium text-[#F3F0E8] group-hover:text-[#FFAA3D] block">
                  Pending Approvals ({metrics?.pending_approvals ?? 0})
                </span>
                <span className="text-[10px] text-[#A39E93]">
                  Verify rule compliance before scheduling
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#A39E93] group-hover:text-[#FFAA3D]" />
            </Link>

            <Link
              href="/admin/reddit/calendar"
              className="flex items-center justify-between p-3 rounded-lg bg-[#161514] border border-[rgba(243,240,232,0.06)] hover:border-[rgba(232,75,44,0.3)] transition-colors group"
            >
              <div>
                <span className="text-xs font-medium text-[#F3F0E8] group-hover:text-[#FFAA3D] block">
                  Publishing Schedule
                </span>
                <span className="text-[10px] text-[#A39E93]">
                  Manage delivery cadence and post timings
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#A39E93] group-hover:text-[#FFAA3D]" />
            </Link>

            <Link
              href="/admin/reddit/analytics"
              className="flex items-center justify-between p-3 rounded-lg bg-[#161514] border border-[rgba(243,240,232,0.06)] hover:border-[rgba(232,75,44,0.3)] transition-colors group"
            >
              <div>
                <span className="text-xs font-medium text-[#F3F0E8] group-hover:text-[#FFAA3D] block">
                  Attribution &amp; Revenue
                </span>
                <span className="text-[10px] text-[#A39E93]">
                  UTM campaign conversions and ₹499/₹999 sales
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#A39E93] group-hover:text-[#FFAA3D]" />
            </Link>
          </div>
        </Card>

        {/* Background Jobs Feed */}
        <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#E84B2C]" />
              Recent Agent Job Executions
            </h3>
            <Link href="/admin/reddit/agents" className="text-xs text-[#FFAA3D] hover:underline">
              View Live Activity Feed →
            </Link>
          </div>

          <div className="space-y-2">
            {recentJobs.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#A39E93] bg-[#161514] rounded-lg">
                No recent jobs recorded. Click &quot;Start Research Run&quot; to begin.
              </div>
            ) : (
              recentJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#161514] border border-[rgba(243,240,232,0.05)] text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#F3F0E8] font-mono">
                        {job.job_type.replace(/_/g, " ").toUpperCase()}
                      </span>
                      <Badge
                        variant={job.status === "completed" ? "outline" : job.status === "failed" ? "destructive" : "secondary"}
                        className="text-[9px] py-0 px-1.5"
                      >
                        {job.status}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-[#A39E93]">
                      Target: {job.target_community || "Global Categories"} • Yield: {job.results_count} results
                    </span>
                  </div>

                  <span className="text-[10px] text-[#9E9B93] font-mono">
                    {new Date(job.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

