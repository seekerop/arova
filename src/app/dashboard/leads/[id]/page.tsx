"use client";

import { useState } from "react";
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
  Share2,
} from "lucide-react";

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = (params?.id as string) || "lead_101";

  // State
  const [isClaimed, setIsClaimed] = useState(leadId.includes("201") || leadId.includes("202"));
  const [isPending, setIsPending] = useState(!leadId.includes("201") && !leadId.includes("202"));
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [issueType, setIssueType] = useState("inaccurate_phone");
  const [issueDescription, setIssueDescription] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Mock lead data
  const lead = {
    id: leadId,
    business_name: isClaimed ? "Zenith FinTech Systems Pvt Ltd" : "Commercial Retail Prospect",
    contact_name: isClaimed ? "Vikram Malhotra (Director of Product)" : null,
    phone: isClaimed ? "+91 98201 44921" : null,
    email: isClaimed ? "vikram@zenithfintech.in" : null,
    website: isClaimed ? "https://zenithfintech.in" : null,
    category_name: "Programming & Software",
    city: "Pune",
    state: "Maharashtra",
    country: "India",
    business_type: "Financial Technology SaaS",
    generalized_requirement:
      "Looking for experienced Next.js full-stack developers to build an internal operational dashboard and real-time ledger settlement microservices with Supabase and Postgres.",
    estimated_value_inr: "₹4,50,000",
    source_name: "MCA Corporate Registry & Direct Procurement Filing",
    source_url: isClaimed ? "https://mca.gov.in/registry/zenith" : null,
    collection_date: "2026-10-24",
    verification_date: "2026-10-26",
    claim_deadline: new Date(Date.now() + 38 * 60 * 60 * 1000).toISOString(),
    claim_expires_at: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const handleAccept = async () => {
    setIsClaimed(true);
    setIsPending(false);
  };

  const handleReject = async () => {
    router.push("/dashboard/leads");
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
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
      setReportSuccess(true);
      setTimeout(() => {
        setReportModalOpen(false);
        setReportSuccess(false);
        setIssueDescription("");
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setReportSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <DashboardHeader
        title="Lead Prospect Details"
        subtitle={`Viewing lead #${leadId}`}
      />

      <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Navigation link */}
        <Link
          href="/dashboard/leads"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#A39E93] hover:text-[#F3F0E8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Leads
        </Link>

        {/* Mandatory Disclaimer Banner */}
        <MandatoryDisclaimerBanner variant="short" />

        {/* Lead Main Card */}
        <Card className="bg-[#111110] border-[rgba(243,240,232,0.08)] p-6 md:p-8 space-y-8">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[rgba(243,240,232,0.06)]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="category" size="md">
                  {lead.category_name}
                </Badge>
                {isClaimed ? (
                  <Badge variant="success" size="md" className="gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    30-Day Exclusive Claim Active
                  </Badge>
                ) : (
                  <Badge variant="amber" size="md" className="gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Pending Offer (48h Window)
                  </Badge>
                )}
              </div>
              <h2 className="font-display text-2xl font-bold text-[#F3F0E8]">
                {lead.business_name}
              </h2>
              <div className="flex items-center gap-4 text-xs text-[#A39E93]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#C86938]" />
                  {lead.city}, {lead.state}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#C86938]" />
                  {lead.business_type}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#C86938]" />
                  Verified: {lead.verification_date}
                </span>
              </div>
            </div>

            {/* Offer Decision Actions */}
            {isPending && (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleReject}
                  className="text-xs text-[#A39E93] hover:text-[#E84B2C]"
                >
                  Decline Offer
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAccept}
                  className="text-xs gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Accept & Claim Lead
                </Button>
              </div>
            )}
          </div>

          {/* Generalized Requirement */}
          <div className="space-y-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[#FFAA3D]">
              Business Requirement
            </h3>
            <p className="text-sm text-[#F3F0E8] leading-relaxed bg-[#161514] p-4 rounded-[8px] border border-[rgba(243,240,232,0.06)]">
              {lead.generalized_requirement}
            </p>
          </div>

          {/* Contact Details (Privacy Gated) */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-[#FFAA3D]">
              Contact Details & Provenance
            </h3>

            {isClaimed ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-1">
                  <span className="text-[11px] text-[#A39E93] flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#34D399]" />
                    Direct Phone Number
                  </span>
                  <p className="font-technical text-sm font-semibold text-[#F3F0E8]">
                    {lead.phone}
                  </p>
                </div>

                <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-1">
                  <span className="text-[11px] text-[#A39E93] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#34D399]" />
                    Verified Email
                  </span>
                  <p className="font-technical text-sm font-semibold text-[#F3F0E8]">
                    {lead.email}
                  </p>
                </div>

                <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-1">
                  <span className="text-[11px] text-[#A39E93] flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#34D399]" />
                    Website Profile
                  </span>
                  <a
                    href={lead.website || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="font-technical text-sm text-[#FFAA3D] hover:underline"
                  >
                    {lead.website}
                  </a>
                </div>

                <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-1">
                  <span className="text-[11px] text-[#A39E93]">Source Provenance</span>
                  <p className="text-xs text-[#D0CBC1]">{lead.source_name}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-[8px] bg-[#161514] border border-[rgba(232,75,44,0.2)] text-center space-y-3">
                <Lock className="w-8 h-8 text-[#FFAA3D] mx-auto opacity-80" />
                <h4 className="font-display font-semibold text-sm text-[#F3F0E8]">
                  Contact Information Masked
                </h4>
                <p className="text-xs text-[#A39E93] max-w-md mx-auto">
                  To protect business privacy and prevent unsolicited spam, phone numbers, direct emails, and full identities remain hidden until you accept this offer.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAccept}
                  className="mt-2"
                >
                  Accept Offer to Unlock Full Contact
                </Button>
              </div>
            )}
          </div>

          {/* Report Data Issue Action */}
          {isClaimed && (
            <div className="pt-4 border-t border-[rgba(243,240,232,0.06)] flex items-center justify-between text-xs">
              <span className="text-[#A39E93]">
                Notice disconnected numbers or inaccurate contact data?
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReportModalOpen(true)}
                className="text-xs text-[#FFAA3D] hover:text-[#E84B2C] border-[rgba(255,170,61,0.3)]"
              >
                Report Inaccurate Lead
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogHeader>
          <DialogTitle>Report Inaccurate Lead Data</DialogTitle>
          <DialogDescription>
            Submit verifiable details if the contact information is disconnected or invalid. Verified claims receive a replacement lead credit.
          </DialogDescription>
        </DialogHeader>

        {reportSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-[#34D399] mx-auto" />
            <p className="text-xs text-[#F3F0E8] font-semibold">Report Received</p>
            <p className="text-[11px] text-[#A39E93]">
              Our administration team will review and credit a replacement upon confirmation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Issue Category
              </label>
              <Select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <option value="inaccurate_phone">Phone Number Invalid or Disconnected</option>
                <option value="inaccurate_email">Email Bounced (Mailbox Does Not Exist)</option>
                <option value="closed_business">Business Closed or Dissolved</option>
                <option value="wrong_category">Mismatched Service Category</option>
                <option value="duplicate">Duplicate Lead Previously Received</option>
                <option value="other">Other Commercial Discrepancy</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Description & Proof Notes
              </label>
              <Textarea
                required
                rows={4}
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                placeholder="E.g., Called phone number; automated carrier message says number does not exist. Sent email to domain, returned 550 User unknown."
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReportModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={reportSubmitting}
              >
                Submit Issue Report
              </Button>
            </DialogFooter>
          </form>
        )}
      </Dialog>
    </div>
  );
}
