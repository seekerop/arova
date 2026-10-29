"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { Receipt, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/payments");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
        setWebhooks(data.webhooks || []);
      }
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Payments & Webhook Ingestion"
        subtitle="Authoritatively verified Razorpay transactions and webhook events"
        actions={
          <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Payments Table */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
            Captured Payments
          </h3>

          <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-[#A39E93] flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#FFAA3D]" />
                <span>Loading payments from database...</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#A39E93] space-y-2">
                <Receipt className="w-8 h-8 text-[#A39E93] mx-auto opacity-40" />
                <p>No transactions recorded in database yet.</p>
                <p className="text-[11px] text-[#9E9B93]">Captured Razorpay payments will be logged here automatically.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                    <tr>
                      <th className="p-4 font-medium">Payment ID</th>
                      <th className="p-4 font-medium">Subscriber</th>
                      <th className="p-4 font-medium">Amount</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-[#161514]/40 transition-colors">
                        <td className="p-4 font-technical text-[#FFAA3D]">{p.razorpay_payment_id || p.id}</td>
                        <td className="p-4 text-[#F3F0E8]">{p.customer_email || "Customer"}</td>
                        <td className="p-4 font-technical text-[#34D399] font-bold">
                          {formatCurrencyINR(p.amount_paise || 0)}
                        </td>
                        <td className="p-4">
                          <Badge variant="success" size="sm">
                            {p.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-[11px] text-[#A39E93]">{formatDate(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Webhooks Table */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
            Webhook Audit Log
          </h3>

          <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#A39E93]">Loading webhooks...</div>
            ) : webhooks.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#A39E93]">
                No webhook events received yet. Incoming Razorpay webhooks will appear here.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                    <tr>
                      <th className="p-4 font-medium">Event Type</th>
                      <th className="p-4 font-medium">Event ID</th>
                      <th className="p-4 font-medium">Processing Status</th>
                      <th className="p-4 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                    {webhooks.map((w) => (
                      <tr key={w.id} className="hover:bg-[#161514]/40 transition-colors">
                        <td className="p-4 font-technical text-[#FFAA3D]">{w.event_type}</td>
                        <td className="p-4 font-technical text-[#9E9B93]">{w.event_id}</td>
                        <td className="p-4">
                          <Badge variant="outline" size="sm">{w.status || "processed"}</Badge>
                        </td>
                        <td className="p-4 text-[11px] text-[#A39E93]">{formatDate(w.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
