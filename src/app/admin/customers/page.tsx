"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { Users, Search, RefreshCw, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function AdminCustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleSuspend = async (customer: any) => {
    const nextState = !customer.is_suspended;
    const reason = nextState
      ? prompt("Enter administrative reason for suspension:") || "Account suspended by administrator"
      : null;

    try {
      const res = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: customer.id,
          isSuspended: nextState,
          suspensionReason: reason,
        }),
      });
      if (res.ok) {
        fetchCustomers();
      }
    } catch (err) {
      console.error("Suspension toggle error:", err);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.company_name && c.company_name.toLowerCase().includes(q)) ||
      (c.full_name && c.full_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Customer Account Governance"
        subtitle="Manage subscriber profiles, quota allocations, and compliance enforcement"
        actions={
          <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Search */}
        <div className="p-4 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Input
              type="text"
              placeholder="Search by customer email or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
            <Search className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Customer Accounts Table */}
        <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#A39E93] flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#FFAA3D]" />
              <span>Loading customer records from database...</span>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Users className="w-10 h-10 text-[#A39E93] mx-auto opacity-40" />
              <h4 className="font-display text-base font-bold text-[#F3F0E8]">
                No Registered Customers Found
              </h4>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                Users will appear here as they register and subscribe to Arova lead allocation plans.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                  <tr>
                    <th className="p-4 font-medium">Customer / Company</th>
                    <th className="p-4 font-medium">Subscription Plan</th>
                    <th className="p-4 font-medium">Quota Status</th>
                    <th className="p-4 font-medium">Active Claims</th>
                    <th className="p-4 font-medium">Account Status</th>
                    <th className="p-4 font-medium">Registered</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                  {filteredCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-[#161514]/40 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-[#F3F0E8]">{c.email}</div>
                        <div className="text-[11px] text-[#A39E93]">
                          {c.company_name || c.full_name || "Individual Subscriber"}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={c.plan_code ? "success" : "secondary"}
                          size="sm"
                          className="capitalize"
                        >
                          {c.plan_code ? `${c.plan_code} Plan` : "Unsubscribed"}
                        </Badge>
                      </td>
                      <td className="p-4 font-technical">
                        {c.total_allocation ? (
                          <span className="text-[#34D399]">
                            {c.remaining_quota || 0} / {c.total_allocation} remaining
                          </span>
                        ) : (
                          <span className="text-[#A39E93]">0 / 0</span>
                        )}
                      </td>
                      <td className="p-4 font-technical text-[#F3F0E8]">
                        {c.active_claims_count || 0} claimed
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={c.is_suspended ? "destructive" : "success"}
                          size="sm"
                        >
                          {c.is_suspended ? "Suspended" : "Active"}
                        </Badge>
                      </td>
                      <td className="p-4 text-[11px] text-[#A39E93]">
                        {formatDate(c.created_at)}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleSuspend(c)}
                          className={
                            c.is_suspended
                              ? "text-[#34D399] hover:bg-[#34D399]/10 text-[11px]"
                              : "text-[#E84B2C] hover:bg-[#E84B2C]/10 text-[11px]"
                          }
                        >
                          {c.is_suspended ? "Reinstate" : "Suspend"}
                        </Button>
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
