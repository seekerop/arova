"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import {
  Globe,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { RedditCommunity } from "@/lib/reddit/types";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";

export default function RedditCommunitiesPage() {
  const [communities, setCommunities] = useState<RedditCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newCategory, setNewCategory] = useState("Programming & Software");
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      if (statusFilter !== "All") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/reddit/communities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCommunities(data.communities || []);
      }
    } catch (err) {
      console.error("Failed to load communities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [categoryFilter, statusFilter]);

  const handleAddCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSaving(true);
    try {
      const cleanName = newName.startsWith("r/") ? newName : `r/${newName}`;
      const res = await fetch("/api/admin/reddit/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          display_name: newDisplayName || cleanName,
          category: newCategory,
          status: "eligible",
        }),
      });

      if (res.ok) {
        setIsAdding(false);
        setNewName("");
        setNewDisplayName("");
        fetchCommunities();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleRunDiscovery = async () => {
    setScanning(true);
    try {
      await fetch("/api/admin/reddit/agents/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discover_communities" }),
      });
      await fetchCommunities();
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const filtered = communities.filter((c) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.display_name.toLowerCase().includes(q) ||
        (c.rules_summary && c.rules_summary.toLowerCase().includes(q))
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
            Reddit Communities &amp; Rule Audits
          </h1>
          <p className="text-xs text-[#A39E93] mt-1">
            Target subreddits across Arova&apos;s 5 commercial categories with indexed AutoMod rules and eligibility scores.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunDiscovery}
            isLoading={scanning}
            className="text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Discover New Subreddits
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {isAdding ? "Cancel" : "Add Subreddit"}
          </Button>
        </div>
      </div>

      {/* Add Subreddit Form Modal */}
      {isAdding && (
        <Card className="p-5 bg-[#111110] border-[rgba(232,75,44,0.3)] space-y-4">
          <h3 className="font-display text-sm font-bold text-[#F3F0E8]">
            Add Target Subreddit for Outreach Tracking
          </h3>
          <form onSubmit={handleAddCommunity} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Subreddit Name *</label>
                <Input
                  type="text"
                  placeholder="e.g. r/nextjs"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Display Title</label>
                <Input
                  type="text"
                  placeholder="e.g. Next.js Developers"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[#D0CBC1]">Arova Commercial Domain *</label>
                <Select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={saving}>
                Save Subreddit
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
              placeholder="Search subreddits or rules..."
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

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs h-8 w-36"
          >
            <option value="All">All Statuses</option>
            <option value="eligible">Eligible</option>
            <option value="restricted">Restricted</option>
            <option value="blocked">Blocked</option>
          </Select>
        </div>

        <span className="text-xs text-[#A39E93] font-technical">
          Showing {filtered.length} of {communities.length} communities
        </span>
      </div>

      {/* Communities Table */}
      <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#A39E93] uppercase font-mono text-[10px]">
                <th className="py-3 px-4">Community</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Subscribers</th>
                <th className="py-3 px-4">Community Rules &amp; Policy</th>
                <th className="py-3 px-4">Relevance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(243,240,232,0.05)] text-[#D0CBC1]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#A39E93]">
                    <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-2 text-[#E84B2C]" />
                    Loading community registry...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-[#A39E93]">
                    No matching subreddits found.
                  </td>
                </tr>
              ) : (
                filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-[#161514]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#F3F0E8] font-mono">
                          {sub.name}
                        </span>
                        <a
                          href={`https://reddit.com/${sub.name}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#A39E93] hover:text-[#FFAA3D]"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <span className="text-[10px] text-[#A39E93] block">
                        {sub.display_name}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] bg-[#161514] text-[#D0CBC1]">
                        {sub.category}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-technical text-[#F3F0E8]">
                      {(sub.subscribers || 0).toLocaleString()}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-[11px] text-[#A39E93] line-clamp-2">
                        {sub.rules_summary || "Standard Reddit spam and community conduct rules."}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px]">
                        <span className="flex items-center gap-1 text-[#A39E93]">
                          Promo: {sub.self_promotion_allowed ? (
                            <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                          ) : (
                            <XCircle className="w-3 h-3 text-amber-500" />
                          )}
                        </span>
                        <span className="flex items-center gap-1 text-[#A39E93]">
                          Links: {sub.link_posting_allowed ? (
                            <CheckCircle2 className="w-3 h-3 text-[#34D399]" />
                          ) : (
                            <XCircle className="w-3 h-3 text-amber-500" />
                          )}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-technical text-[#FFAA3D]">
                      {Math.round((sub.relevance_score || 0.9) * 100)}%
                    </td>

                    <td className="py-3 px-4">
                      <Badge
                        variant={sub.status === "eligible" ? "outline" : "secondary"}
                        className={`text-[10px] ${
                          sub.status === "eligible"
                            ? "bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {sub.status.toUpperCase()}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <a
                        href={`https://reddit.com/${sub.name}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button variant="ghost" size="sm" className="h-7 text-[11px]">
                          Open Reddit
                        </Button>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
