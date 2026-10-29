"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { MessageSquareWarning, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminFeedbackPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/feedback");
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.feedback || []);
      }
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleResolve = async (id: string) => {
    const notes = prompt("Enter administrative resolution notes (e.g. Replacement quota unit granted):") || "Replacement unit granted";
    try {
      const res = await fetch("/api/admin/feedback", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "resolved", resolutionNotes: notes }),
      });
      if (res.ok) {
        fetchFeedback();
      }
    } catch (err) {
      console.error("Resolve feedback error:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Quality Feedback & Lead Accuracy Disputes"
        subtitle="Process subscriber reports on inaccurate phone or email numbers with replacement quota credits"
        actions={
          <Button variant="outline" size="sm" onClick={fetchFeedback} disabled={loading}>
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
              <span>Loading quality feedback...</span>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <MessageSquareWarning className="w-10 h-10 text-[#A39E93] mx-auto opacity-40" />
              <h4 className="font-display text-base font-bold text-[#F3F0E8]">
                No Quality Reports Filed
              </h4>
              <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
                When subscribers report inaccurate phone or email contact info, their disputes will appear here for review and replacement credit.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161514] text-[#A39E93] border-b border-[rgba(243,240,232,0.08)]">
                  <tr>
                    <th className="p-4 font-medium">Customer / Lead</th>
                    <th className="p-4 font-medium">Issue Type</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Filed At</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-[#161514]/40 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-[#F3F0E8]">{c.customer_email || "Subscriber"}</div>
                        <div className="text-[11px] text-[#FFAA3D]">{c.business_name || "Lead"}</div>
                      </td>
                      <td className="p-4 font-technical text-[#E84B2C]">{c.issue_type}</td>
                      <td className="p-4 text-[#D0CBC1] max-w-xs truncate">{c.description}</td>
                      <td className="p-4">
                        <Badge variant={c.status === "resolved" ? "success" : "warning"} size="sm">
                          {c.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-[11px] text-[#A39E93]">{formatDate(c.created_at)}</td>
                      <td className="p-4 text-right">
                        {c.status === "pending" && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-[11px] h-7"
                            onClick={() => handleResolve(c.id)}
                          >
                            Resolve & Credit
                          </Button>
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
