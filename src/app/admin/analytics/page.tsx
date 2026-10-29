"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyINR } from "@/lib/utils";
import { BarChart3, TrendingUp, RefreshCw } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    availableLeads: 0,
    activeClaims: 0,
    registeredUsers: 0,
    activeSubscribers: 0,
    netCollectionsPaise: 0,
    categoryBreakdown: [] as { name: string; available: number; total: number }[],
  });

  const loadData = async () => {
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
      console.error("Failed to load analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalLeads = metrics.totalLeads;
  const claimedLeads = metrics.activeClaims;
  const claimRate = totalLeads > 0 ? ((claimedLeads / totalLeads) * 100).toFixed(1) : "0.0";
  const subConversionRate =
    metrics.registeredUsers > 0
      ? ((metrics.activeSubscribers / metrics.registeredUsers) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Platform Intelligence & Analytics"
        subtitle="Data-backed inventory metrics, claim conversion ratios, and category allocation"
        actions={
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Claim Conversion Rate</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#34D399]">
                {claimRate}%
              </span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-2">
              {claimedLeads} claims / {totalLeads} total leads
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Subscriber Conversion</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#FFAA3D]">
                {subConversionRate}%
              </span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-2">
              {metrics.activeSubscribers} active of {metrics.registeredUsers} users
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Net Revenue</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-2xl font-bold text-[#34D399]">
                {formatCurrencyINR(metrics.netCollectionsPaise)}
              </span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-2">
              Direct from verified Razorpay settlements
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Inventory Capacity</span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-technical text-3xl font-bold text-[#F3F0E8]">
                {metrics.availableLeads}
              </span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-2">
              Available for scheduled subscriber delivery
            </p>
          </Card>
        </div>

        {/* Category Allocation Distribution */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
            Category Lead Distribution
          </h3>

          <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            {metrics.categoryBreakdown.length === 0 ? (
              <p className="text-xs text-[#A39E93] text-center py-6">
                No inventory metrics recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                {metrics.categoryBreakdown.map((cat) => {
                  const pct = totalLeads > 0 ? Math.round((cat.total / totalLeads) * 100) : 0;
                  return (
                    <div key={cat.name} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#F3F0E8]">{cat.name}</span>
                        <span className="font-technical text-[#FFAA3D]">{cat.total} leads ({pct}%)</span>
                      </div>
                      <div className="w-full h-2 bg-[#161514] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#E84B2C] rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
