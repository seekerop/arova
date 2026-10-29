"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";
import { formatTimeRemainingText, formatDate } from "@/lib/utils";
import {
  Search,
  Clock,
  ShieldCheck,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  RefreshCw,
} from "lucide-react";

export default function MyLeadsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/leads");
      if (res.ok) {
        const data = await res.json();
        setLeadsList(data.leads || []);
      }
    } catch (err) {
      console.error("Failed to load customer leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      const res = await fetch("/api/leads/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId: id }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  const handleDecline = async (id: string) => {
    try {
      const res = await fetch("/api/leads/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId: id, reason: "Customer declined within 48h review window" }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error("Decline error:", err);
    }
  };

  const filteredLeads = leadsList.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      item.category?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "pending" && item.status === "pending") ||
      (selectedStatus === "accepted" && (item.status === "active" || item.status === "accepted")) ||
      (selectedStatus === "rejected" && item.status === "rejected") ||
      (selectedStatus === "expired" && item.status === "expired");

    const matchesSearch =
      !searchTerm ||
      (item.requirement && item.requirement.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.city && item.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (!item.is_locked && item.business_name && item.business_name.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="My Leads"
        subtitle="Manage delivered prospect offers, active claims, and contact disclosure"
        actions={
          <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <MandatoryDisclaimerBanner variant="short" />

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by city or project requirement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
            <Search className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
          </div>

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs"
          >
            <option value="all">All 5 Approved Categories</option>
            {APPROVED_CATEGORIES.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review (48h Window)</option>
            <option value="accepted">Claimed Exclusively (30 Days)</option>
            <option value="rejected">Declined</option>
            <option value="expired">Expired</option>
          </Select>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
          {loading ? (
            <div className="p-16 text-center text-xs text-[#A39E93] flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#FFAA3D]" />
              <span>Retrieving your lead pipeline...</span>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Lock className="w-10 h-10 text-[#A39E93] mx-auto opacity-40" />
              <h4 className="font-display text-base font-bold text-[#F3F0E8]">
                No Leads in Pipeline
              </h4>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                No leads matched your filter criteria or have been distributed yet. Leads are delivered steadily across your 30-day billing cycle.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-[#D0CBC1]">
              <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
                <tr>
                  <th className="p-4 font-semibold">Business Prospect</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Offer / Claim Status</th>
                  <th className="p-4 font-semibold">Window Remaining</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                {filteredLeads.map((item) => {
                  const isClaimed = !item.is_locked && (item.status === "active" || item.status === "accepted");
                  const deadlineInfo = item.response_deadline
                    ? formatTimeRemainingText(item.response_deadline)
                    : null;
                  const claimInfo = item.claim_expires_at
                    ? formatTimeRemainingText(item.claim_expires_at)
                    : null;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-[#161514]/40 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-start gap-2.5">
                          {isClaimed ? (
                            <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0 mt-0.5" />
                          ) : (
                            <Lock className="w-4 h-4 text-[#FFAA3D] shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-0.5">
                            {/* CRITICAL PRIVACY FIX: NEVER SHOW LEAD NAME WITHOUT BEING ACCEPTED */}
                            <span className="font-semibold text-[#F3F0E8] block">
                              {isClaimed
                                ? item.business_name
                                : `Commercial Prospect • ${item.category || item.city || 'Verified'}`}
                            </span>
                            <span className="text-[11px] text-[#A39E93] line-clamp-1 block max-w-md">
                              {isClaimed
                                ? item.contact_name
                                : item.requirement || "Business lead requirement preview"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" size="sm">
                          {item.category}
                        </Badge>
                      </td>
                      <td className="p-4 text-[#D0CBC1]">
                        {item.city}
                      </td>
                      <td className="p-4">
                        {isClaimed ? (
                          <Badge variant="success" size="sm">
                            Exclusively Claimed
                          </Badge>
                        ) : item.status === "pending" ? (
                          <Badge variant="warning" size="sm">
                            Pending Review
                          </Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">
                            {item.status}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 font-technical">
                        {isClaimed && claimInfo ? (
                          <span className="text-[#34D399]">
                            {claimInfo} remaining
                          </span>
                        ) : item.status === "pending" && deadlineInfo ? (
                          <span className="text-[#FFAA3D]">
                            {deadlineInfo} remaining
                          </span>
                        ) : (
                          <span className="text-[#A39E93]">—</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/leads/${item.leadId || item.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-[11px]">
                              View
                            </Button>
                          </Link>

                          {!isClaimed && item.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDecline(item.id)}
                                className="h-7 text-[11px] text-[#A39E93] hover:text-[#E84B2C]"
                              >
                                Decline
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAccept(item.id)}
                                className="h-7 text-[11px]"
                              >
                                Accept
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
