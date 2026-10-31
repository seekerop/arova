import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Badge } from "@/components/ui/badge";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, RotateCcw, AlertTriangle, ShieldCheck } from "lucide-react";
import { createPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbListSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { BUSINESS_CONFIG } from "@/lib/constants/business";

export const metadata: Metadata = createPageMetadata({
  title: "Cancellation & Refund Policy — Fair Data Guarantee",
  description:
    "Official Cancellation and Refund Policy for Arova by Arenova Technologies. Details on subscription cancellation, data inaccuracy replacements, refund eligibility, and 5-7 business day payout timelines via Razorpay.",
  path: "/refund-policy",
  keywords: [
    "Arova refund policy",
    "cancellation policy",
    "Razorpay refund timeline",
    "lead replacement guarantee",
    "Arenova billing policy",
  ],
});

export default function RefundPolicyPage() {
  const breadcrumbJsonLd = buildBreadcrumbListSchema([
    { name: "Cancellation & Refund Policy", path: "/refund-policy" },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />
      <JsonLd data={breadcrumbJsonLd} />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <Badge variant="amber" size="sm">
              BILLING TRANSPARENCY & FAIR REPLACEMENT
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
              Cancellation & Refund Policy
            </h1>
            <p className="text-xs text-[#9E9B93]">
              Applicable to all subscriptions and transactions on Arova · Last updated: October 2026
            </p>
          </div>

          <MandatoryDisclaimerBanner variant="full" />

          {/* Key Razorpay Policy Notice Box */}
          <Card className="p-6 bg-[#161514] border-[rgba(52,211,153,0.3)] space-y-3">
            <div className="flex items-center gap-2 text-[#34D399] font-semibold text-sm">
              <Clock className="w-5 h-5 shrink-0" />
              Official Razorpay Refund Processing Timeline
            </div>
            <p className="text-xs text-[#D0CBC1] leading-relaxed">
              Approved monetary refunds are processed through our payment gateway partner, <strong>{BUSINESS_CONFIG.paymentGateway.partnerName}</strong>, and will be credited directly back to the customer’s original payment source (bank account, UPI, or credit/debit card) within <strong>{BUSINESS_CONFIG.paymentGateway.payoutRefundTimeline}</strong>.
            </p>
          </Card>

          <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#D0CBC1] leading-relaxed">
            {/* Section 1: Subscription Cancellation Policy */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#FFAA3D]" />
                1. Subscription Cancellation Policy
              </h2>
              <p>
                We believe in complete freedom and transparency for all subscribers:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-[#D0CBC1]">
                <li>
                  <strong>Cancel Anytime:</strong> You may cancel your subscription at any time directly through your dashboard at <Link href="/dashboard/subscription" className="text-[#FFAA3D] underline">Dashboard &gt; Subscription</Link>, or by emailing our billing team at <a href={`mailto:${BUSINESS_CONFIG.contact.billingEmail}`} className="text-[#FFAA3D] underline">{BUSINESS_CONFIG.contact.billingEmail}</a>.
                </li>
                <li>
                  <strong>Effect of Cancellation:</strong> When you cancel, your account will not be billed for any subsequent renewal periods. You retain full access to your remaining lead quota and active exclusive claims until the end of your current 30-day billing cycle.
                </li>
                <li>
                  <strong>No Hidden Cancellation Fees:</strong> There are zero cancellation charges or exit penalties.
                </li>
              </ul>
            </section>

            {/* Section 2: Core Data Replacement Principle */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                2. Fair Data Quality Replacement Guarantee
              </h2>
              <p>
                Arova operates on a verifiable data quality guarantee. If a claimed prospect contains provably defective or obsolete contact records, we issue an immediate replacement quota credit to your account:
              </p>

              {/* Distinction Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <Card className="p-6 bg-[#161514] border-[rgba(52,211,153,0.3)] space-y-3">
                  <div className="flex items-center gap-2 text-[#34D399] font-semibold text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    Eligible for Free Quota Replacement
                  </div>
                  <ul className="space-y-2 text-xs text-[#D0CBC1]">
                    <li>• Phone number permanently disconnected or out of service</li>
                    <li>• Hard email bounce (mailbox does not exist or server rejected)</li>
                    <li>• Business legally dissolved, closed, or ceased trading</li>
                    <li>• Duplicate lead delivered within the same 30-day cycle</li>
                    <li>• Commercial category fundamentally mismatched with requirement</li>
                  </ul>
                </Card>

                <Card className="p-6 bg-[#161514] border-[rgba(232,75,44,0.3)] space-y-3">
                  <div className="flex items-center gap-2 text-[#FFAA3D] font-semibold text-xs sm:text-sm">
                    <XCircle className="w-4 h-4 shrink-0" />
                    Ineligible for Replacement / Refund
                  </div>
                  <ul className="space-y-2 text-xs text-[#D0CBC1]">
                    <li>• Prospect chooses not to respond to your emails or phone calls</li>
                    <li>• Prospect states they do not currently need services</li>
                    <li>• Prospect rejects your commercial proposal, pricing, or pitch</li>
                    <li>• Prospect has already awarded the project to another vendor</li>
                    <li>• Unclaimed offers that expired after the 48-hour review window</li>
                  </ul>
                </Card>
              </div>
            </section>

            {/* Section 3: Monetary Refunds */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFAA3D]" />
                3. Monetary Refund Eligibility & Guidelines
              </h2>
              <p>
                Subscriptions (₹499 Starter / ₹999 Growth) fund manual prospective verification and specialized server allocations:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-[#D0CBC1]">
                <li>
                  <strong>7-Day Trial / Inactivity Window:</strong> If you purchase a subscription and do not claim or unlock any lead contact details, you are eligible to request a full 100% monetary refund within <strong>7 calendar days</strong> of payment.
                </li>
                <li>
                  <strong>Technical Non-Delivery:</strong> In the rare event that a verifiable technical defect on Arova’s platform prevents lead delivery for more than 72 consecutive hours and our engineers are unable to resolve it, a prorated or full monetary refund will be issued.
                </li>
                <li>
                  <strong>Non-Refundable Circumstances:</strong> Once lead contact details have been unlocked and claimed, subscription fees are non-refundable, as commercial contact disclosure constitutes irreversible service delivery.
                </li>
              </ul>
            </section>

            {/* Section 4: Refund Claim Process */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                4. How to Submit a Refund or Replacement Request
              </h2>
              <ol className="space-y-2 pl-4 list-decimal text-[#D0CBC1]">
                <li>
                  <strong>Data Inaccuracy Report:</strong> In your dashboard, open the claimed lead and click <strong>“Report Data Issue”</strong>, attaching supporting proof (e.g. email bounce header or screenshot).
                </li>
                <li>
                  <strong>Billing Refund Request:</strong> Send an email to <strong>{BUSINESS_CONFIG.contact.billingEmail}</strong> or <strong>{BUSINESS_CONFIG.contact.supportEmail}</strong> with your registered email, Razorpay Payment ID, and reason for request.
                </li>
                <li>
                  <strong>Review & Settlement SLA:</strong> Our audit team reviews and responds to all claims within <strong>24 to 48 business hours</strong>. Approved refunds are initiated immediately and reflected in your bank account or card within <strong>{BUSINESS_CONFIG.paymentGateway.payoutRefundTimeline}</strong>.
                </li>
              </ol>
            </section>

            {/* Section 5: Operating Support Contact */}
            <section className="space-y-3 pt-4 border-t border-[rgba(243,240,232,0.06)]">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                5. Grievance & Billing Support Desk
              </h2>
              <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.08)] space-y-2 text-xs">
                <div>
                  <span className="text-[#A39E93]">Company:</span>{" "}
                  <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.legalEntityName}</strong>
                </div>
                <div>
                  <span className="text-[#A39E93]">Billing & Refund Desk:</span>{" "}
                  <a href={`mailto:${BUSINESS_CONFIG.contact.billingEmail}`} className="text-[#FFAA3D] underline">
                    {BUSINESS_CONFIG.contact.billingEmail}
                  </a>
                </div>
                <div>
                  <span className="text-[#A39E93]">Support Helpline:</span>{" "}
                  <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.contact.helplinePhone}</strong>
                </div>
                <div>
                  <span className="text-[#A39E93]">Operating Hours:</span>{" "}
                  <span className="text-[#D0CBC1]">{BUSINESS_CONFIG.contact.operatingHours}</span>
                </div>
                <div>
                  <span className="text-[#A39E93]">Registered Address:</span>{" "}
                  <span className="text-[#D0CBC1]">{BUSINESS_CONFIG.registeredAddress.formatted}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
