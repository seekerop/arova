"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { formatTimeRemainingText, formatDate } from "@/lib/utils";
import {
  Users,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Eye,
  Layers,
  Lock,
  RefreshCw,
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState<{
    total: number;
    consumed: number;
    reserved: number;
    remaining: number;
  }>({
    total: 0,
    consumed: 0,
    reserved: 0,
    remaining: 0,
  });

  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([]);
  const [activeClaims, setActiveClaims] = useState<any[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/overview");
      if (res.ok) {
        const data = await res.json();
        if (data.quota) setQuota(data.quota);
        if (data.pendingDeliveries) setPendingDeliveries(data.pendingDeliveries);
        if (data.activeClaims) setActiveClaims(data.activeClaims);
      }
    } catch (err) {
      console.error("Dashboard overview load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptOffer = async (deliveryId: string) => {
    try {
      const res = await fetch("/api/leads/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const handleDeclineOffer = async (deliveryId: string) => {
    try {
      const res = await fetch("/api/leads/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId, reason: "Customer declined within 48h window" }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Decline error:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Pipeline Overview"
        subtitle="Manage your 48-hour lead offers, exclusive claims, and subscription quota balance"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Mandatory Lead Limitation & Quality Notice */}
        <MandatoryDisclaimerBanner />

        {/* Quota Accounting Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A39E93]">Remaining Quota</span>
              <Users className="w-4 h-4 text-[#FFAA3D]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#FFAA3D]">
                {quota.remaining}
              </span>
              <span className="text-xs text-[#A39E93]">/ {quota.total} leads</span>
            </div>
            <div className="mt-3 w-full bg-[#161514] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#FFAA3D] h-full rounded-full transition-all"
                style={{
                  width: `${quota.total > 0 ? (quota.remaining / quota.total) * 100 : 0}%`,
                }}
              />
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A39E93]">Pending Review</span>
              <Clock className="w-4 h-4 text-[#E84B2C]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#E84B2C]">
                {quota.reserved}
              </span>
              <span className="text-xs text-[#A39E93]">in 48h window</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-3">
              Reserved quota holds until accept/decline
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A39E93]">Exclusive Claims</span>
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#34D399]">
                {quota.consumed}
              </span>
              <span className="text-xs text-[#A39E93]">claimed leads</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-3">
              30-day exclusive outreach protection
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#A39E93]">Total Period Allocation</span>
              <Layers className="w-4 h-4 text-[#A39E93]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#F3F0E8]">
                {quota.total}
              </span>
              <span className="text-xs text-[#A39E93]">30-day window</span>
            </div>
            <Link
              href="/dashboard/subscription"
              className="text-[11px] text-[#FFAA3D] hover:underline mt-3 block"
            >
              Manage subscription &rarr;
            </Link>
          </Card>
        </div>

        {/* Section 1: Pending Leads for Review (48h Acceptance Window) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <span>Leads Pending Review</span>
                {pendingDeliveries.length > 0 && (
                  <Badge variant="warning" size="sm">
                    {pendingDeliveries.length} Action Required
                  </Badge>
                )}
              </h3>
              <p className="text-xs text-[#A39E93]">
                Review verified prospective requirements. Accept within 48 hours to claim contact details exclusively.
              </p>
            </div>
            <Link href="/dashboard/leads">
              <Button variant="outline" size="sm">
                View All Leads &rarr;
              </Button>
            </Link>
          </div>

          {loading ? (
            <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] text-center text-xs text-[#A39E93]">
              <RefreshCw className="w-5 h-5 animate-spin text-[#FFAA3D] mx-auto mb-2" />
              Checking your lead pipeline...
            </Card>
          ) : pendingDeliveries.length === 0 ? (
            <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] text-center space-y-2">
              <Clock className="w-8 h-8 text-[#A39E93] mx-auto opacity-40" />
              <p className="text-xs font-medium text-[#F3F0E8]">No Pending Leads for Review</p>
              <p className="text-[11px] text-[#A39E93] max-w-sm mx-auto">
                New leads are distributed across your billing cycle according to your category and location preferences.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingDeliveries.map((delivery) => (
                <Card
                  key={delivery.id}
                  className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] hover:border-[rgba(232,75,44,0.35)] transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#161514] border border-[rgba(232,75,44,0.3)] flex items-center justify-center text-[#FFAA3D] shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        {/* PRIVACY RULE ENFORCED: Never show real business name for unaccepted leads! */}
                        <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
                          {delivery.lead?.business_name || `Confidential Commercial Prospect`}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-[#A39E93] mt-0.5">
                          <span>{delivery.lead?.category_name}</span>
                          <span>•</span>
                          <span>{delivery.lead?.city}{delivery.lead?.state ? `, ${delivery.lead.state}` : ""}</span>
                          {delivery.lead?.estimated_value_paise && (
                            <>
                              <span>•</span>
                              <span className="font-technical text-[#FFAA3D]">
                                Est. ₹{((delivery.lead.estimated_value_paise || 0) / 100).toLocaleString("en-IN")}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <div className="px-2.5 py-1 rounded-[6px] bg-[rgba(255,170,61,0.1)] border border-[rgba(255,170,61,0.25)] text-[11px] font-technical text-[#FFAA3D] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#FFAA3D]" />
                        <span>{formatTimeRemainingText(delivery.response_deadline)} remaining</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.04)] text-xs text-[#D0CBC1] leading-relaxed">
                    <strong className="text-[#F3F0E8] font-medium block mb-1">
                      Requirement Overview:
                    </strong>
                    {delivery.lead?.generalized_requirement}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(243,240,232,0.06)]">
                    <span className="text-[11px] text-[#A39E93]">
                      Accepting consumes 1 quota unit and grants 30-day exclusive outreach
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeclineOffer(delivery.id)}
                        className="text-[#A39E93] hover:text-[#E84B2C]"
                      >
                        Decline
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptOffer(delivery.id)}
                      >
                        Accept & Claim Lead
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Active Exclusive Claims (30-day Protection) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <span>Active Exclusive Claims</span>
                <Badge variant="success" size="sm">
                  {activeClaims.length} Active
                </Badge>
              </h3>
              <p className="text-xs text-[#A39E93]">
                Full prospect identities unlocked. No other subscriber can claim or view these leads for 30 days.
              </p>
            </div>
          </div>

          {loading ? (
            <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] text-center text-xs text-[#A39E93]">
              Loading active claims...
            </Card>
          ) : activeClaims.length === 0 ? (
            <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#A39E93] mx-auto opacity-40" />
              <p className="text-xs font-medium text-[#F3F0E8]">No Active Claims</p>
              <p className="text-[11px] text-[#A39E93] max-w-sm mx-auto">
                When you accept pending offers, they will unlock here with full direct contact information and 30-day exclusive claim timers.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeClaims.map((claim) => (
                <Card
                  key={claim.id}
                  className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] hover:border-[rgba(52,211,153,0.35)] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      {/* Unmasked business name for actively claimed lead */}
                      <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
                        {claim.lead?.business_name}
                      </h4>
                      <div className="text-[11px] text-[#FFAA3D] font-medium mt-0.5">
                        {claim.lead?.contact_name}
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      {formatTimeRemainingText(claim.expires_at)} claim remaining
                    </Badge>
                  </div>

                  <div className="p-2.5 rounded-[6px] bg-[#161514] font-technical text-xs space-y-1 text-[#D0CBC1]">
                    <div>Phone: <span className="text-[#F3F0E8]">{claim.lead?.phone}</span></div>
                    <div>Email: <span className="text-[#F3F0E8]">{claim.lead?.email}</span></div>
                    {claim.lead?.website && (
                      <div>Web: <span className="text-[#FFAA3D]">{claim.lead?.website}</span></div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px] text-[#A39E93]">
                    <span>Category: {claim.lead?.category_name}</span>
                    <Link
                      href={`/dashboard/leads/${claim.lead_id}`}
                      className="text-[#FFAA3D] hover:underline flex items-center gap-1"
                    >
                      <span>Full Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
