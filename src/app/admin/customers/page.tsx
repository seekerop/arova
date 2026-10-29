"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Users, Search, ShieldCheck, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([
    {
      id: "usr_001",
      email: "siddharth@studio.com",
      full_name: "Siddharth Mehta",
      company: "Studio Nova",
      plan: "Starter Plan (40 Leads)",
      quota_remaining: 33,
      quota_total: 40,
      active_claims: 2,
      is_suspended: false,
      joined_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "usr_002",
      email: "karan@agencypoint.in",
      full_name: "Karan Nair",
      company: "Agency Point",
      plan: "Growth Plan (100 Leads)",
      quota_remaining: 85,
      quota_total: 100,
      active_claims: 8,
      is_suspended: false,
      joined_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "usr_003",
      email: "rohit@spamventures.com",
      full_name: "Rohit Malhotra",
      company: "Cold Outreach Corp",
      plan: "None (Pre-subscription)",
      quota_remaining: 0,
      quota_total: 0,
      active_claims: 0,
      is_suspended: true,
      suspension_reason: "Reported for unsolicited spam violations.",
      joined_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleToggleSuspend = (id: string, currentlySuspended: boolean) => {
    const reason = currentlySuspended
      ? null
      : prompt("Enter administrative suspension reason:") || "Administrative hold";
    if (!currentlySuspended && !reason) return;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              is_suspended: !currentlySuspended,
              suspension_reason: reason,
            }
          : c
      )
    );
  };

  const filtered = customers.filter(
    (c) =>
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Customer Accounts & Quota Inspection"
        subtitle="View registered subscribers, quota ledgers, active claims, and manage account status"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="max-w-md">
          <Input
            placeholder="Search by customer name, email, or agency..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
          <table className="w-full text-left text-xs text-[#D0CBC1]">
            <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
              <tr>
                <th className="p-4 font-semibold">Customer & Agency</th>
                <th className="p-4 font-semibold">Active Plan</th>
                <th className="p-4 font-semibold">Remaining Quota</th>
                <th className="p-4 font-semibold">Active Claims</th>
                <th className="p-4 font-semibold">Account Status</th>
                <th className="p-4 font-semibold">Joined Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#161514]/40">
                  <td className="p-4">
                    <strong className="text-[#F3F0E8] block">{c.full_name}</strong>
                    <span className="text-[#A39E93] text-[11px] block">{c.email}</span>
                    <span className="text-[#FFAA3D] text-[10px] block">{c.company}</span>
                  </td>

                  <td className="p-4 text-[#F3F0E8]">{c.plan}</td>

                  <td className="p-4 font-technical">
                    <span className="text-[#34D399] font-bold">
                      {c.quota_remaining}
                    </span>{" "}
                    / {c.quota_total}
                  </td>

                  <td className="p-4 font-technical text-[#FFAA3D] font-bold">
                    {c.active_claims}
                  </td>

                  <td className="p-4">
                    {c.is_suspended ? (
                      <Badge variant="flame" size="sm">
                        Suspended
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        Active
                      </Badge>
                    )}
                  </td>

                  <td className="p-4 text-[#A39E93]">
                    {formatDate(c.joined_at)}
                  </td>

                  <td className="p-4 text-right">
                    <Button
                      variant={c.is_suspended ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => handleToggleSuspend(c.id, c.is_suspended)}
                      className="text-xs text-[#E84B2C] hover:text-[#F3F0E8]"
                    >
                      {c.is_suspended ? "Reinstate" : "Suspend"}
                    </Button>
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

