"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Send,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { RedditContentDraft, RedditPublishedPost } from "@/lib/reddit/types";

export default function RedditCalendarPage() {
  const [scheduled, setScheduled] = useState<RedditContentDraft[]>([]);
  const [published, setPublished] = useState<RedditPublishedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manual Publish Form Modal
  const [activePublishDraft, setActivePublishDraft] = useState<RedditContentDraft | null>(null);
  const [liveUrl, setLiveUrl] = useState("");
  const [livePostId, setLivePostId] = useState("");

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reddit/calendar");
      if (res.ok) {
        const data = await res.json();
        setScheduled(data.scheduled || []);
        setPublished(data.published || []);
      }
    } catch (err) {
      console.error("Failed to load calendar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, []);

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
        setLiveUrl("");
        setLivePostId("");
        await fetchCalendar();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
            Publishing Calendar &amp; Distribution Queue
          </h1>
          <p className="text-xs text-[#A39E93] mt-1">
            Pacing control and published archive. Posts are throttled to ensure zero AutoMod spam flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCalendar}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Calendar
          </Button>
        </div>
      </div>

      {/* Manual Publish Confirmation Modal */}
      {activePublishDraft && (
        <Card className="p-5 bg-[#111110] border-[rgba(232,75,44,0.35)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
              <Send className="w-4 h-4 text-[#FFAA3D]" />
              Confirm Manual Reddit Publication
            </h3>
            <Badge variant="outline" className="text-[10px] text-[#FFAA3D]">Manual Provider (Default)</Badge>
          </div>

          <p className="text-xs text-[#A39E93]">
            1. Copy the draft text below. 2. Post to <strong>{activePublishDraft.community_name}</strong>. 3. Paste the live Reddit URL to track upvotes, comments, and conversions.
          </p>

          <div className="p-3 bg-[#161514] rounded-lg border border-[rgba(243,240,232,0.06)] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-[#F3F0E8]">{activePublishDraft.title || "Comment Response"}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(activePublishDraft.body, "modal")}
                className="h-6 text-[10px]"
              >
                {copiedId === "modal" ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
                Copy Post Content
              </Button>
            </div>
            <p className="text-[11px] text-[#D0CBC1] line-clamp-3 font-mono">
              {activePublishDraft.body}
            </p>
          </div>

          <form onSubmit={handleConfirmPublish} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Live Reddit Post/Comment URL *</label>
                <Input
                  type="url"
                  placeholder="https://reddit.com/r/.../comments/..."
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Reddit Post/Comment ID (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. t3_1g8k9m"
                  value={livePostId}
                  onChange={(e) => setLivePostId(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setActivePublishDraft(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={publishingId === activePublishDraft.id}>
                Confirm Published &amp; Track
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Grid: Scheduled Queue vs Published Archive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scheduled / Ready Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-[#F3F0E8] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FFAA3D]" />
              Approved Queue &amp; Scheduled ({scheduled.length})
            </h3>
          </div>

          <div className="space-y-3">
            {scheduled.length === 0 ? (
              <Card className="p-8 text-center text-xs text-[#A39E93] bg-[#111110]">
                No drafts currently approved or scheduled. Review pending items in the Approvals queue.
              </Card>
            ) : (
              scheduled.map((draft) => (
                <Card key={draft.id} className="p-4 bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#FFAA3D]">
                        {draft.community_name}
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-[#161514]">
                        {draft.category}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {draft.draft_type.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActivePublishDraft(draft)}
                      className="h-7 text-[11px]"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Publish Now
                    </Button>
                  </div>

                  {draft.title && (
                    <h4 className="font-display text-xs font-bold text-[#F3F0E8]">
                      {draft.title}
                    </h4>
                  )}

                  <p className="text-xs text-[#A39E93] line-clamp-2">
                    {draft.body}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#A39E93] pt-1 border-t border-[rgba(243,240,232,0.04)]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {draft.scheduled_at
                        ? `Scheduled: ${new Date(draft.scheduled_at).toLocaleString()}`
                        : "Approved: Ready for manual publication"}
                    </span>
                    <span className="font-mono text-[#34D399]">Ready</span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Published Archive */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-[#F3F0E8] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
              Live Published Content ({published.length})
            </h3>
          </div>

          <div className="space-y-3">
            {published.length === 0 ? (
              <Card className="p-8 text-center text-xs text-[#A39E93] bg-[#111110]">
                No published posts recorded yet. Publish an approved draft from the left queue to begin tracking engagement.
              </Card>
            ) : (
              published.map((post) => (
                <Card key={post.id} className="p-4 bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-[#FFAA3D]">
                      {post.community_name}
                    </span>

                    <a
                      href={post.post_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#A39E93] hover:text-[#FFAA3D] flex items-center gap-1"
                    >
                      <span>View on Reddit</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {post.title && (
                    <h4 className="font-display text-xs font-bold text-[#F3F0E8]">
                      {post.title}
                    </h4>
                  )}

                  <p className="text-xs text-[#A39E93] line-clamp-2">
                    {post.body}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#A39E93] pt-2 border-t border-[rgba(243,240,232,0.04)]">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-[#F3F0E8] font-technical">
                        <ThumbsUp className="w-3 h-3 text-[#34D399]" />
                        {post.upvotes} upvotes
                      </span>
                      <span className="flex items-center gap-1 text-[#F3F0E8] font-technical">
                        <MessageSquare className="w-3 h-3 text-[#FFAA3D]" />
                        {post.comments_count} replies
                      </span>
                    </div>

                    <span className="font-mono text-[10px]">
                      {new Date(post.published_at).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

