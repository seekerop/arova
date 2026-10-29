"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrencyINR } from "@/lib/utils";
import {
  Database,
  Users,
  CreditCard,
  Send,
  ShieldCheck,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Inbox,
  RefreshCw,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [runningJob, setRunningJob] = useState(false);
  const [jobResult, setJobResult] = useState<string | null>(null);

  // Real database-backed summary metrics (initial state 0, loaded from Postgres)
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    availableLeads: 0,
    reservedLeads: 0,
    activeClaims: 0,
    archivedLeads: 0,
    registeredUsers: 0,
    activeSubscribers: 0,
    starterSubscribers: 0,
    growthSubscribers: 0,
    pendingRequests: 0,
    collectionsGrossPaise: 0,
    refundsTotalPaise: 0,
    netCollectionsPaise: 0,
    reportedComplaints: 0,
    categoryBreakdown: [] as { name: string; available: number; total: number }[],
  });

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        if (data.metrics) {
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleTriggerAutomation = async () => {
    setRunningJob(true);
    setJobResult(null);
    try {
      const res = await fetch("/api/admin/cron-trigger", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setJobResult(
          `Automation executed: ${data.result.offersDistributed} offers distributed, ${data.result.offersExpired} expired, ${data.result.claimsExpired} claims closed.`
        );
        loadMetrics();
      } else {
        setJobResult(`Failed: ${data.error}`);
      }
    } catch (err: any) {
      setJobResult(`Error: ${err.message}`);
    } finally {
      setRunningJob(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Administrative Overview"
        subtitle="Platform-wide lead inventory, subscription quotas, and delivery monitoring"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Top Control Bar: Manual Scheduled Automation Trigger */}
        <div className="p-4 rounded-[12px] bg-[#161514] border border-[rgba(232,75,44,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-technical text-xs font-semibold text-[#FFAA3D] uppercase">
              DURABLE AUTOMATION ENGINE
            </span>
            <p className="text-xs text-[#D0CBC1]">
              Triggers 48h offer expiries, 30-day claim expiries, and scheduled paced lead distribution.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMetrics}
              disabled={loading}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTriggerAutomation}
              isLoading={runningJob}
            >
              <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
              Run Distribution Cycle Now
            </Button>
          </div>
        </div>

        {jobResult && (
          <div className="p-3 rounded-[8px] bg-[#111110] border border-[rgba(232,75,44,0.35)] text-xs text-[#FFAA3D] font-technical">
            {jobResult}
          </div>
        )}

        {/* Primary KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A39E93]">Total Leads in DB</span>
              <Database className="w-4 h-4 text-[#FFAA3D]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#F3F0E8]">
                {metrics.totalLeads}
              </span>
              <span className="text-[11px] text-[#34D399]">
                {metrics.availableLeads} available
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#A39E93]">
              <span>{metrics.reservedLeads} in review</span>
              <span>•</span>
              <span>{metrics.activeClaims} claimed</span>
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A39E93]">Active Subscribers</span>
              <Users className="w-4 h-4 text-[#E84B2C]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#F3F0E8]">
                {metrics.activeSubscribers}
              </span>
              <span className="text-[11px] text-[#A39E93]">
                of {metrics.registeredUsers} users
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11px] text-[#A39E93]">
              <span>{metrics.starterSubscribers} Starter</span>
              <span>•</span>
              <span>{metrics.growthSubscribers} Growth</span>
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A39E93]">Gross Collections</span>
              <CreditCard className="w-4 h-4 text-[#34D399]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-2xl font-bold text-[#34D399]">
                {formatCurrencyINR(metrics.netCollectionsPaise)}
              </span>
            </div>
            <div className="mt-3 text-[11px] text-[#A39E93]">
              Authoritatively verified Razorpay transactions
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A39E93]">Pending Custom Requests</span>
              <Inbox className="w-4 h-4 text-[#FFAA3D]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#FFAA3D]">
                {metrics.pendingRequests}
              </span>
              <span className="text-[11px] text-[#A39E93]">subscriber orders</span>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#A39E93]">
              <AlertTriangle className="w-3.5 h-3.5 text-[#E84B2C]" />
              <span>{metrics.reportedComplaints} quality issues open</span>
            </div>
          </Card>
        </div>

        {/* Category Lead Inventory Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
                Inventory by Approved Category
              </h3>
              <p className="text-xs text-[#A39E93]">
                Lead inventory strictly categorized across the 5 approved commercial domains
              </p>
            </div>
            <Link href="/admin/leads">
              <Button variant="outline" size="sm">
                Manage Inventory &rarr;
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.categoryBreakdown.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-[#111110] rounded-[10px] border border-[rgba(243,240,232,0.08)]">
                <p className="text-xs text-[#A39E93]">
                  No leads recorded in database yet. Use CSV/XLSX Import or Add Lead to populate inventory.
                </p>
              </div>
            ) : (
              metrics.categoryBreakdown.map((cat) => (
                <Card
                  key={cat.name}
                  className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold text-[#F3F0E8]">
                      {cat.name}
                    </span>
                    <Badge variant="outline" size="sm">
                      {cat.total} Total
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(243,240,232,0.06)] text-xs">
                    <span className="text-[#A39E93]">Available for Pacing:</span>
                    <span className="font-technical font-bold text-[#34D399]">
                      {cat.available}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Quick Administrative Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[rgba(243,240,232,0.08)]">
          <Link href="/admin/imports" className="block group">
            <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] group-hover:border-[rgba(232,75,44,0.4)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#F3F0E8]">Import CSV / Excel</span>
                <ArrowRight className="w-4 h-4 text-[#FFAA3D] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#A39E93] mt-1">
                Upload verified commercial leads with automatic phone & email deduplication.
              </p>
            </Card>
          </Link>

          <Link href="/admin/requests" className="block group">
            <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] group-hover:border-[rgba(232,75,44,0.4)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#F3F0E8]">Review Customer Orders</span>
                <ArrowRight className="w-4 h-4 text-[#FFAA3D] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#A39E93] mt-1">
                Assign sourced business leads to fulfill custom category batches.
              </p>
            </Card>
          </Link>

          <Link href="/admin/feedback" className="block group">
            <Card className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] group-hover:border-[rgba(232,75,44,0.4)] transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#F3F0E8]">Quality Review & Feedback</span>
                <ArrowRight className="w-4 h-4 text-[#FFAA3D] group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-[11px] text-[#A39E93] mt-1">
                Resolve reported invalid phone or email numbers with replacement quota credits.
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
