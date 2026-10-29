"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatTimeRemaining, formatDate } from "@/lib/utils";
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
} from "lucide-react";

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [quota, setQuota] = useState<{
    total: number;
    consumed: number;
    reserved: number;
    remaining: number;
  }>({
    total: 40,
    consumed: 5,
    reserved: 2,
    remaining: 33,
  });

  const [pendingDeliveries, setPendingDeliveries] = useState<any[]>([
    {
      id: "del_1",
      lead: {
        id: "lead_101",
        business_name: "Apex Retail Solutions",
        category_name: "Website & E-commerce",
        city: "Mumbai",
        state: "Maharashtra",
        generalized_requirement: "Shopify 2.0 headless storefront migration & checkout speed optimization.",
        estimated_value_paise: 8500000,
      },
      response_deadline: new Date(Date.now() + 38 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "del_2",
      lead: {
        id: "lead_102",
        business_name: "Karan Media Labs",
        category_name: "Video Editing & Production",
        city: "Bengaluru",
        state: "Karnataka",
        generalized_requirement: "Long-form YouTube documentary post-production and motion branding.",
        estimated_value_paise: 4500000,
      },
      response_deadline: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [activeClaims, setActiveClaims] = useState<any[]>([
    {
      id: "claim_1",
      lead: {
        id: "lead_201",
        business_name: "Zenith FinTech Systems",
        contact_name: "Vikram Malhotra",
        phone: "+91 98201 44921",
        email: "vikram@zenithfintech.in",
        category_name: "Programming & Software",
        city: "Pune",
      },
      claimed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: period } = await supabase
            .from("quota_periods")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .single();

          if (period) {
            const rem = period.total_allocation - period.consumed_quota - period.reserved_quota;
            setQuota({
              total: period.total_allocation,
              consumed: period.consumed_quota,
              reserved: period.reserved_quota,
              remaining: rem,
            });
          }
        }
      } catch (err) {
        console.error("Dashboard overview load error:", err);
      } finally {
        setLoading(false);
      }
    }
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
        setPendingDeliveries((prev) => prev.filter((d) => d.id !== deliveryId));
        setQuota((prev) => ({
          ...prev,
          reserved: prev.reserved - 1,
          consumed: prev.consumed + 1,
        }));
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const handleRejectOffer = async (deliveryId: string) => {
    try {
      const res = await fetch("/api/leads/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId }),
      });
      if (res.ok) {
        setPendingDeliveries((prev) => prev.filter((d) => d.id !== deliveryId));
        setQuota((prev) => ({
          ...prev,
          reserved: prev.reserved - 1,
          remaining: prev.remaining + 1,
        }));
      }
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Pipeline Overview"
        subtitle="Manage your active prospect claims and incoming lead allocations"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Mandatory Lead Limitation Disclaimer Notice */}
        <MandatoryDisclaimerBanner variant="short" />

        {/* ============================================================
            QUOTA ACCOUNTING METRICS (Durable Invariant Display)
            ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A39E93]">Remaining Quota</span>
              <Badge variant="flame" size="sm">Active</Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#F3F0E8]">
                {quota.remaining}
              </span>
              <span className="text-xs text-[#A39E93]">/ {quota.total} allocated</span>
            </div>
            <div className="mt-2 text-[11px] text-[#FFAA3D] flex items-center gap-1">
              <span>Ready for offers or batch unlocks</span>
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A39E93]">Pending Offers</span>
              <Clock className="w-4 h-4 text-[#FFAA3D]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#FFAA3D]">
                {quota.reserved}
              </span>
              <span className="text-xs text-[#A39E93]">reserved</span>
            </div>
            <div className="mt-2 text-[11px] text-[#A39E93]">
              Review within 48-hour window
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A39E93]">Active Claims</span>
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#34D399]">
                {quota.consumed}
              </span>
              <span className="text-xs text-[#A39E93]">consumed</span>
            </div>
            <div className="mt-2 text-[11px] text-[#34D399]">
              30-day exclusive outreach
            </div>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#A39E93]">Current Plan</span>
              <span className="text-[11px] font-technical text-[#C86938]">30 Days</span>
            </div>
            <div className="mt-3">
              <span className="font-display text-xl font-bold text-[#F3F0E8]">
                Starter Plan
              </span>
              <p className="text-xs text-[#A39E93] mt-0.5">₹499 / 40 leads</p>
            </div>
            <Link
              href="/dashboard/subscription"
              className="mt-2 inline-block text-[11px] text-[#FFAA3D] hover:underline"
            >
              Manage Subscription →
            </Link>
          </Card>
        </div>

        {/* ============================================================
            PENDING OFFERS (48-Hour Deadline Action Queue)
            ============================================================ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFAA3D]" />
              <h2 className="font-display text-base font-bold text-[#F3F0E8]">
                Pending Lead Offers (48h Action Window)
              </h2>
            </div>
            <Link
              href="/dashboard/leads"
              className="text-xs text-[#FFAA3D] hover:underline"
            >
              View All Leads →
            </Link>
          </div>

          {pendingDeliveries.length === 0 ? (
            <Card className="p-8 text-center bg-[#111110] border-[rgba(243,240,232,0.06)]">
              <CheckCircle2 className="w-8 h-8 text-[#34D399] mx-auto mb-2 opacity-60" />
              <p className="text-xs text-[#D0CBC1]">No pending offers awaiting review.</p>
              <p className="text-[11px] text-[#A39E93] mt-1">
                New leads matching your category preferences will arrive periodically.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingDeliveries.map((delivery) => {
                const rem = formatTimeRemaining(delivery.response_deadline);
                return (
                  <Card
                    key={delivery.id}
                    className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] hover:border-[rgba(232,75,44,0.3)] space-y-4 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Badge variant="category" size="sm">
                          {delivery.lead.category_name}
                        </Badge>
                        <h3 className="font-display font-semibold text-sm text-[#F3F0E8] mt-2">
                          {delivery.lead.city}, {delivery.lead.state}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-technical px-2 py-0.5 rounded bg-[rgba(255,170,61,0.15)] text-[#FFAA3D] border border-[rgba(255,170,61,0.3)]">
                          <Clock className="w-3 h-3" />
                          {rem.text}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#D0CBC1] leading-relaxed line-clamp-2">
                      {delivery.lead.generalized_requirement}
                    </p>

                    <div className="pt-2 border-t border-[rgba(243,240,232,0.06)] flex items-center justify-between gap-2">
                      <Link href={`/dashboard/leads/${delivery.lead.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          Safe Preview
                        </Button>
                      </Link>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectOffer(delivery.id)}
                          className="text-xs text-[#A39E93] hover:text-[#E84B2C]"
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptOffer(delivery.id)}
                          className="text-xs"
                        >
                          Accept Offer
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================
            ACTIVE EXCLUSIVE CLAIMS (30-Day Window)
            ============================================================ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              <h2 className="font-display text-base font-bold text-[#F3F0E8]">
                Active Exclusive Claims (30 Days)
              </h2>
            </div>
            <Link
              href="/dashboard/leads"
              className="text-xs text-[#FFAA3D] hover:underline"
            >
              Outreach Directory →
            </Link>
          </div>

          {activeClaims.length === 0 ? (
            <Card className="p-8 text-center bg-[#111110] border-[rgba(243,240,232,0.06)]">
              <p className="text-xs text-[#D0CBC1]">No active lead claims currently held.</p>
              <p className="text-[11px] text-[#A39E93] mt-1">
                Accept incoming offers above to claim exclusive prospect access.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {activeClaims.map((claim) => {
                const rem = formatTimeRemaining(claim.expires_at);
                return (
                  <Card
                    key={claim.id}
                    className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-semibold text-sm text-[#F3F0E8]">
                          {claim.lead.business_name}
                        </h4>
                        <Badge variant="category" size="sm">
                          {claim.lead.category_name}
                        </Badge>
                      </div>
                      <div className="text-xs text-[#A39E93] flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span>Contact: <strong className="text-[#F3F0E8]">{claim.lead.contact_name}</strong></span>
                        <span>Phone: <span className="font-technical text-[#F3F0E8]">{claim.lead.phone}</span></span>
                        <span>Email: <span className="font-technical text-[#F3F0E8]">{claim.lead.email}</span></span>
                        <span>City: <span className="text-[#D0CBC1]">{claim.lead.city}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-[#A39E93] block">Exclusive Claim</span>
                        <span className="font-technical text-xs text-[#34D399]">
                          {rem.text}
                        </span>
                      </div>
                      <Link href={`/dashboard/leads/${claim.lead.id}`}>
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

