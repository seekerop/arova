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
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Mail,
  ShieldCheck,
  Clock,
  Laptop,
} from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Shipping & Delivery Policy (Digital Services) — Instant Digital Fulfillment",
  description:
    "Official Shipping and Delivery Policy for Arova by Arenova Technologies. Explaining digital service provisioning, instant quota delivery, and electronic invoice dispatch.",
  path: "/shipping-policy",
  keywords: [
    "Arova shipping policy",
    "digital delivery policy",
    "SaaS service fulfillment",
    "Arenova delivery terms",
  ],
});

export default function ShippingPolicyPage() {
  const breadcrumbJsonLd = buildBreadcrumbListSchema([
    { name: "Shipping & Delivery Policy", path: "/shipping-policy" },
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
              DIGITAL SERVICE FULFILLMENT
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs text-[#9E9B93]">
              Applicable to all online purchases and subscriptions on Arova · Last updated: October 2026
            </p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#D0CBC1] leading-relaxed">
            {/* Section 1: Digital Nature of Services */}
            <Card className="p-6 bg-[#111110] border-[rgba(232,75,44,0.3)] space-y-3">
              <div className="flex items-center gap-2 text-[#FFAA3D] font-semibold text-sm">
                <Laptop className="w-5 h-5 shrink-0" />
                100% Digital Delivery — No Physical Shipping
              </div>
              <p className="text-xs text-[#D0CBC1]">
                <strong>{BUSINESS_CONFIG.brandName}</strong> (operated by <strong>{BUSINESS_CONFIG.legalEntityName}</strong>) operates strictly as a cloud-hosted Software-as-a-Service (SaaS) and B2B lead intelligence platform. All services, plan allocations, and data deliverables provided on this website are <strong>delivered electronically</strong> through our secure online portal. <strong>No physical goods, packages, or tangible media are shipped or dispatched via courier.</strong>
              </p>
            </Card>

            {/* Section 2: Delivery Timeline & Mode */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#FFAA3D]" />
                1. Delivery Timeline & Fulfillment Mechanism
              </h2>
              <p>
                Upon the successful completion and authorization of your transaction via our authorized payment partner (<strong>{BUSINESS_CONFIG.paymentGateway.partnerName}</strong>), digital delivery is executed as follows:
              </p>
              <ul className="space-y-2 pl-4 list-disc text-[#D0CBC1]">
                <li>
                  <strong>Instant Account Provisioning (Immediate):</strong> Your subscription quota (40 prospects for Starter or 100 prospects for Growth) is credited authoritatively to your secure dashboard at <Link href="/dashboard" className="text-[#FFAA3D] underline">arova.arenova.in/dashboard</Link> instantly upon payment verification (typically within <strong>0 to 15 minutes</strong>).
                </li>
                <li>
                  <strong>Electronic Order Confirmation (Within 10 Minutes):</strong> A formal digital payment receipt, tax invoice, and order confirmation are sent to your registered email address automatically.
                </li>
                <li>
                  <strong>Lead Distribution Rhythm:</strong> New prospective business leads matching your selected service categories are surfaced steadily across your active 30-day billing cycle to ensure fresh, manageable review workflows.
                </li>
              </ul>
            </section>

            {/* Section 3: Shipping & Delivery Charges */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#34D399]" />
                2. Shipping & Handling Charges
              </h2>
              <p>
                Since all services and data access are delivered digitally over the internet, <strong>Shipping and Handling Fees are ₹0.00 (Zero Rupees / Free)</strong> for all users and tiers. You will never be charged any shipping, freight, or courier fees.
              </p>
            </section>

            {/* Section 4: Service Delivery Delays or Technical Non-Receipt */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#E84B2C]" />
                3. Service Delivery Delays & Troubleshooting
              </h2>
              <p>
                While our digital infrastructure operates with automated real-time webhooks, rare network interruptions or banking delays may occasionally delay transaction confirmation. If your subscription quota does not reflect in your dashboard within 30 minutes of payment:
              </p>
              <ol className="space-y-2 pl-4 list-decimal text-[#D0CBC1]">
                <li>Check your registered email address for the Razorpay Payment ID confirmation (e.g. <code>pay_...</code>).</li>
                <li>Log out and log back in to your dashboard to refresh your authentication session.</li>
                <li>
                  Contact our dedicated support desk at <strong>{BUSINESS_CONFIG.contact.supportEmail}</strong> or call our helpline at <strong>{BUSINESS_CONFIG.contact.helplinePhone}</strong> quoting your Payment ID.
                </li>
              </ol>
              <p>
                Our technical support team will manually reconcile the transaction and provision your allocation within <strong>24 business hours</strong>.
              </p>
            </section>

            {/* Section 5: Operating Support Contact */}
            <section className="space-y-3 pt-4 border-t border-[rgba(243,240,232,0.06)]">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                4. Operating Contact & Grievance Address
              </h2>
              <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.08)] space-y-2 text-xs">
                <div>
                  <span className="text-[#A39E93]">Operating Entity:</span>{" "}
                  <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.legalEntityName}</strong>
                </div>
                <div>
                  <span className="text-[#A39E93]">Registered Address:</span>{" "}
                  <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.registeredAddress.formatted}</strong>
                </div>
                <div>
                  <span className="text-[#A39E93]">Customer Support Email:</span>{" "}
                  <a href={`mailto:${BUSINESS_CONFIG.contact.supportEmail}`} className="text-[#FFAA3D] underline">
                    {BUSINESS_CONFIG.contact.supportEmail}
                  </a>
                </div>
                <div>
                  <span className="text-[#A39E93]">Helpline Phone:</span>{" "}
                  <strong className="text-[#F3F0E8]">{BUSINESS_CONFIG.contact.helplinePhone}</strong>
                </div>
                <div>
                  <span className="text-[#A39E93]">Operating Business Hours:</span>{" "}
                  <span className="text-[#D0CBC1]">{BUSINESS_CONFIG.contact.operatingHours}</span>
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
