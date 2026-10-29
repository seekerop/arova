"use client";

import { useState, useEffect } from "react";
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
  CheckCircle2,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function LeadRequestsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Website & E-commerce");
  const [requestedQuantity, setRequestedQuantity] = useState(5);
  const [locationPreference, setLocationPreference] = useState("Mumbai / Pune Region");
  const [requestNotes, setRequestNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requestsList, setRequestsList] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard/requests");
      if (res.ok) {
        const data = await res.json();
        setRequestsList(data.requests || []);
      }
    } catch (err) {
      console.error("Failed to load customer requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/dashboard/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: selectedCategory,
          quantity: requestedQuantity,
          locationPreference,
          notes: requestNotes,
        }),
      });

      if (res.ok) {
        setIsCreating(false);
        setRequestNotes("");
        fetchRequests();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Custom Lead Requests"
        subtitle="Request specialized lead allocations matched to your ideal customer profile and region"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchRequests} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreating(!isCreating)}
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {isCreating ? "Cancel" : "New Lead Request"}
            </Button>
          </div>
        }
      />

      <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto w-full">
        <MandatoryDisclaimerBanner variant="short" />

        {/* Creation Form */}
        {isCreating && (
          <Card className="p-6 bg-[#111110] border-[rgba(232,75,44,0.35)] space-y-4">
            <h3 className="font-display text-base font-bold text-[#F3F0E8]">
              Configure Sourced Lead Allocation Request
            </h3>
            <p className="text-xs text-[#A39E93]">
              Our operations team sources, verifies, and packages prospects strictly matching your selected category.
            </p>

            <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">
                    Approved Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="text-xs"
                  >
                    {APPROVED_CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">
                    Quantity
                  </label>
                  <Select
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(Number(e.target.value))}
                    className="text-xs font-technical"
                  >
                    <option value={3}>3 Leads</option>
                    <option value={5}>5 Leads</option>
                    <option value={10}>10 Leads</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">
                    Regional Preference
                  </label>
                  <Input
                    type="text"
                    value={locationPreference}
                    onChange={(e) => setLocationPreference(e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru, Delhi NCR"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">
                  Specific Requirements or Technology Focus
                </label>
                <Textarea
                  rows={3}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="e.g. Shopify 2.0 store migrations, B2B SaaS integrations..."
                  className="text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={submitting}
                >
                  Submit Allocation Request
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
            Your Active Lead Requests
          </h3>

          {loading ? (
            <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] text-center text-xs text-[#A39E93]">
              <RefreshCw className="w-5 h-5 animate-spin text-[#FFAA3D] mx-auto mb-2" />
              Loading your requests...
            </Card>
          ) : requestsList.length === 0 ? (
            <Card className="p-12 bg-[#111110] border-[rgba(243,240,232,0.08)] text-center space-y-3">
              <Send className="w-8 h-8 text-[#A39E93] mx-auto opacity-40" />
              <p className="text-xs font-medium text-[#F3F0E8]">No Custom Requests Submitted</p>
              <p className="text-[11px] text-[#A39E93] max-w-sm mx-auto">
                Need leads in a specific tech stack or metropolitan region? Click &quot;New Lead Request&quot; above.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {requestsList.map((req) => (
                <Card
                  key={req.id}
                  className="p-5 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm">{req.category_name}</Badge>
                        <Badge
                          variant={req.status === "Ready" ? "success" : "default"}
                          size="sm"
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <h4 className="font-display text-sm font-bold text-[#F3F0E8] pt-1">
                        Request for {req.requested_quantity} Leads
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#A39E93]">
                      Submitted {formatDate(req.created_at)}
                    </span>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-[#D0CBC1] bg-[#161514] p-3 rounded-[6px]">
                      {req.notes}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
