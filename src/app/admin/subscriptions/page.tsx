"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { CreditCard, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data.subscriptions || []);
      }
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Subscriptions Management"
        subtitle="Active recurring subscriptions, billing cycles, and quota renewal governance"
        actions={
          <Button variant="outline" size="sm" onClick={fetchSubscriptions} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#A39E93] flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#FFAA3D]" />
              <span>Loading subscriptions from database...</span>
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <CreditCard className="w-10 h-10 text-[#A39E93] mx-auto opacity-40" />
              <h4 className="font-display text-base font-bold text-[#F3F0E8]">
                No Active Subscriptions
              </h4>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                Subscriptions created through Razorpay will be authoritatively recorded here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                  <tr>
                    <th className="p-4 font-medium">Subscription ID / Gateway</th>
                    <th className="p-4 font-medium">Subscriber</th>
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Current Period End</th>
                    <th className="p-4 font-medium">Disclosure Ack</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                  {subscriptions.map((s) => (
                    <tr key={s.id} className="hover:bg-[#161514]/40 transition-colors">
                      <td className="p-4">
                        <span className="font-technical text-[#FFAA3D] block">{s.id.slice(0, 8)}...</span>
                        <span className="text-[10px] text-[#A39E93]">{s.razorpay_subscription_id || "Razorpay"}</span>
                      </td>
                      <td className="p-4 text-[#F3F0E8]">{s.customer_email || "Customer"}</td>
                      <td className="p-4">
                        <Badge variant="outline" size="sm" className="capitalize">
                          {s.plan_name || s.plan_code}
                        </Badge>
                      </td>
                      <td className="p-4 text-[#D0CBC1]">{formatDate(s.current_period_end)}</td>
                      <td className="p-4 text-[11px] text-[#34D399] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>v{s.disclosure_version || "2026.1"}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={s.status === "active" ? "success" : "default"} size="sm">
                          {s.status}
                        </Badge>
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
  );
}
