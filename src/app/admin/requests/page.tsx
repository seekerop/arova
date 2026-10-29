"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import {
  Inbox,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (err) {
      console.error("Update request status error:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Custom Lead Orders & Requests"
        subtitle="Review subscriber category requests and fulfill custom lead allocation batches"
        actions={
          <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
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
              <span>Loading custom requests from database...</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <Inbox className="w-10 h-10 text-[#A39E93] mx-auto opacity-40" />
              <h4 className="font-display text-base font-bold text-[#F3F0E8]">
                No Lead Requests Submitted Yet
              </h4>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                Subscribers can submit customized regional and domain batch requests from their dashboard. None have been logged in the database yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                  <tr>
                    <th className="p-4 font-medium">Request ID / Customer</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Requested Qty</th>
                    <th className="p-4 font-medium">Target Locations</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Submitted</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                  {requests.map((r) => (
                    <tr key={r.id} className="hover:bg-[#161514]/40 transition-colors">
                      <td className="p-4">
                        <span className="font-technical text-[#FFAA3D] block">{r.id.slice(0, 8)}...</span>
                        <span className="text-[11px] text-[#D0CBC1]">{r.user_email || "Customer"}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" size="sm">
                          {r.category_name}
                        </Badge>
                      </td>
                      <td className="p-4 font-technical font-semibold text-[#F3F0E8]">
                        {r.requested_quantity} leads
                      </td>
                      <td className="p-4 text-[#D0CBC1]">
                        {Array.isArray(r.target_locations) && r.target_locations.length > 0
                          ? r.target_locations.join(", ")
                          : "Pan-India"}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={
                            r.status === "Ready"
                              ? "success"
                              : r.status === "Preparing"
                              ? "warning"
                              : "default"
                          }
                          size="sm"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-[11px] text-[#A39E93]">
                        {formatDate(r.created_at)}
                      </td>
                      <td className="p-4 text-right">
                        {r.status !== "Ready" ? (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-[11px] h-7"
                            onClick={() => handleUpdateStatus(r.id, "Ready")}
                          >
                            Mark Ready
                          </Button>
                        ) : (
                          <Badge variant="success" size="sm">Fulfilled</Badge>
                        )}
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
