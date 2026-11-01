"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  FileText,
  Plus,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ExternalLink,
  Edit2,
  Send,
} from "lucide-react";
import { RedditContentDraft } from "@/lib/reddit/types";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";

export default function RedditContentPage() {
  const [drafts, setDrafts] = useState<RedditContentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit / Manual Generation Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editDraftId, setEditDraftId] = useState<string | null>(null);
  const [draftBody, setDraftBody] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftCommunity, setDraftCommunity] = useState("r/freelance");
  const [draftCategory, setDraftCategory] = useState("Programming & Software");
  const [draftType, setDraftType] = useState<any>("comment_reply");
  const [saving, setSaving] = useState(false);

  const fetchDrafts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (categoryFilter !== "All") params.set("category", categoryFilter);

      const res = await fetch(`/api/admin/reddit/content?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.drafts || []);
      }
    } catch (err) {
      console.error("Failed to load drafts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, [statusFilter, categoryFilter]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenEdit = (draft: RedditContentDraft) => {
    setEditDraftId(draft.id);
    setDraftTitle(draft.title || "");
    setDraftBody(draft.body);
    setDraftCommunity(draft.community_name);
    setDraftCategory(draft.category);
    setDraftType(draft.draft_type);
    setIsEditing(true);
  };

  const handleOpenNew = () => {
    setEditDraftId(null);
    setDraftTitle("");
    setDraftBody("");
    setDraftCommunity("r/freelance");
    setDraftCategory("Programming & Software");
    setDraftType("comment_reply");
    setIsEditing(true);
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editDraftId) {
        // Update existing
        await fetch("/api/admin/reddit/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update",
            id: editDraftId,
            title: draftTitle || null,
            body: draftBody,
            community_name: draftCommunity,
            category: draftCategory,
            draft_type: draftType,
          }),
        });
      } else {
        // Generate new
        await fetch("/api/admin/reddit/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: draftTitle,
            body: draftBody,
            community_name: draftCommunity,
            category: draftCategory,
            draft_type: draftType,
          }),
        });
      }

      setIsEditing(false);
      fetchDrafts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSendToApproval = async (draftId: string) => {
    try {
      await fetch("/api/admin/reddit/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: draftId,
          status: "pending_approval",
        }),
      });
      fetchDrafts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
            Reddit Content Drafts &amp; Campaigns
          </h1>
          <p className="text-xs text-[#A39E93] mt-1">
            Engineered comment responses, value-first technical breakdowns, and case studies prepared for community submission.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDrafts}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenNew}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Content Draft
          </Button>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isEditing && (
        <Card className="p-5 bg-[#111110] border-[rgba(232,75,44,0.3)] space-y-4">
          <h3 className="font-display text-sm font-bold text-[#F3F0E8]">
            {editDraftId ? "Edit Content Draft" : "Compose New Content Draft"}
          </h3>

          <form onSubmit={handleSaveDraft} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Subreddit *</label>
                <Input
                  type="text"
                  placeholder="r/freelance"
                  value={draftCommunity}
                  onChange={(e) => setDraftCommunity(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Category *</label>
                <Select
                  value={draftCategory}
                  onChange={(e) => setDraftCategory(e.target.value)}
                  className="text-xs"
                >
                  {APPROVED_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Draft Archetype *</label>
                <Select
                  value={draftType}
                  onChange={(e) => setDraftType(e.target.value)}
                  className="text-xs"
                >
                  <option value="comment_reply">Comment Reply (Direct Value)</option>
                  <option value="educational_post">Educational Post (Guide)</option>
                  <option value="case_study">Anonymized Case Study</option>
                  <option value="discussion_starter">Discussion Starter</option>
                </Select>
              </div>
            </div>

            {draftType !== "comment_reply" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Post Title</label>
                <Input
                  type="text"
                  placeholder="e.g. 3 practical optimizations for scaling dev deliverables..."
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  className="text-xs"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Content Body (Markdown formatted) *</label>
              <Textarea
                rows={8}
                placeholder="Write or review the value-first response..."
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                className="text-xs font-mono"
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                Save Draft
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#111110] rounded-lg border border-[rgba(243,240,232,0.06)]">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-8 w-44"
          >
            <option value="All">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </Select>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs h-8 w-48"
          >
            <option value="All">All Categories</option>
            {APPROVED_CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <span className="text-xs text-[#A39E93] font-technical">
          {drafts.length} content items
        </span>
      </div>

      {/* Drafts Cards */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center text-xs text-[#A39E93] bg-[#111110]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E84B2C]" />
            Loading content drafts...
          </Card>
        ) : drafts.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[#A39E93] bg-[#111110]">
            No drafts found. Ingest opportunities or click &quot;New Content Draft&quot; to generate content.
          </Card>
        ) : (
          drafts.map((draft) => (
            <Card key={draft.id} className="p-5 bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-4">
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
                      draft.status === "approved" || draft.status === "published"
                        ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
                        : draft.status === "pending_approval"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-[#161514] text-[#A39E93]"
                    }`}
                  >
                    {draft.status.replace(/_/g, " ").toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(draft.body, draft.id)}
                    className="h-7 text-[11px]"
                  >
                    {copiedId === draft.id ? (
                      <>
                        <Check className="w-3 h-3 mr-1 text-[#34D399]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Text
                      </>
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(draft)}
                    className="h-7 text-[11px]"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>

                  {draft.status === "draft" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSendToApproval(draft.id)}
                      className="h-7 text-[11px]"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Submit to Approval
                    </Button>
                  )}
                </div>
              </div>

              {draft.title && (
                <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
                  {draft.title}
                </h4>
              )}

              <div className="p-4 rounded-lg bg-[#161514] border border-[rgba(243,240,232,0.05)] text-xs text-[#D0CBC1] whitespace-pre-wrap font-sans leading-relaxed">
                {draft.body}
              </div>

              {/* Attribution and Compliance Footnote */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pt-2 text-[11px] text-[#A39E93]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                  <span>{draft.compliance_notes || "Verified against community spam policies."}</span>
                </div>

                {draft.attribution_link && (
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span>Attribution:</span>
                    <a
                      href={draft.attribution_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#FFAA3D] hover:underline truncate max-w-xs"
                    >
                      {draft.utm_campaign}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
