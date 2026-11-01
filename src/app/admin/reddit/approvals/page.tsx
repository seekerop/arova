"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/input";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sparkles,
} from "lucide-react";
import { RedditApproval } from "@/lib/reddit/types";

export default function RedditApprovalsPage() {
  const [approvals, setApprovals] = useState<RedditApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reddit/approvals?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(data.approvals || []);
      }
    } catch (err) {
      console.error("Failed to load approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  const handleReview = async (approvalId: string, action: "approved" | "rejected" | "revision_requested") => {
    setActionLoading(approvalId);
    try {
      const res = await fetch("/api/admin/reddit/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          action,
          notes: rejectionNotes[approvalId] || undefined,
        }),
      });

      if (res.ok) {
        await fetchApprovals();
      }
    } catch (err) {
      console.error("Review error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
            Content Approval Queue
          </h1>
          <p className="text-xs text-[#A39E93] mt-1">
            Human-in-the-loop review safeguard. No content is published without verified compliance and explicit approval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchApprovals}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(243,240,232,0.06)] pb-2 text-xs">
        <button
          onClick={() => setStatusFilter("pending")}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            statusFilter === "pending"
              ? "bg-[#161514] text-[#FFAA3D] border border-[rgba(232,75,44,0.3)]"
              : "text-[#A39E93] hover:text-[#F3F0E8]"
          }`}
        >
          Pending Review
        </button>
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            statusFilter === "approved"
              ? "bg-[#161514] text-[#34D399] border border-[#34D399]/30"
              : "text-[#A39E93] hover:text-[#F3F0E8]"
          }`}
        >
          Approved History
        </button>
        <button
          onClick={() => setStatusFilter("rejected")}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            statusFilter === "rejected"
              ? "bg-[#161514] text-rose-400 border border-rose-400/30"
              : "text-[#A39E93] hover:text-[#F3F0E8]"
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setStatusFilter("All")}
          className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
            statusFilter === "All"
              ? "bg-[#161514] text-[#F3F0E8] border border-[rgba(243,240,232,0.2)]"
              : "text-[#A39E93] hover:text-[#F3F0E8]"
          }`}
        >
          All Items
        </button>
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center text-xs text-[#A39E93] bg-[#111110]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E84B2C]" />
            Loading approval queue...
          </Card>
        ) : approvals.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[#A39E93] bg-[#111110]">
            <CheckCircle2 className="w-6 h-6 text-[#34D399] mx-auto mb-2" />
            No content pending review in this status. All items processed!
          </Card>
        ) : (
          approvals.map((app) => {
            const draft = app.draft;
            if (!draft) return null;

            return (
              <Card key={app.id} className="p-5 bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-[rgba(243,240,232,0.05)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[#FFAA3D]">
                      {draft.community_name}
                    </span>
                    <Badge variant="outline" className="text-[10px] bg-[#161514] text-[#D0CBC1]">
                      {draft.category}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {draft.draft_type.replace(/_/g, " ").toUpperCase()}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        app.status === "approved"
                          ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
                          : app.status === "rejected"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {app.status.toUpperCase()}
                    </Badge>
                  </div>

                  <span className="text-[11px] text-[#A39E93] font-mono">
                    Submitted: {new Date(app.created_at).toLocaleString()}
                  </span>
                </div>

                {draft.title && (
                  <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
                    {draft.title}
                  </h4>
                )}

                <div className="p-4 rounded-lg bg-[#161514] border border-[rgba(243,240,232,0.05)] text-xs text-[#D0CBC1] whitespace-pre-wrap font-sans leading-relaxed">
                  {draft.body}
                </div>

                {/* Compliance Audit & Tracking */}
                <div className="p-3 rounded-lg bg-[#0D0D0C] border border-[rgba(243,240,232,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                    <span className="text-[#A39E93]">
                      Compliance Check: <strong className="text-[#F3F0E8]">{draft.compliance_notes || "Passed"}</strong>
                    </span>
                  </div>

                  {draft.attribution_link && (
                    <a
                      href={draft.attribution_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#FFAA3D] hover:underline flex items-center gap-1 font-mono truncate max-w-sm"
                    >
                      <span>Campaign: {draft.utm_campaign}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Review Actions Bar */}
                {app.status === "pending" && (
                  <div className="pt-3 border-t border-[rgba(243,240,232,0.06)] flex flex-col md:flex-row items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Optional feedback / reviewer notes..."
                      value={rejectionNotes[app.id] || ""}
                      onChange={(e) => setRejectionNotes({ ...rejectionNotes, [app.id]: e.target.value })}
                      className="w-full md:w-96 text-xs px-3 py-1.5 rounded-lg bg-[#161514] border border-[rgba(243,240,232,0.1)] text-[#F3F0E8] focus:outline-none focus:border-[#E84B2C]"
                    />

                    <div className="flex items-center gap-2 self-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(app.id, "revision_requested")}
                        isLoading={actionLoading === app.id}
                        className="text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Revise
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReview(app.id, "rejected")}
                        isLoading={actionLoading === app.id}
                        className="text-xs text-rose-400 hover:text-rose-300"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        Reject
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleReview(app.id, "approved")}
                        isLoading={actionLoading === app.id}
                        className="text-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#34D399]" />
                        Approve Content
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
