"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  Target,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Flame,
  Plus,
  Clock,
  ArrowRight,
} from "lucide-react";
import { RedditOpportunity } from "@/lib/reddit/types";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";

export default function RedditOpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<RedditOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [highIntentOnly, setHighIntentOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  // Manual Ingest State
  const [isIngesting, setIsIngesting] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [manualCategory, setManualCategory] = useState("Programming & Software");
  const [manualCommunity, setManualCommunity] = useState("r/freelance");
  const [submittingIngest, setSubmittingIngest] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (highIntentOnly) params.set("is_high_intent", "true");

      const res = await fetch(`/api/admin/reddit/opportunities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data.opportunities || []);
      }
    } catch (err) {
      console.error("Failed to load opportunities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [categoryFilter, highIntentOnly]);

  const handleGenerateDraft = async (opp: RedditOpportunity) => {
    setGeneratingId(opp.id);
    try {
      const res = await fetch("/api/admin/reddit/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opportunityId: opp.id,
          category: opp.category,
          community_name: opp.community_name,
        }),
      });

      if (res.ok) {
        router.push("/admin/reddit/content");
      }
    } catch (err) {
      console.error("Draft generation error:", err);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingIngest(true);
    try {
      const res = await fetch("/api/admin/reddit/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manual_url: manualUrl,
          manual_title: manualTitle,
          manual_content: manualContent,
          category: manualCategory,
          community_name: manualCommunity,
        }),
      });

      if (res.ok) {
        setIsIngesting(false);
        setManualUrl("");
        setManualTitle("");
        setManualContent("");
        fetchOpportunities();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingIngest(false);
    }
  };

  const filtered = opportunities.filter((o) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.community_name.toLowerCase().includes(q) ||
        (o.content && o.content.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
            Discovered Reddit Opportunities
          </h1>
          <p className="text-xs text-[#A39E93] mt-1">
            Real-time discussions scored 0–100 by intent, pain point severity, and commercial fit for Arova services.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOpportunities}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsIngesting(!isIngesting)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {isIngesting ? "Cancel" : "Manual Thread Ingest"}
          </Button>
        </div>
      </div>

      {/* Manual Ingest Form Modal */}
      {isIngesting && (
        <Card className="p-5 bg-[#111110] border-[rgba(232,75,44,0.3)] space-y-4">
          <h3 className="font-display text-sm font-bold text-[#F3F0E8]">
            Ingest Reddit Thread or Custom Opportunity URL
          </h3>
          <form onSubmit={handleManualIngest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Reddit Thread URL *</label>
                <Input
                  type="url"
                  placeholder="https://reddit.com/r/freelance/comments/..."
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Subreddit *</label>
                <Input
                  type="text"
                  placeholder="r/freelance"
                  value={manualCommunity}
                  onChange={(e) => setManualCommunity(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Arova Service Category *</label>
                <Select
                  value={manualCategory}
                  onChange={(e) => setManualCategory(e.target.value)}
                  className="text-xs"
                >
                  {APPROVED_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Post Title *</label>
              <Input
                type="text"
                placeholder="e.g. Need Next.js agency to overhaul our checkout flow"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                className="text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-[#D0CBC1]">Post Body / Discussion Content</label>
              <Textarea
                rows={3}
                placeholder="Paste the author's question or requirements..."
                value={manualContent}
                onChange={(e) => setManualContent(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsIngesting(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={submittingIngest}>
                Score &amp; Ingest Opportunity
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#111110] rounded-lg border border-[rgba(243,240,232,0.06)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A39E93]" />
            <Input
              type="text"
              placeholder="Search discussions or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs pl-8 h-8"
            />
          </div>

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

          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#D0CBC1] select-none">
            <input
              type="checkbox"
              checked={highIntentOnly}
              onChange={(e) => setHighIntentOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-[#161514] border-[rgba(243,240,232,0.2)] text-[#E84B2C] focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#FFAA3D]" />
              High Intent Only (Score &ge; 65)
            </span>
          </label>
        </div>

        <span className="text-xs text-[#A39E93] font-technical">
          {filtered.length} opportunities detected
        </span>
      </div>

      {/* Opportunity Cards List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center text-xs text-[#A39E93] bg-[#111110]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E84B2C]" />
            Scanning Reddit communities and scoring conversations...
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[#A39E93] bg-[#111110]">
            No opportunities matching your criteria. Try adjusting filters or click &quot;Manual Thread Ingest&quot;.
          </Card>
        ) : (
          filtered.map((opp) => (
            <Card
              key={opp.id}
              className={`p-5 bg-[#111110] border transition-all ${
                opp.is_high_intent
                  ? "border-[rgba(232,75,44,0.35)] shadow-[0_0_20px_rgba(232,75,44,0.06)]"
                  : "border-[rgba(243,240,232,0.08)]"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[#FFAA3D]">
                      {opp.community_name}
                    </span>
                    <span className="text-[#A39E93] text-xs">•</span>
                    <span className="text-xs text-[#A39E93]">u/{opp.author}</span>
                    <Badge variant="outline" className="text-[10px] bg-[#161514] text-[#D0CBC1]">
                      {opp.category}
                    </Badge>

                    {opp.is_high_intent && (
                      <Badge variant="outline" className="text-[10px] bg-[rgba(232,75,44,0.15)] text-[#FFAA3D] border-[rgba(232,75,44,0.4)]">
                        <Flame className="w-2.5 h-2.5 mr-1" />
                        HIGH INTENT
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-display text-base font-bold text-[#F3F0E8] hover:text-[#FFAA3D] transition-colors">
                    <a href={opp.post_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                      {opp.title}
                      <ExternalLink className="w-3.5 h-3.5 text-[#A39E93]" />
                    </a>
                  </h3>

                  {opp.content && (
                    <p className="text-xs text-[#A39E93] line-clamp-2">
                      {opp.content}
                    </p>
                  )}

                  {/* Signals & Pain Points */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {opp.intent_signals?.map((sig, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#161514] text-[#34D399] border border-[#34D399]/20"
                      >
                        ✓ {sig}
                      </span>
                    ))}
                    {opp.pain_points?.map((pain, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#161514] text-amber-400 border border-amber-400/20"
                      >
                        ⚡ {pain}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Score & Action Column */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[rgba(243,240,232,0.06)]">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 md:justify-end">
                      <span className="text-[10px] text-[#A39E93] uppercase font-mono">Opportunity Score:</span>
                      <span className="text-lg font-bold font-technical text-[#F3F0E8]">
                        {opp.score}/100
                      </span>
                    </div>
                    <div className="text-[10px] text-[#A39E93]">
                      Intent: {opp.intent_score} • Urgency: {opp.urgency_score}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleGenerateDraft(opp)}
                    isLoading={generatingId === opp.id}
                    className="text-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Generate Draft
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

