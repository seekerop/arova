import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { createPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbListSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { BUSINESS_CONFIG } from "@/lib/constants/business";
import { Shield, Lock, CreditCard, Eye, Server, UserCheck } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Privacy Policy — Data Protection, DPDP Compliance & Razorpay Security",
  description:
    "Official Privacy Policy of Arova by Arenova Technologies. Details on commercial data processing, Razorpay PCI-DSS Level 1 payment security, DPDP Act 2023 compliance, transient IP geolocation, and grievance officer contact.",
  path: "/privacy",
  keywords: [
    "Arova privacy policy",
    "Arenova data protection",
    "Razorpay payment security policy",
    "DPDP Act compliance India",
    "B2B commercial privacy",
  ],
});

export default function PrivacyPage() {
  const breadcrumbJsonLd = buildBreadcrumbListSchema([
    { name: "Privacy Policy", path: "/privacy" },
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
              DATA INTEGRITY & STATUTORY PRIVACY
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#9E9B93]">
              Commitment to user privacy by {BUSINESS_CONFIG.legalEntityName} · Last updated: October 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#D0CBC1] leading-relaxed">
            {/* 1. Introduction & Scope */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                1. Introduction & Statutory Scope
              </h2>
              <p>
                <strong>{BUSINESS_CONFIG.legalEntityName}</strong> (&ldquo;Company&rdquo;, &ldquo;We&rdquo;, &ldquo;Us&rdquo;, or &ldquo;Arenova&rdquo;), operating <strong>{BUSINESS_CONFIG.commercialName}</strong> ({BUSINESS_CONFIG.domain}), is committed to safeguarding your privacy and personal data. This Privacy Policy outlines our practices regarding data collection, processing, security, and disclosure in compliance with the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>, and the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
              </p>
            </section>

            {/* 2. Third-Party Payment Processor Disclosure (RAZORPAY MANDATE) */}
            <Card className="p-6 bg-[#161514] border-[rgba(255,170,61,0.3)] space-y-3">
              <div className="flex items-center gap-2 text-[#FFAA3D] font-semibold text-sm">
                <CreditCard className="w-5 h-5 shrink-0" />
                Payment Gateway Partner: Razorpay Software Private Limited
              </div>
              <p className="text-xs text-[#D0CBC1] leading-relaxed">
                When you purchase a subscription on Arova, online payments are processed through our authorized payment aggregator, <strong>{BUSINESS_CONFIG.paymentGateway.partnerLegalName} (&ldquo;Razorpay&rdquo;)</strong>.
              </p>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-[#D0CBC1]">
                <li>
                  <strong>No Card Data Storage:</strong> Arova <strong>does NOT capture, store, or have access to</strong> your sensitive payment instruments, including credit card numbers, debit card PINs, CVV codes, net banking passwords, or UPI MPINs.
                </li>
                <li>
                  <strong>Direct Encryption:</strong> All sensitive financial information is transmitted directly from your browser to Razorpay via end-to-end 256-bit TLS encryption.
                </li>
                <li>
                  <strong>PCI-DSS Compliance:</strong> Razorpay processes payments in accordance with global <strong>PCI-DSS (Payment Card Industry Data Security Standard) Level 1</strong> guidelines.
                </li>
              </ul>
            </Card>

            {/* 3. Information We Collect */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FFAA3D]" />
                2. Information We Collect
              </h2>
              <ul className="space-y-2 pl-4 list-disc text-[#D0CBC1]">
                <li>
                  <strong>Account Identification:</strong> Full name, professional email address, company or agency name, and encrypted authentication tokens.
                </li>
                <li>
                  <strong>Billing & Transaction Records:</strong> Transaction date, amount in INR, Razorpay Order ID, Razorpay Payment ID, and GST registration details (if provided for tax invoices).
                </li>
                <li>
                  <strong>Platform Usage & Telemetry:</strong> Log records, claimed lead history, response timestamps, and privacy-conscious transient IP geolocation (processed transiently and immediately discarded without storing raw IP logs).
                </li>
              </ul>
            </section>

            {/* 4. Commercial Data & Identity Shielding */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#34D399]" />
                3. Lead Contact Privacy Protection & Sourcing
              </h2>
              <p>
                Arova processes publicly available commercial data regarding registered corporate entities, business announcements, and trade filings. We enforce strict data stewardship:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-[#D0CBC1]">
                <li>
                  <strong>Identity Shielding:</strong> Direct telephone numbers and email addresses of prospective businesses remain strictly masked behind database access controls until an authorized subscriber accepts an offer.
                </li>
                <li>
                  <strong>No Consumer Data:</strong> We do not collect, trade, or distribute sensitive consumer personal information, private residential data, or medical records.
                </li>
                <li>
                  <strong>Directory Removal & Opt-Out:</strong> Any business wishing to update or remove their commercial listing from Arova may submit a request to <a href={`mailto:${BUSINESS_CONFIG.contact.supportEmail}`} className="text-[#FFAA3D] underline">{BUSINESS_CONFIG.contact.supportEmail}</a>. Legitimate requests are processed within <strong>48 business hours</strong>.
                </li>
              </ul>
            </section>

            {/* 5. Data Security & Storage */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <Server className="w-4 h-4 text-[#E84B2C]" />
                4. Data Security & Retention
              </h2>
              <p>
                We implement robust technical and organizational security controls:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-[#D0CBC1]">
                <li>Database Row Level Security (RLS) guaranteeing tenant isolation.</li>
                <li>Automated encrypted session tokens with secure cookie flags.</li>
                <li>Strict role-based administrative access controls.</li>
                <li>Transaction records are retained strictly as required by Indian accounting standards, tax laws, and Razorpay dispute resolution timelines.</li>
              </ul>
            </section>

            {/* 6. Statutory Grievance Redressal Officer */}
            <section className="space-y-3 pt-4 border-t border-[rgba(243,240,232,0.06)]">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#FFAA3D]" />
                5. Statutory Grievance Redressal Officer
              </h2>
              <p>
                Pursuant to Rule 3(2) of the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong> and the <strong>DPDP Act, 2023</strong>, the contact details of our Grievance Officer are:
              </p>
              <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.08)] space-y-2 text-xs">
                <div>
                  <span className="text-[#A39E93]">Officer:</span>{" "}
                  <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.grievanceOfficer.name}</strong> ({BUSINESS_CONFIG.grievanceOfficer.designation})
                </div>
                <div>
                  <span className="text-[#A39E93]">Email:</span>{" "}
                  <a href={`mailto:${BUSINESS_CONFIG.grievanceOfficer.email}`} className="text-[#FFAA3D] underline">
                    {BUSINESS_CONFIG.grievanceOfficer.email}
                  </a>
                </div>
                <div>
                  <span className="text-[#A39E93]">Telephone:</span>{" "}
                  <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.grievanceOfficer.phone}</strong>
                </div>
                <div>
                  <span className="text-[#A39E93]">Postal Address:</span>{" "}
                  <span className="text-[#D0CBC1]">{BUSINESS_CONFIG.grievanceOfficer.address}</span>
                </div>
                <div>
                  <span className="text-[#A39E93]">Resolution SLA:</span>{" "}
                  <span className="text-[#34D399]">{BUSINESS_CONFIG.grievanceOfficer.responseSLA}</span>
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
