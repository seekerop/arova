import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbListSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { BUSINESS_CONFIG } from "@/lib/constants/business";
import { ShieldCheck, Scale, CreditCard, Lock, AlertTriangle } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Terms of Service — Platform Guidelines & Razorpay Billing Terms",
  description:
    "Official terms and conditions governing the Arova business lead subscription platform. Comprehensive details on quota accounting, Razorpay INR payment terms, 30-day exclusivity, Indian governing law, and outreach compliance.",
  path: "/terms",
  keywords: [
    "Arova terms of service",
    "Arenova Technologies terms",
    "Razorpay payment terms",
    "B2B lead subscription agreement",
    "Indian governing law terms",
  ],
});

export default function TermsPage() {
  const breadcrumbJsonLd = buildBreadcrumbListSchema([
    { name: "Terms of Service", path: "/terms" },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />
      <JsonLd data={breadcrumbJsonLd} />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="space-y-3">
            <Badge variant="muted" size="sm">
              LEGAL AGREEMENT & STATUTORY TERMS
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
              Terms of Service
            </h1>
            <p className="text-xs text-[#9E9B93]">
              Binding agreement between {BUSINESS_CONFIG.legalEntityName} and the User · Last updated: October 2026
            </p>
          </div>

          <MandatoryDisclaimerBanner variant="full" />

          <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#D0CBC1] leading-relaxed">
            {/* 1. Acceptance */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                1. Acceptance of Terms & Corporate Identity
              </h2>
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Subscriber&rdquo;, or &ldquo;You&rdquo;) and <strong>{BUSINESS_CONFIG.legalEntityName}</strong> (&ldquo;Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, or &ldquo;Arenova&rdquo;), having its registered office at {BUSINESS_CONFIG.registeredAddress.formatted}, governing your access to and use of <strong>{BUSINESS_CONFIG.commercialName}</strong> ({BUSINESS_CONFIG.domain}) and all associated dashboard services.
              </p>
              <p>
                By creating an account, browsing commercial leads, initiating a subscription order, or submitting a payment, you acknowledge that you have read, understood, and agree to be bound by these Terms, our <Link href="/privacy" className="text-[#FFAA3D] underline">Privacy Policy</Link>, <Link href="/refund-policy" className="text-[#FFAA3D] underline">Cancellation & Refund Policy</Link>, and <Link href="/shipping-policy" className="text-[#FFAA3D] underline">Shipping & Delivery Policy</Link>.
              </p>
            </section>

            {/* 2. Nature of Service & Lead Disclaimers */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                2. Nature of Service & Commercial Limitations
              </h2>
              <p>
                Arova operates as a specialized B2B business intelligence and prospective lead directory. We surface prospective business opportunities in 5 approved commercial service categories across India.
              </p>
              <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(232,75,44,0.3)] text-xs text-[#FFAA3D] space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-[#E84B2C] shrink-0" />
                  Mandatory Non-Guarantee Disclaimer:
                </div>
                <p>
                  Leads provided are commercial prospective records, <strong>not guaranteed revenue, closed contracts, or signed agreements</strong>. Arova does not warrant that any prospect will respond to outreach, accept proposals, enter negotiations, or pay fees. You are solely responsible for outreach professionalism, technical competence, commercial pricing, and client engagement.
                </p>
              </div>
            </section>

            {/* 3. Razorpay Payments, Pricing & Billing */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#34D399]" />
                3. Pricing, Taxes & Razorpay Payment Processing
              </h2>
              <p>
                All financial transactions on Arova are governed by the following strict payment terms:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-[#D0CBC1]">
                <li>
                  <strong>Currency:</strong> All fees are stated and charged strictly in <strong>Indian National Rupees (INR / ₹)</strong>.
                </li>
                <li>
                  <strong>Subscription Plans:</strong> We offer two standard 30-day billing tiers:
                  <ul className="pl-4 list-circle mt-1 space-y-1">
                    <li><strong>Starter Plan:</strong> ₹499 per 30 days (allocation of 40 qualified prospective business records).</li>
                    <li><strong>Growth Plan:</strong> ₹999 per 30 days (allocation of 100 qualified prospective business records).</li>
                  </ul>
                </li>
                <li>
                  <strong>Taxes & Invoicing:</strong> Prices are inclusive of applicable goods and services taxes (GST) under Indian tax laws. A compliant digital tax invoice is automatically generated and dispatched via email upon successful transaction completion.
                </li>
                <li>
                  <strong>Payment Aggregator Disclosure:</strong> Online payments are authorized and collected securely through <strong>{BUSINESS_CONFIG.paymentGateway.partnerLegalName} (&ldquo;Razorpay&rdquo;)</strong>. We do not store or capture your sensitive payment credentials (credit/debit card numbers, CVVs, net banking credentials, or UPI MPINs). Transactions comply with RBI circulars and PCI-DSS Level 1 security standards.
                </li>
              </ul>
            </section>

            {/* 4. Quota Accounting & 30-Day Exclusive Claim */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FFAA3D]" />
                4. Quota Accounting, 48-Hour Review & 30-Day Exclusivity
              </h2>
              <ul className="space-y-2 pl-4 list-disc text-[#D0CBC1]">
                <li>
                  <strong>48-Hour Review Window:</strong> Leads delivered to your pipeline enter a 48-hour review window with 1 reserved quota unit. You can inspect generalized requirements, city, and category without disclosing private contact details.
                </li>
                <li>
                  <strong>30-Day Exclusive Lock:</strong> If you accept the offer, the reservation converts into an authoritative claimed lead. <strong>No competitor or other subscriber can view or claim that business record for 30 consecutive calendar days.</strong>
                </li>
                <li>
                  <strong>Automatic Expiration:</strong> If an offer is neither accepted nor declined within 48 hours, it expires automatically and the reserved quota unit is released back to your available balance.
                </li>
                <li>
                  <strong>Non-Rollover:</strong> Quota allocations are designed for use within the 30-day billing cycle and do not roll over to future periods except when granted as replacement credits under our <Link href="/refund-policy" className="text-[#FFAA3D] underline">Refund & Replacement Policy</Link>.
                </li>
              </ul>
            </section>

            {/* 5. Prohibited Use & Commercial Anti-Spam Compliance */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#E84B2C]" />
                5. Prohibited Conduct & Anti-Spam Compliance
              </h2>
              <p>
                Subscribers agree to use prospect contact data strictly for lawful, professional, 1-to-1 business inquiries. The following activities are strictly prohibited:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-[#D0CBC1]">
                <li>Sending unsolicited bulk commercial email (spam) or automated robocalls.</li>
                <li>Reselling, sublicensing, aggregating, or publishing claimed lead contacts.</li>
                <li>Attempting to bypass database masking, RLS barriers, or payment verification webhooks.</li>
                <li>Harassing contacts or misrepresenting affiliation with government registries or Arova.</li>
              </ul>
              <p>
                Violations result in immediate account termination, forfeiture of remaining quota without refund, and potential legal remedies under the <strong>Information Technology Act, 2000</strong>.
              </p>
            </section>

            {/* 6. Governing Law & Jurisdiction */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#34D399]" />
                6. Governing Law, Dispute Resolution & Jurisdiction
              </h2>
              <p>
                These Terms and all transactions shall be governed by and construed in accordance with the <strong>laws of the Republic of India</strong>, without regard to conflict of law principles.
              </p>
              <p>
                Any legal action, proceeding, or dispute arising out of or relating to these Terms, payments made via Razorpay, or platform use shall be instituted exclusively in the <strong>competent courts located in Bengaluru, Karnataka, India</strong>, and both parties irrevocably submit to the exclusive personal jurisdiction of such courts.
              </p>
            </section>

            {/* 7. Grievance Redressal & Support */}
            <section className="space-y-3 pt-4 border-t border-[rgba(243,240,232,0.06)]">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                7. Operating Contact Information
              </h2>
              <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.08)] space-y-2 text-xs">
                <div>
                  <span className="text-[#A39E93]">Company:</span>{" "}
                  <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.legalEntityName}</strong>
                </div>
                <div>
                  <span className="text-[#A39E93]">Support Email:</span>{" "}
                  <a href={`mailto:${BUSINESS_CONFIG.contact.supportEmail}`} className="text-[#FFAA3D] underline">
                    {BUSINESS_CONFIG.contact.supportEmail}
                  </a>
                </div>
                <div>
                  <span className="text-[#A39E93]">Helpline Phone:</span>{" "}
                  <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.contact.helplinePhone}</strong>
                </div>
                <div>
                  <span className="text-[#A39E93]">Registered Address:</span>{" "}
                  <span className="text-[#D0CBC1]">{BUSINESS_CONFIG.registeredAddress.formatted}</span>
                </div>
                <div>
                  <span className="text-[#A39E93]">Grievance Officer:</span>{" "}
                  <span className="text-[#D0CBC1]">{BUSINESS_CONFIG.grievanceOfficer.name} ({BUSINESS_CONFIG.grievanceOfficer.email})</span>
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
