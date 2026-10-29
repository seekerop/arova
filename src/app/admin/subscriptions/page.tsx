"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { CreditCard, CheckCircle2, XCircle } from "lucide-react";

export default function AdminSubscriptionsPage() {
  const [subscriptions] = useState<any[]>([
    {
      id: "sub_rzp_9901",
      customer: "siddharth@studio.com",
      plan_code: "starter",
      plan_name: "Starter (40 Leads)",
      status: "active",
      cycle_start: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      cycle_end: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString(),
      disclosure_version: "2026.1",
      disclosure_ack_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sub_rzp_9902",
      customer: "karan@agencypoint.in",
      plan_code: "growth",
      plan_name: "Growth (100 Leads)",
      status: "active",
      cycle_start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      cycle_end: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
      disclosure_version: "2026.1",
      disclosure_ack_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "sub_rzp_9903",
      customer: "rahul@nexus.io",
      plan_code: "starter",
      plan_name: "Starter (40 Leads)",
      status: "cancelled",
      cycle_start: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
      cycle_end: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      disclosure_version: "2026.1",
      disclosure_ack_at: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Subscriptions Management"
        subtitle="Active recurring subscriptions, renewal dates, and compliance acknowledgments"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
          <table className="w-full text-left text-xs text-[#D0CBC1]">
            <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
              <tr>
                <th className="p-4 font-semibold">Subscription ID</th>
                <th className="p-4 font-semibold">Subscriber</th>
                <th className="p-4 font-semibold">Plan</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Current Cycle End</th>
                <th className="p-4 font-semibold">Disclosure Acknowledged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
              {subscriptions.map((s) => (
                <tr key={s.id} className="hover:bg-[#161514]/40">
                  <td className="p-4 font-technical text-[#F3F0E8]">
                    {s.id}
                  </td>
                  <td className="p-4 font-medium text-[#F3F0E8]">
                    {s.customer}
                  </td>
                  <td className="p-4 text-[#FFAA3D] font-medium">
                    {s.plan_name}
                  </td>
                  <td className="p-4">
                    {s.status === "active" ? (
                      <Badge variant="success" size="sm">Active</Badge>
                    ) : (
                      <Badge variant="muted" size="sm">Cancelled</Badge>
                    )}
                  </td>
                  <td className="p-4 font-technical">
                    {formatDate(s.cycle_end)}
                  </td>
                  <td className="p-4 text-[#A39E93] text-[11px]">
                    v{s.disclosure_version} on {formatDate(s.disclosure_ack_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

