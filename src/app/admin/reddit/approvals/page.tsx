"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Send,
  Copy,
  Check,
  Calendar,
  Sparkles,
} from "lucide-react";
import { RedditApproval } from "@/lib/reddit/types";

export default function RedditApprovalsPage() {
  const [approvals, setApprovals] = useState<RedditApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState<Record<string, string>>({});

  // Post-Approval Publishing Modal State
  const [activePublishDraft, setActivePublishDraft] = useState<any | null>(null);
  const [liveUrl, setLiveUrl] = useState("");
  const [livePostId, setLivePostId] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scheduling Modal State
  const [activeScheduleDraft, setActiveScheduleDraft] = useState<any | null>(null);
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  // Success Feedback
  const [approvedSuccessDraft, setApprovedSuccessDraft] = useState<any | null>(null);

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
      const targetApp = approvals.find((a) => a.id === approvalId);
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
        if (action === "approved" && targetApp?.draft) {
          setApprovedSuccessDraft(targetApp.draft);
        }
        await fetchApprovals();
      }
    } catch (err) {
      console.error("Review error:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePublishDraft) return;

    setPublishingId(activePublishDraft.id);
    try {
      const res = await fetch("/api/admin/reddit/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId: activePublishDraft.id,
          community_name: activePublishDraft.community_name,
          title: activePublishDraft.title,
          content: activePublishDraft.body,
          post_url: liveUrl || `https://reddit.com/${activePublishDraft.community_name}`,
          post_id: livePostId || `post_${Date.now()}`,
          mode: "manual",
        }),
      });

      if (res.ok) {
        setActivePublishDraft(null);
        setApprovedSuccessDraft(null);
        setLiveUrl("");
        setLivePostId("");
        await fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleConfirmSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScheduleDraft || !scheduledDateTime) return;

    setSchedulingLoading(true);
    try {
      const res = await fetch("/api/admin/reddit/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId: activeScheduleDraft.id,
          scheduledAt: new Date(scheduledDateTime).toISOString(),
        }),
      });

      if (res.ok) {
        setActiveScheduleDraft(null);
        setApprovedSuccessDraft(null);
        setScheduledDateTime("");
        await fetchApprovals();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSchedulingLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
            Content Approval Queue &amp; Distribution Gate
          </h1>
          <p className="text-xs text-[#A39E93] mt-1">
            Human-in-the-loop review safeguard. No content is posted to Reddit without verified compliance and your explicit sign-off.
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

      {/* Workflow Explainer Banner */}
      <div className="p-3.5 bg-[#111110] border border-[rgba(243,240,232,0.08)] rounded-lg text-xs space-y-2">
        <span className="font-semibold text-[#FFAA3D] uppercase text-[10px] tracking-wider block">
          Lifecycle Workflow:
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#D0CBC1]">
          <span className="px-2 py-0.5 rounded bg-[#161514] border border-[rgba(243,240,232,0.1)]">1. AI Draft Generated</span>
          <span className="text-[#A39E93]">➔</span>
          <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">2. Pending Review (You Are Here)</span>
          <span className="text-[#A39E93]">➔</span>
          <span className="px-2 py-0.5 rounded bg-[#34D399]/10 border border-[#34D399]/30 text-[#34D399]">3. Approved</span>
          <span className="text-[#A39E93]">➔</span>
          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-300">4. Publish Now (Copy &amp; Post) or Schedule</span>
        </div>
      </div>

      {/* Post-Approval Immediate Action Banner */}
      {approvedSuccessDraft && (
        <Card className="p-4 bg-[#34D399]/10 border border-[#34D399]/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#34D399]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Draft Approved! What would you like to do next with this content?</span>
            </div>
            <button
              onClick={() => setApprovedSuccessDraft(null)}
              className="text-xs text-[#34D399] opacity-75 hover:opacity-100"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-[#D0CBC1]">
            Content for <strong>{approvedSuccessDraft.community_name}</strong> is verified and moved to the Approved queue.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActivePublishDraft(approvedSuccessDraft)}
              className="text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Publish Now (Copy &amp; Track)
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveScheduleDraft(approvedSuccessDraft)}
              className="text-xs"
            >
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Schedule for Later
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("approved");
                setApprovedSuccessDraft(null);
              }}
              className="text-xs text-[#A39E93]"
            >
              View in Approved History →
            </Button>
          </div>
        </Card>
      )}

      {/* Publish Now Modal */}
      {activePublishDraft && (
        <Card className="p-5 bg-[#111110] border-[rgba(232,75,44,0.35)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#FFAA3D]" />
              Publish to Reddit: {activePublishDraft.community_name}
            </h3>
            <Badge variant="outline" className="text-[10px] text-[#34D399]">Approved Draft</Badge>
          </div>

          <div className="p-3 bg-[#161514] rounded-lg border border-[rgba(243,240,232,0.06)] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#F3F0E8]">
                {activePublishDraft.title || "Contextual Response Draft"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(activePublishDraft.body, "publish_modal")}
                className="h-6 text-[10px]"
              >
                {copiedId === "publish_modal" ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
                Copy Draft Body
              </Button>
            </div>
            <p className="text-[11px] text-[#D0CBC1] line-clamp-3 font-mono">
              {activePublishDraft.body}
            </p>
          </div>

          <form onSubmit={handleConfirmPublish} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Live Reddit Comment or Post URL *
              </label>
              <Input
                type="url"
                placeholder="https://reddit.com/r/.../comments/..."
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                className="text-xs font-mono"
                required
              />
              <p className="text-[10px] text-[#A39E93]">
                Paste the URL after submitting to Reddit. Arova will monitor upvotes, replies, and conversions.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActivePublishDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={publishingId === activePublishDraft.id}>
                Confirm Published &amp; Start Tracking
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Schedule Modal */}
      {activeScheduleDraft && (
        <Card className="p-5 bg-[#111110] border-[rgba(232,75,44,0.35)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FFAA3D]" />
              Schedule Approved Content
            </h3>
          </div>

          <form onSubmit={handleConfirmSchedule} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Publication Date &amp; Time *</label>
              <Input
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="text-xs font-mono"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActiveScheduleDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={schedulingLoading}>
                Schedule Post
              </Button>
            </div>
          </form>
        </Card>
      )}

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
          Approved History (Ready to Publish)
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
            {statusFilter === "pending"
              ? "All pending drafts have been reviewed! New drafts generated by the agent will appear here."
              : `No content records found in ${statusFilter} status.`}
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

                {/* Actions for Pending Review */}
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

                {/* Actions for Approved History */}
                {app.status === "approved" && (
                  <div className="pt-3 border-t border-[rgba(243,240,232,0.06)] flex items-center justify-between">
                    <span className="text-xs text-[#34D399] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved and verified. Ready for manual posting or scheduling.
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveScheduleDraft(draft)}
                        className="text-xs"
                      >
                        <Calendar className="w-3.5 h-3.5 mr-1 text-[#FFAA3D]" />
                        Schedule
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setActivePublishDraft(draft)}
                        className="text-xs"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Publish Now (Copy &amp; Post)
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
