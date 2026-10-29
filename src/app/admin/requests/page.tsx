"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([
    {
      id: "req_001",
      customer_email: "siddharth@studio.com",
      category: "Website & E-commerce",
      quantity: 5,
      location: "Mumbai / Pune Region",
      status: "Ready",
      notes: "Shopify stores and D2C brands.",
      assigned_leads_count: 5,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "req_002",
      customer_email: "karan@agencypoint.in",
      category: "Programming & Software",
      quantity: 3,
      location: "Bengaluru",
      status: "Preparing",
      notes: "Looking for SaaS and API integration work.",
      assigned_leads_count: 0,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "req_003",
      customer_email: "priya@visualmotion.tv",
      category: "Video Editing & Production",
      quantity: 4,
      location: "Delhi NCR",
      status: "Submitted",
      notes: "Commercial YouTube channels and reels.",
      assigned_leads_count: 0,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ]);

  const handleMarkReady = (id: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Ready", assigned_leads_count: r.quantity } : r
      )
    );
  };

  const handleReject = (id: string) => {
    const reason = prompt("Enter administrative rejection reason:") || "Insufficient matching inventory";
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected", rejection_reason: reason } : r))
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Pre-Subscription Lead Requests"
        subtitle="Review prospective customer requests (1-9 leads), assign inventory, and mark ready"
      />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
          <table className="w-full text-left text-xs text-[#D0CBC1]">
            <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
              <tr>
                <th className="p-4 font-semibold">Request ID & Customer</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Qty</th>
                <th className="p-4 font-semibold">Location / Notes</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Assigned</th>
                <th className="p-4 font-semibold text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-[#161514]/40">
                  <td className="p-4">
                    <span className="font-technical text-[10px] text-[#A39E93] block">
                      #{r.id}
                    </span>
                    <strong className="text-[#F3F0E8]">{r.customer_email}</strong>
                    <span className="text-[10px] text-[#9E9B93] block">
                      {formatDate(r.created_at)}
                    </span>
                  </td>

                  <td className="p-4">
                    <Badge variant="category" size="sm">
                      {r.category}
                    </Badge>
                  </td>

                  <td className="p-4 font-technical font-bold text-[#FFAA3D]">
                    {r.quantity}
                  </td>

                  <td className="p-4">
                    <span className="text-[#F3F0E8] block">{r.location}</span>
                    <span className="text-[11px] text-[#A39E93] line-clamp-1">
                      {r.notes}
                    </span>
                  </td>

                  <td className="p-4">
                    {r.status === "Ready" && (
                      <Badge variant="success" size="sm">Ready (Locked)</Badge>
                    )}
                    {r.status === "Preparing" && (
                      <Badge variant="amber" size="sm">Preparing</Badge>
                    )}
                    {r.status === "Submitted" && (
                      <Badge variant="muted" size="sm">Submitted</Badge>
                    )}
                    {r.status === "Rejected" && (
                      <Badge variant="muted" size="sm">Rejected</Badge>
                    )}
                  </td>

                  <td className="p-4 font-technical">
                    {r.assigned_leads_count} / {r.quantity}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {r.status !== "Ready" && r.status !== "Rejected" && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleMarkReady(r.id)}
                            className="text-xs text-[#34D399]"
                          >
                            Mark Ready
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(r.id)}
                            className="text-xs text-[#E84B2C]"
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
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
