"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";
import { formatDate } from "@/lib/utils";
import {
  Send,
  Clock,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Eye,
  ShieldCheck,
} from "lucide-react";

export default function LeadRequestsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Website & E-commerce");
  const [requestedQuantity, setRequestedQuantity] = useState(5);
  const [locationPreference, setLocationPreference] = useState("Mumbai / Pune Region");
  const [requestNotes, setRequestNotes] = useState("Interested in Shopify and headless e-commerce store rebuilds.");
  const [submitting, setSubmitting] = useState(false);

  // Mock requests state
  const [requestsList, setRequestsList] = useState<any[]>([
    {
      id: "req_001",
      category: "Website & E-commerce",
      quantity: 5,
      location: "Mumbai / Pune Region",
      status: "Ready", // Ready to be unlocked upon subscription
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      prepared_items: [
        { id: "p1", city: "Mumbai", requirement: "Fashion D2C brand migrating from WooCommerce to Shopify Plus.", estimated: "₹3,50,000" },
        { id: "p2", city: "Pune", requirement: "Organic food retailer looking for custom subscription app integration.", estimated: "₹2,00,000" },
        { id: "p3", city: "Mumbai", requirement: "Jewelry e-commerce store redesign and mobile speed optimization.", estimated: "₹4,00,000" },
        { id: "p4", city: "Thane", requirement: "B2B wholesale portal with wholesale bulk order pricing tiers.", estimated: "₹5,00,000" },
        { id: "p5", city: "Navi Mumbai", requirement: "Cosmetics brand seeking headless Next.js frontend with Shopify backend.", estimated: "₹6,00,000" },
      ],
    },
    {
      id: "req_002",
      category: "Programming & Software",
      quantity: 3,
      location: "Bengaluru",
      status: "Preparing",
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      prepared_items: [],
    },
  ]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const newReq = {
        id: `req_${Date.now().toString().slice(-4)}`,
        category: selectedCategory,
        quantity: Number(requestedQuantity),
        location: locationPreference,
        status: "Submitted",
        created_at: new Date().toISOString(),
        prepared_items: [],
      };
      setRequestsList([newReq, ...requestsList]);
      setIsCreating(false);
      setSubmitting(false);
    }, 600);
  };

  const handleUnlockBatch = async (requestId: string) => {
    try {
      const res = await fetch("/api/leads/unlock-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        setRequestsList((prev) =>
          prev.map((r) => (r.id === requestId ? { ...r, status: "Unlocked" } : r))
        );
      }
    } catch (err) {
      console.error("Unlock error:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Pre-Subscription Lead Requests"
        subtitle="Request 1–9 customized preview leads before subscribing to a plan"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto w-full">
        <MandatoryDisclaimerBanner variant="short" />

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#F3F0E8]">
              Your Requested Lead Batches
            </h2>
            <p className="text-xs text-[#A39E93]">
              Batches are prepared by operators (typically within 1–2 hours). Locked preview available until subscription.
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreating(!isCreating)}
            className="text-xs gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Request New Batch (1–9 Leads)
          </Button>
        </div>

        {/* Create Request Form Card */}
        {isCreating && (
          <Card className="p-6 bg-[#161514] border-[rgba(232,75,44,0.35)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(243,240,232,0.06)]">
              <h3 className="font-display font-semibold text-sm text-[#F3F0E8]">
                Submit Custom Pre-Subscription Lead Request
              </h3>
              <span className="text-[11px] font-technical text-[#FFAA3D]">
                Limits: 1 to 9 leads
              </span>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">
                    Approved Service Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {APPROVED_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">
                    Quantity (1 to 9 Leads)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={9}
                    required
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">
                  Target Location / Regional Filter
                </label>
                <Input
                  type="text"
                  placeholder="E.g., Mumbai, Delhi NCR, Bengaluru, Hyderabad..."
                  value={locationPreference}
                  onChange={(e) => setLocationPreference(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">
                  Specific Project Requirement Notes
                </label>
                <Textarea
                  rows={3}
                  placeholder="Describe the exact commercial focus or requirements..."
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={submitting}
                >
                  Submit Request
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Requests List */}
        <div className="space-y-6">
          {requestsList.map((req) => (
            <Card
              key={req.id}
              className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-6"
            >
              {/* Batch Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[rgba(243,240,232,0.06)]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-technical text-xs font-semibold text-[#A39E93]">
                      #{req.id}
                    </span>
                    <Badge variant="category" size="sm">
                      {req.category}
                    </Badge>
                    <span className="text-xs font-technical text-[#F3F0E8]">
                      {req.quantity} Leads Requested
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A39E93]">
                    Target: {req.location} · Submitted {formatDate(req.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {req.status === "Ready" && (
                    <Badge variant="amber" size="md" className="gap-1">
                      <Lock className="w-3 h-3" />
                      Ready — Locked Until Subscription
                    </Badge>
                  )}
                  {req.status === "Preparing" && (
                    <Badge variant="copper" size="md" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Operator Preparing Leads
                    </Badge>
                  )}
                  {req.status === "Submitted" && (
                    <Badge variant="muted" size="md">
                      Submitted
                    </Badge>
                  )}
                  {req.status === "Unlocked" && (
                    <Badge variant="success" size="md" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Unlocked & Claimed
                    </Badge>
                  )}

                  {req.status === "Ready" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUnlockBatch(req.id)}
                      className="gap-1 text-xs"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      Unlock Batch (Charge {req.quantity} Quota)
                    </Button>
                  )}
                </div>
              </div>

              {/* Prepared Items Safe Preview */}
              {req.prepared_items.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-[#F3F0E8] uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#FFAA3D]" />
                    Prepared Leads Safe Preview ({req.prepared_items.length} records ready)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {req.prepared_items.map((item: any, i: number) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#FFAA3D]">
                            Lead 0{i + 1} · {item.city}
                          </span>
                          <span className="font-technical text-[10px] text-[#A39E93]">
                            Est: {item.estimated}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#D0CBC1] line-clamp-2 leading-relaxed">
                          {item.requirement}
                        </p>
                        <div className="pt-1 text-[10px] text-[#9E9B93] flex items-center gap-1">
                          <Lock className="w-3 h-3 text-[#C86938]" />
                          Contact details hidden until unlock
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-[8px] bg-[#161514] text-xs text-[#A39E93] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FFAA3D] shrink-0" />
                  <span>
                    Our lead researchers are curating matching prospects for this batch. Usually ready in approximately 1–2 hours.
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
