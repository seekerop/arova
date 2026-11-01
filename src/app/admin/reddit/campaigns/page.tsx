"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select, Textarea } from "@/components/ui/input";
import {
  Compass,
  Plus,
  Play,
  RefreshCw,
  ExternalLink,
  FileText,
  Target,
  Globe,
  Sparkles,
  CheckCircle2,
  Trash2,
  Send,
  Flag,
} from "lucide-react";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";

const COMMON_COUNTRIES = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "Singapore",
  "United Arab Emirates",
  "Global",
];

export default function RedditCampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [runningId, setRunningId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [productBrief, setProductBrief] = useState("");
  const [targetCountry, setTargetCountry] = useState("India");
  const [targetCategory, setTargetCategory] = useState("Programming & Software");
  const [websiteUrl, setWebsiteUrl] = useState("https://arova.arenova.in");
  const [runImmediately, setRunImmediately] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reddit/campaigns");
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to load campaigns:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !productBrief.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/reddit/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name,
          product_brief: productBrief,
          target_country: targetCountry,
          target_category: targetCategory,
          website_url: websiteUrl,
          run_immediately: runImmediately,
        }),
      });

      if (res.ok) {
        setIsCreating(false);
        setName("");
        setProductBrief("");
        await fetchCampaigns();
      }
    } catch (err) {
      console.error("Create campaign error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunCampaign = async (campaignId: string) => {
    setRunningId(campaignId);
    try {
      const res = await fetch("/api/admin/reddit/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "run",
          campaignId,
        }),
      });

      if (res.ok) {
        await fetchCampaigns();
      }
    } catch (err) {
      console.error("Run campaign error:", err);
    } finally {
      setRunningId(null);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await fetch("/api/admin/reddit/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          campaignId,
        }),
      });
      await fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[rgba(243,240,232,0.08)]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-bold tracking-tight text-[#F3F0E8]">
              Reddit Growth Campaigns
            </h1>
            <Badge variant="outline" className="text-[10px] bg-[rgba(232,75,44,0.15)] text-[#FFAA3D] border-[rgba(232,75,44,0.3)]">
              Brief &amp; Geo-Targeted
            </Badge>
          </div>
          <p className="text-xs text-[#A39E93] mt-1">
            Specify your product brief and target country. The agent automatically discovers relevant discussions, scores buyer intent, and drafts contextual posts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCampaigns}
            disabled={loading}
            className="text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {isCreating ? "Cancel" : "New Campaign"}
          </Button>
        </div>
      </div>

      {/* Campaign Creation Card */}
      {isCreating && (
        <Card className="p-6 bg-[#111110] border-[rgba(232,75,44,0.35)] space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-[#F3F0E8] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#FFAA3D]" />
              Configure AI Reddit Campaign
            </h3>
            <span className="text-[10px] font-mono text-[#34D399]">
              Groq AI Enabled
            </span>
          </div>

          <form onSubmit={handleCreateCampaign} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Campaign Name *</label>
                <Input
                  type="text"
                  placeholder="e.g. Next.js SaaS MVP Outreach"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1] flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#FFAA3D]" />
                  Target Country / Region *
                </label>
                <Select
                  value={targetCountry}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="text-xs"
                >
                  {COMMON_COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Commercial Category *</label>
                <Select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
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
              <label className="text-xs font-medium text-[#D0CBC1] flex items-center justify-between">
                <span>Product Brief &amp; Value Proposition *</span>
                <span className="text-[10px] text-[#A39E93]">Explain what you do, who it solves for, and why it works</span>
              </label>
              <Textarea
                rows={4}
                placeholder="e.g. We are a specialized boutique software engineering studio in India building high-retention Next.js apps and AI workflow integrations. We replace sluggish agencies with 2-week sprint MVPs and fixed-price verified deliverables."
                value={productBrief}
                onChange={(e) => setProductBrief(e.target.value)}
                className="text-xs font-sans leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Destination URL (for Attribution Links)</label>
                <Input
                  type="url"
                  placeholder="https://arova.arenova.in"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="text-xs font-mono"
                />
              </div>

              <div className="pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#D0CBC1] select-none">
                  <input
                    type="checkbox"
                    checked={runImmediately}
                    onChange={(e) => setRunImmediately(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#161514] border-[rgba(243,240,232,0.2)] text-[#E84B2C] focus:ring-0"
                  />
                  <span>
                    <strong>Run immediately:</strong> Discover threads, score opportunities, and generate drafts right after creation.
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[rgba(243,240,232,0.06)]">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Launch Campaign
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center text-xs text-[#A39E93] bg-[#111110]">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#E84B2C]" />
            Loading growth campaigns...
          </Card>
        ) : campaigns.length === 0 ? (
          <Card className="p-12 text-center text-xs text-[#A39E93] bg-[#111110] space-y-3">
            <Compass className="w-8 h-8 text-[#FFAA3D] mx-auto opacity-75" />
            <div>
              <p className="text-sm font-semibold text-[#F3F0E8]">No active campaigns yet.</p>
              <p className="text-xs text-[#A39E93] max-w-md mx-auto mt-1">
                Create a campaign with your product brief and target country. The Groq agent will pinpoint relevant subreddits and start drafting high-intent responses.
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsCreating(true)} className="text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create First Campaign
            </Button>
          </Card>
        ) : (
          campaigns.map((c) => (
            <Card key={c.id} className="p-6 bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-4">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-bold text-[#F3F0E8]">
                      {c.name}
                    </span>

                    <Badge variant="outline" className="text-[10px] bg-[rgba(232,75,44,0.15)] text-[#FFAA3D] border-[rgba(232,75,44,0.3)]">
                      <Globe className="w-2.5 h-2.5 mr-1" />
                      {c.target_country || "India"}
                    </Badge>

                    <Badge variant="outline" className="text-[10px] bg-[#161514] text-[#D0CBC1]">
                      {c.target_category}
                    </Badge>

                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        c.status === "active"
                          ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {c.status.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-[#D0CBC1] leading-relaxed line-clamp-2 font-sans bg-[#161514] p-2.5 rounded-lg border border-[rgba(243,240,232,0.05)]">
                    <strong className="text-[#A39E93] block text-[10px] uppercase font-mono">Product Brief:</strong>
                    {c.product_brief}
                  </p>

                  {/* Target Communities Tags */}
                  {c.target_communities && c.target_communities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-[#A39E93] font-mono">Target Subreddits:</span>
                      {c.target_communities.map((sub: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161514] text-[#FFAA3D] border border-[rgba(243,240,232,0.08)]"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Metrics & Actions */}
                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[rgba(243,240,232,0.06)]">
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="text-[10px] text-[#A39E93] block font-mono">Threads</span>
                      <span className="text-sm font-bold font-technical text-[#F3F0E8]">
                        {c.opportunities_count || c.threads_found || 0}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#A39E93] block font-mono">Drafts</span>
                      <span className="text-sm font-bold font-technical text-[#FFAA3D]">
                        {c.drafts_count || 0}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#A39E93] block font-mono">Published</span>
                      <span className="text-sm font-bold font-technical text-[#34D399]">
                        {c.published_count || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRunCampaign(c.id)}
                      isLoading={runningId === c.id}
                      className="text-xs"
                    >
                      <Play className="w-3.5 h-3.5 mr-1" />
                      Run Agent
                    </Button>

                    <Link href={`/admin/reddit/content?category=${encodeURIComponent(c.target_category)}`}>
                      <Button variant="secondary" size="sm" className="text-xs">
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Drafts
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCampaign(c.id)}
                      className="h-8 text-[#A39E93] hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
