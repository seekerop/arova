"use client";

import { AdminHeader } from "@/components/navigation/admin-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrencyINR } from "@/lib/utils";
import { BarChart3, TrendingUp, ShieldCheck, Clock, Users, ArrowUpRight } from "lucide-react";

export default function AdminAnalyticsPage() {
  const categoryInventory = [
    { name: "Programming & Software", total: 112, available: 74, claimed: 28, rate: "25.0%" },
    { name: "Video Editing & Production", total: 95, available: 62, claimed: 24, rate: "25.2%" },
    { name: "Digital Marketing & SEO", total: 88, available: 58, claimed: 22, rate: "25.0%" },
    { name: "Website & E-commerce", total: 104, available: 68, claimed: 26, rate: "25.0%" },
    { name: "Business Automation & AI", total: 83, available: 48, claimed: 24, rate: "28.9%" },
  ];

  const cityDistribution = [
    { city: "Mumbai Metropolitan Region", count: 142, share: "29.4%" },
    { city: "Bengaluru Urban", count: 124, share: "25.7%" },
    { city: "Delhi NCR", count: 96, share: "19.9%" },
    { city: "Pune", count: 68, share: "14.1%" },
    { city: "Hyderabad", count: 52, share: "10.7%" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Platform Intelligence & Analytics"
        subtitle="Data-backed inventory metrics, claim conversion ratios, and regional distribution"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Metric Notes Banner */}
        <div className="p-4 rounded-[10px] bg-[#161514] border border-[rgba(243,240,232,0.08)] text-xs text-[#A39E93]">
          <strong>Reporting Standard:</strong> Metrics reflect active 30-day billing windows. Collections represent gross payment capture before server infrastructure overhead. Non-responsive prospects are mathematically isolated from invalid data claims.
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Offer Acceptance Rate</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#34D399]">
                73.8%
              </span>
              <span className="text-[11px] text-[#A39E93]">(Accepted / Offered)</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-2">
              Denominator: 172 offers made in past 30 days
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Offer Expiry Rate (48h)</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#FFAA3D]">
                16.2%
              </span>
              <span className="text-[11px] text-[#A39E93]">(Expired / Offered)</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-2">
              Reserved quota automatically released back
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Offer Rejection Rate</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#C86938]">
                10.0%
              </span>
              <span className="text-[11px] text-[#A39E93]">(Declined by customer)</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-2">
              Leads returned to active inventory pool
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Data Quality Complaint Rate</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#34D399]">
                0.62%
              </span>
              <span className="text-[11px] text-[#34D399]">Low</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-2">
              3 verified reports across 482 total leads
            </p>
          </Card>
        </div>

        {/* Category Breakdown Table */}
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-[#F3F0E8]">
            Category Stock & Claim Velocity
          </h3>

          <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
            <table className="w-full text-left text-xs text-[#D0CBC1]">
              <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
                <tr>
                  <th className="p-4 font-semibold">Approved Category</th>
                  <th className="p-4 font-semibold">Total Sourced</th>
                  <th className="p-4 font-semibold">Available Stock</th>
                  <th className="p-4 font-semibold">Actively Claimed</th>
                  <th className="p-4 font-semibold text-right">Claim Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                {categoryInventory.map((c) => (
                  <tr key={c.name} className="hover:bg-[#161514]/40">
                    <td className="p-4 font-medium text-[#F3F0E8]">{c.name}</td>
                    <td className="p-4 font-technical">{c.total}</td>
                    <td className="p-4 font-technical text-[#34D399]">{c.available}</td>
                    <td className="p-4 font-technical text-[#FFAA3D]">{c.claimed}</td>
                    <td className="p-4 font-technical text-right text-[#F3F0E8]">{c.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* City Breakdown */}
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-[#F3F0E8]">
            Regional Lead Distribution
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {cityDistribution.map((item) => (
              <Card key={item.city} className="p-4 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-1">
                <span className="text-xs text-[#A39E93] block line-clamp-1">{item.city}</span>
                <span className="font-technical text-xl font-bold text-[#F3F0E8] block">{item.count} leads</span>
                <span className="text-[11px] font-technical text-[#FFAA3D] block">{item.share} of total</span>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

