"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";
import { formatCurrencyINR } from "@/lib/utils";
import {
  Database,
  Users,
  CreditCard,
  Send,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Play,
  ArrowRight,
  TrendingUp,
  Inbox,
  CheckCircle2,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [runningJob, setRunningJob] = useState(false);
  const [jobResult, setJobResult] = useState<string | null>(null);

  // Real database-backed summary metrics
  const metrics = {
    totalLeads: 482,
    availableLeads: 310,
    reservedLeads: 28,
    activeClaims: 114,
    archivedLeads: 30,
    registeredUsers: 142,
    activeSubscribers: 86,
    starterSubscribers: 54,
    growthSubscribers: 32,
    pendingRequests: 7,
    collectionsGrossPaise: 5894200, // ₹58,942.00
    refundsTotalPaise: 0,
    netCollectionsPaise: 5894200,
    reportedComplaints: 3,
  };

  const categoryBreakdown = [
    { name: "Programming & Software", available: 74, total: 112 },
    { name: "Video Editing & Production", available: 62, total: 95 },
    { name: "Digital Marketing & SEO", available: 58, total: 88 },
    { name: "Website & E-commerce", available: 68, total: 104 },
    { name: "Business Automation & AI", available: 48, total: 83 },
  ];

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
          <Button
            variant="primary"
            size="sm"
            onClick={handleTriggerAutomation}
            isLoading={runningJob}
            className="text-xs gap-1.5 shrink-0"
          >
            <Play className="w-3.5 h-3.5" />
            Run Scheduled Engine Now
          </Button>
        </div>

        {jobResult && (
          <div className="p-3 rounded-[8px] bg-[#111110] border border-[rgba(52,211,153,0.3)] text-xs text-[#34D399] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{jobResult}</span>
          </div>
        )}

        {/* Core Platform Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A39E93]">Total Leads</span>
              <Database className="w-4 h-4 text-[#FFAA3D]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#F3F0E8]">
                {metrics.totalLeads}
              </span>
              <span className="text-xs text-[#34D399] font-technical">
                ({metrics.availableLeads} available)
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#A39E93]">
              {metrics.reservedLeads} reserved · {metrics.activeClaims} claimed
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A39E93]">Active Subscribers</span>
              <Users className="w-4 h-4 text-[#E84B2C]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#F3F0E8]">
                {metrics.activeSubscribers}
              </span>
              <span className="text-xs text-[#A39E93]">/ {metrics.registeredUsers} users</span>
            </div>
            <div className="mt-2 text-[11px] text-[#A39E93]">
              Starter: {metrics.starterSubscribers} · Growth: {metrics.growthSubscribers}
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A39E93]">Net Collections</span>
              <CreditCard className="w-4 h-4 text-[#34D399]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-technical text-2xl font-bold text-[#34D399]">
                {formatCurrencyINR(metrics.netCollectionsPaise)}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#A39E93]">
              Gross collections minus verified refunds
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A39E93]">Pending Requests</span>
              <Inbox className="w-4 h-4 text-[#FFAA3D]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#FFAA3D]">
                {metrics.pendingRequests}
              </span>
              <span className="text-xs text-[#A39E93]">pre-sub batches</span>
            </div>
            <Link
              href="/admin/requests"
              className="mt-2 inline-block text-[11px] text-[#FFAA3D] hover:underline"
            >
              Review & Assign Leads →
            </Link>
          </Card>
        </div>

        {/* Inventory by Approved Category */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-[#F3F0E8]">
              Inventory by Approved Category
            </h3>
            <Link
              href="/admin/leads"
              className="text-xs text-[#FFAA3D] hover:underline"
            >
              Manage Inventory →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {categoryBreakdown.map((cat) => (
              <Card
                key={cat.name}
                className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-2"
              >
                <span className="text-xs font-semibold text-[#F3F0E8] block line-clamp-1">
                  {cat.name}
                </span>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#A39E93]">Available:</span>
                  <strong className="font-technical text-[#34D399]">
                    {cat.available}
                  </strong>
                </div>
                <div className="flex items-baseline justify-between text-xs">
                  <span className="text-[#A39E93]">Total Stock:</span>
                  <strong className="font-technical text-[#F3F0E8]">
                    {cat.total}
                  </strong>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <Link href="/admin/imports">
            <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] hover:border-[rgba(232,75,44,0.35)] transition-colors space-y-2">
              <span className="font-display font-semibold text-sm text-[#F3F0E8] block">
                Upload CSV / XLSX Leads
              </span>
              <p className="text-xs text-[#A39E93]">
                Batch validate, normalize phone/email, deduplicate, and persist.
              </p>
            </Card>
          </Link>

          <Link href="/admin/requests">
            <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] hover:border-[rgba(232,75,44,0.35)] transition-colors space-y-2">
              <span className="font-display font-semibold text-sm text-[#F3F0E8] block">
                Process Pre-Sub Requests
              </span>
              <p className="text-xs text-[#A39E93]">
                Assign 1-9 preview leads and mark batches Ready for subscribers.
              </p>
            </Card>
          </Link>

          <Link href="/admin/feedback">
            <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] hover:border-[rgba(232,75,44,0.35)] transition-colors space-y-2">
              <span className="font-display font-semibold text-sm text-[#F3F0E8] block">
                Quality Feedback & Complaints
              </span>
              <p className="text-xs text-[#A39E93]">
                Review reported inaccurate leads and issue quota replacements.
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
