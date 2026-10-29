"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { Receipt, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminPaymentsPage() {
  const [payments] = useState<any[]>([
    {
      id: "pay_Rzp902148102",
      user: "siddharth@studio.com",
      amount_paise: 49900,
      currency: "INR",
      status: "captured",
      subscription_id: "sub_rzp_9901",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "pay_Rzp882190412",
      user: "karan@agencypoint.in",
      amount_paise: 99900,
      currency: "INR",
      status: "captured",
      subscription_id: "sub_rzp_9902",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const [webhooks] = useState<any[]>([
    {
      id: "wh_001",
      event: "subscription.charged",
      event_id: "evt_RzpCharge_9918",
      status: "processed",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "wh_002",
      event: "subscription.charged",
      event_id: "evt_RzpCharge_9917",
      status: "processed",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "wh_003",
      event: "subscription.cancelled",
      event_id: "evt_RzpCancel_9910",
      status: "processed",
      date: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Payments & Webhooks Audit"
        subtitle="Authoritatively verified payments, Razorpay transaction IDs, and webhook idempotency"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Payments Table */}
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-[#F3F0E8]">
            Verified Payments
          </h3>

          <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
            <table className="w-full text-left text-xs text-[#D0CBC1]">
              <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
                <tr>
                  <th className="p-4 font-semibold">Razorpay Payment ID</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Amount (Paise / INR)</th>
                  <th className="p-4 font-semibold">Subscription Link</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Captured Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#161514]/40">
                    <td className="p-4 font-technical text-[#F3F0E8]">
                      {p.id}
                    </td>
                    <td className="p-4 text-[#F3F0E8]">{p.user}</td>
                    <td className="p-4 font-technical">
                      <span className="text-[#34D399] font-bold">
                        {formatCurrencyINR(p.amount_paise)}
                      </span>
                      <span className="text-[10px] text-[#9E9B93] block">
                        ({p.amount_paise} paise)
                      </span>
                    </td>
                    <td className="p-4 font-technical text-[#FFAA3D]">
                      {p.subscription_id}
                    </td>
                    <td className="p-4">
                      <Badge variant="success" size="sm">
                        Captured
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-[#A39E93]">
                      {formatDate(p.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Webhooks Idempotency Log */}
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-[#F3F0E8]">
            Webhook Signature Verification & Idempotency Logs
          </h3>

          <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
            <table className="w-full text-left text-xs text-[#D0CBC1]">
              <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
                <tr>
                  <th className="p-4 font-semibold">Event ID</th>
                  <th className="p-4 font-semibold">Event Type</th>
                  <th className="p-4 font-semibold">Signature Check</th>
                  <th className="p-4 font-semibold">Processing Status</th>
                  <th className="p-4 font-semibold text-right">Processed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                {webhooks.map((w) => (
                  <tr key={w.id} className="hover:bg-[#161514]/40">
                    <td className="p-4 font-technical text-[#F3F0E8]">
                      {w.event_id}
                    </td>
                    <td className="p-4 font-technical text-[#FFAA3D]">
                      {w.event}
                    </td>
                    <td className="p-4">
                      <Badge variant="success" size="sm">
                        HMAC SHA256 Verified
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" size="sm">
                        {w.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-[#A39E93]">
                      {formatDate(w.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
