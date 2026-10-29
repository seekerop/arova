"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { Receipt, CheckCircle2, RefreshCw, CreditCard } from "lucide-react";

export default function BillingPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/billing");
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to load billing history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalInvoicedPaise = payments.reduce(
    (acc, curr) => acc + (curr.amount_paise || 0),
    0
  );

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Billing & Payment History"
        subtitle="Authoritatively verified Razorpay transactions and invoices"
        actions={
          <Button variant="outline" size="sm" onClick={fetchPayments} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
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
            <span className="text-xs text-[#A39E93]">Total Invoiced</span>
            <div className="mt-2">
              <span className="font-technical text-2xl font-bold text-[#34D399]">
                {formatCurrencyINR(totalInvoicedPaise)}
              </span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-1">
              Inclusive of GST where applicable
            </p>
          </Card>

          <Card className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)]">
            <span className="text-xs text-[#A39E93]">Settlement Currency</span>
            <div className="mt-2">
              <span className="font-display text-lg font-bold text-[#F3F0E8]">
                INR (₹)
              </span>
            </div>
            <p className="text-[11px] text-[#A39E93] mt-1">
              Direct Indian domestic merchant account
            </p>
          </Card>
        </div>

        {/* Transactions Table */}
        <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#A39E93] flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#FFAA3D]" />
              <span>Loading payment history...</span>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Receipt className="w-10 h-10 text-[#A39E93] mx-auto opacity-40" />
              <h4 className="font-display text-base font-bold text-[#F3F0E8]">
                No Invoices Recorded
              </h4>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                Invoices and payment receipts will appear here after your first subscription checkout.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                  <tr>
                    <th className="p-4 font-medium">Payment ID</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#161514]/40 transition-colors">
                      <td className="p-4 font-technical text-[#FFAA3D]">
                        {p.razorpay_payment_id || p.id}
                      </td>
                      <td className="p-4 font-technical text-[#34D399] font-bold">
                        {formatCurrencyINR(p.amount_paise || 0)}
                      </td>
                      <td className="p-4">
                        <Badge variant="success" size="sm">
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-[11px] text-[#A39E93]">
                        {formatDate(p.created_at)}
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
