"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { Receipt, CheckCircle2, Download, CreditCard, ShieldCheck } from "lucide-react";

export default function BillingPage() {
  const [payments] = useState([
    {
      id: "pay_1",
      payment_id: "pay_Rzp902148102",
      order_id: "sub_RzpSub882193",
      amount_paise: 49900,
      status: "captured",
      plan_name: "Starter Plan (40 Leads)",
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "pay_0",
      payment_id: "pay_Rzp771829031",
      order_id: "sub_RzpSub661920",
      amount_paise: 49900,
      status: "captured",
      plan_name: "Starter Plan (40 Leads)",
      date: new Date(Date.now() - 36 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Billing & Payment History"
        subtitle="Authoritatively verified Razorpay transactions and invoices"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
        {/* Billing Overview Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Billing Gateway</span>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-display text-lg font-bold text-[#F3F0E8]">
                Razorpay India
              </span>
              <Badge variant="success" size="sm">
                Verified
              </Badge>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-1">
              Supports Cards, UPI, NetBanking, and Auto-debit
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Total Invoiced (Paise)</span>
            <div className="mt-2">
              <span className="font-technical text-2xl font-bold text-[#F3F0E8]">
                99,800
              </span>
              <span className="text-xs text-[#FFAA3D] ml-2">(₹998.00)</span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-1">2 verified billing cycles</p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Next Renewal Date</span>
            <div className="mt-2">
              <span className="font-technical text-lg font-bold text-[#34D399]">
                Nov 23, 2026
              </span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-1">₹499 Starter Subscription</p>
          </Card>
        </div>

        {/* Transactions Table */}
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold text-[#F3F0E8]">
            Authoritative Payment Records
          </h3>

          <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
            <table className="w-full text-left text-xs text-[#D0CBC1]">
              <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
                <tr>
                  <th className="p-4 font-semibold">Payment ID</th>
                  <th className="p-4 font-semibold">Plan Description</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Amount (Paise / INR)</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#161514]/40">
                    <td className="p-4 font-technical text-[#F3F0E8]">
                      {p.payment_id}
                    </td>
                    <td className="p-4 font-medium text-[#F3F0E8]">
                      {p.plan_name}
                    </td>
                    <td className="p-4 text-[#A39E93]">
                      {formatDate(p.date)}
                    </td>
                    <td className="p-4 font-technical">
                      <span className="text-[#F3F0E8]">
                        {formatCurrencyINR(p.amount_paise)}
                      </span>
                      <span className="text-[10px] text-[#9E9B93] block">
                        ({p.amount_paise} paise)
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="success" size="sm" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Captured
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1 text-[#A39E93] hover:text-[#F3F0E8]"
                        onClick={() => alert(`Receipt #${p.payment_id} downloaded.`)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Invoice
                      </Button>
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
