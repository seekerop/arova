"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, Textarea } from "@/components/ui/input";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import {
  ShieldCheck,
  Clock,
  Lock,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<any | null>(null);
  const [isClaimed, setIsClaimed] = useState(false);
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [claimInfo, setClaimInfo] = useState<any | null>(null);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [issueType, setIssueType] = useState("inaccurate_phone");
  const [issueDescription, setIssueDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLead = async () => {
    if (!leadId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard/leads/${leadId}`);
      if (res.ok) {
        const data = await res.json();
        setLead(data.lead);
        setIsClaimed(Boolean(data.isClaimed));
        setDeliveryId(data.deliveryId);
        if (data.isClaimed) {
          setClaimInfo({
            claimed_at: data.claimed_at,
            expires_at: data.expires_at,
          });
        }
      } else {
        setLead(null);
      }
    } catch (err) {
      console.error("Failed to load lead details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [leadId]);

  const handleAcceptOffer = async () => {
    if (!deliveryId) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/leads/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId }),
      });
      if (res.ok) {
        fetchLead();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOffer = async () => {
    if (!deliveryId) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/leads/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId, reason: "Customer declined lead from detail view" }),
      });
      if (res.ok) {
        router.push("/dashboard/leads");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          issueType,
          description: issueDescription,
        }),
      });
      if (res.ok) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setReportModalOpen(false);
          setIssueDescription("");
        }, 1500);
      }
    } catch (err) {
      console.error("Feedback error:", err);
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-12 items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#FFAA3D] mb-3" />
        <p className="text-xs text-[#A39E93]">Retrieving verified prospect dossier...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex-1 flex flex-col p-12 items-center justify-center space-y-4">
        <Lock className="w-10 h-10 text-[#A39E93] opacity-40" />
        <h3 className="font-display text-lg font-bold text-[#F3F0E8]">Lead Not Found</h3>
        <p className="text-xs text-[#A39E93]">This lead does not exist in your pipeline or is no longer available.</p>
        <Link href="/dashboard/leads">
          <Button variant="outline" size="sm">
            &larr; Back to Leads
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title={isClaimed ? lead.business_name : "Confidential Commercial Prospect"}
        subtitle={`Verified Lead ID: ${lead.id.slice(0, 8)}...`}
        actions={
          <Link href="/dashboard/leads">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Leads
            </Button>
          </Link>
        }
      />

      <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* Status Alert Banner */}
        {isClaimed ? (
          <div className="p-4 rounded-[10px] bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.3)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#34D399] shrink-0" />
              <div>
                <span className="font-medium text-xs text-[#34D399] block">
                  30-Day Exclusive Claim Active
                </span>
                <span className="text-[11px] text-[#A39E93]">
                  Contact details unlocked exclusively for your outreach.
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReportModalOpen(true)}
              className="text-[#E84B2C] border-[rgba(232,75,44,0.3)] hover:bg-[rgba(232,75,44,0.1)] text-[11px]"
            >
              Report Contact Inaccuracy
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-[10px] bg-[rgba(255,170,61,0.08)] border border-[rgba(255,170,61,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#FFAA3D] shrink-0" />
              <div>
                <span className="font-medium text-xs text-[#FFAA3D] block">
                  Lead Offer Pending Your Review (48h Window)
                </span>
                <span className="text-[11px] text-[#A39E93]">
                  Review requirement below. Accept to consume 1 quota unit and unlock full company & contact details.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeclineOffer}
                isLoading={actionLoading}
                className="text-[#A39E93] hover:text-[#E84B2C]"
              >
                Decline Offer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAcceptOffer}
                isLoading={actionLoading}
              >
                Accept & Claim Lead
              </Button>
            </div>
          </div>
        )}

        {/* Lead Summary Overview */}
        <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(243,240,232,0.06)]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" size="sm">
                  {lead.category_name}
                </Badge>
                {isClaimed ? (
                  <Badge variant="success" size="sm">Exclusively Claimed</Badge>
                ) : (
                  <Badge variant="warning" size="sm">Pending Offer</Badge>
                )}
              </div>
              <h2 className="font-display text-2xl font-bold text-[#F3F0E8] mt-1">
                {isClaimed ? lead.business_name : `Commercial Prospect (${lead.city || 'Verified'})`}
              </h2>
              <div className="flex items-center gap-4 text-xs text-[#A39E93] pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FFAA3D]" />
                  {lead.city}{lead.state ? `, ${lead.state}` : ""}
                </span>
                {lead.business_type && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#FFAA3D]" />
                    {lead.business_type}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#FFAA3D]" />
                  Verified: {lead.verification_date || lead.collection_date || "Recent"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#A39E93] block">Estimated Project Value</span>
              <span className="font-technical text-2xl font-bold text-[#FFAA3D]">
                {lead.estimated_value_inr || "₹2,50,000"}
              </span>
            </div>
          </div>

          {/* Business Requirement */}
          <div className="space-y-2">
            <h3 className="font-technical text-xs font-semibold text-[#FFAA3D] uppercase tracking-wider">
              Business Requirement & Scope
            </h3>
            <p className="text-sm text-[#D0CBC1] leading-relaxed p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.04)]">
              {lead.generalized_requirement}
            </p>
          </div>

          {/* Contact Details (Privacy Enforced) */}
          <div className="space-y-3">
            <h3 className="font-technical text-xs font-semibold text-[#E84B2C] uppercase tracking-wider">
              Contact Details & Provenance
            </h3>

            {isClaimed ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(52,211,153,0.3)] space-y-2">
                  <span className="text-[11px] text-[#A39E93] block">Primary Decision Maker</span>
                  <div className="font-medium text-sm text-[#F3F0E8]">{lead.contact_name}</div>
                  <div className="flex items-center gap-2 text-xs font-technical text-[#FFAA3D]">
                    <Phone className="w-3.5 h-3.5" />
                    <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-technical text-[#34D399]">
                    <Mail className="w-3.5 h-3.5" />
                    <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                  </div>
                </div>

                <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-2">
                  <span className="text-[11px] text-[#A39E93] block">Company Identity & Sourcing</span>
                  <div className="font-medium text-sm text-[#F3F0E8]">{lead.business_name}</div>
                  {lead.website && (
                    <div className="flex items-center gap-2 text-xs font-technical text-[#FFAA3D]">
                      <Globe className="w-3.5 h-3.5" />
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {lead.website}
                      </a>
                    </div>
                  )}
                  <div className="text-[11px] text-[#A39E93] pt-1">
                    Source: {lead.source_name || "Direct Commercial Registry"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-[12px] bg-[#161514] border border-[rgba(243,240,232,0.08)] text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#111110] border border-[rgba(232,75,44,0.3)] flex items-center justify-center mx-auto text-[#FFAA3D]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-[#F3F0E8]">
                    Contact Information Masked
                  </h4>
                  <p className="text-xs text-[#A39E93] max-w-md mx-auto mt-1">
                    To protect business privacy and prevent unsolicited spam, phone numbers, direct emails, and full identities remain hidden until you accept this offer.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAcceptOffer}
                  isLoading={actionLoading}
                >
                  Accept Offer to Unlock Full Contact
                </Button>
              </div>
            )}
          </div>
        </Card>

        <MandatoryDisclaimerBanner variant="short" />
      </div>

      {/* Accuracy Dispute Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#111110] border border-[rgba(243,240,232,0.1)] rounded-[12px] p-6 space-y-4">
            <DialogHeader>
              <DialogTitle>Report Contact Inaccuracy</DialogTitle>
              <DialogDescription>
                Submit proof of an invalid phone number or bounced email to receive a replacement quota credit.
              </DialogDescription>
            </DialogHeader>

            {reportSuccess ? (
              <div className="p-4 rounded-[8px] bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.3)] text-xs text-[#34D399] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Dispute submitted. Administrator will review and credit replacement quota unit.</span>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">Defect Category</label>
                  <Select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="text-xs"
                  >
                    <option value="inaccurate_phone">Phone Number Out of Service / Invalid</option>
                    <option value="inaccurate_email">Email Bounced / Mailbox Not Found (550)</option>
                    <option value="entity_closed">Business Entity Permanently Closed</option>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#D0CBC1]">Dispute Details & Evidence</label>
                  <Textarea
                    required
                    rows={3}
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="e.g. Telecom operator recorded voice message stating number is unallocated..."
                    className="text-xs"
                  />
                </div>

                <DialogFooter className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setReportModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={reportSubmitting}
                  >
                    Submit Dispute
                  </Button>
                </DialogFooter>
              </form>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
