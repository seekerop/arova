import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbListSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { BUSINESS_CONFIG } from "@/lib/constants/business";
import {
  ShieldCheck,
  Target,
  Users,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "About Us — B2B Lead Intelligence & Qualified Business Discovery",
  description:
    "Learn about Arova by Arenova Technologies. Discover our mission to provide verified, curated commercial business leads with ethical sourcing and 30-day exclusive claim protection.",
  path: "/about",
  keywords: [
    "About Arova",
    "Arenova Technologies",
    "B2B lead intelligence platform",
    "curated business leads India",
    "exclusive commercial outreach",
  ],
});

export default function AboutPage() {
  const breadcrumbJsonLd = buildBreadcrumbListSchema([
    { name: "About Us", path: "/about" },
  ]);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Arova by Arenova Technologies",
    description: BUSINESS_CONFIG.description,
    url: `${BUSINESS_CONFIG.domain}/about`,
    mainEntity: {
      "@type": "Organization",
      name: BUSINESS_CONFIG.legalEntityName,
      alternateName: BUSINESS_CONFIG.brandName,
      url: BUSINESS_CONFIG.parentDomain,
      logo: `${BUSINESS_CONFIG.domain}/arenova.png`,
      email: BUSINESS_CONFIG.contact.supportEmail,
      telephone: BUSINESS_CONFIG.contact.helplinePhone,
      address: {
        "@type": "PostalAddress",
        streetAddress: `${BUSINESS_CONFIG.registeredAddress.building}, ${BUSINESS_CONFIG.registeredAddress.street}`,
        addressLocality: BUSINESS_CONFIG.registeredAddress.city,
        addressRegion: BUSINESS_CONFIG.registeredAddress.state,
        postalCode: BUSINESS_CONFIG.registeredAddress.pincode,
        addressCountry: "IN",
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />
      <JsonLd data={[breadcrumbJsonLd, organizationSchema]} />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Hero */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="amber" size="sm">
              ABOUT ARENOVA & AROVA
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#F3F0E8] tracking-tight">
              Curated Business Intelligence for Modern Growth Teams
            </h1>
            <p className="text-sm sm:text-base text-[#D0CBC1] leading-relaxed">
              Arova is built by {BUSINESS_CONFIG.legalEntityName} to bridge the gap between service providers and verified commercial opportunities across India.
            </p>
          </div>

          {/* Mission & Purpose */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#161514] border border-[rgba(232,75,44,0.3)] flex items-center justify-center text-[#E84B2C]">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-[#F3F0E8]">
                Curated Lead Intelligence
              </h3>
              <p className="text-xs text-[#A39E93] leading-relaxed">
                Rather than scraping low-intent public directories, our team manually verifies active commercial requirements, confirming organizational intent before presenting prospects to subscribers.
              </p>
            </Card>

            <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#161514] border border-[rgba(52,211,153,0.3)] flex items-center justify-center text-[#34D399]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-[#F3F0E8]">
                30-Day Exclusive Claim
              </h3>
              <p className="text-xs text-[#A39E93] leading-relaxed">
                When you accept an opportunity, we lock that lead exclusively to your agency for 30 full days. No competitor receives the same contact during your outreach window.
              </p>
            </Card>

            <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-3">
              <div className="w-10 h-10 rounded-[10px] bg-[#161514] border border-[rgba(255,170,61,0.3)] flex items-center justify-center text-[#FFAA3D]">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold text-[#F3F0E8]">
                Ethical Privacy Standards
              </h3>
              <p className="text-xs text-[#A39E93] leading-relaxed">
                Prospect contact identities remain fully masked until review and claim. We comply strictly with Indian privacy frameworks and respect commercial communications ethics.
              </p>
            </Card>
          </div>

          {/* Legal Entity & Operational Transparency */}
          <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-6">
            <div className="border-b border-[rgba(243,240,232,0.06)] pb-4">
              <Badge variant="outline" size="sm" className="mb-2">
                CORPORATE TRANSPARENCY
              </Badge>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F3F0E8]">
                Operating Company & Ecosystem Background
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-[#D0CBC1] leading-relaxed">
              <div className="space-y-3">
                <p>
                  <strong>{BUSINESS_CONFIG.brandName}</strong> is an enterprise software product owned and operated by <strong>{BUSINESS_CONFIG.legalEntityName}</strong>, headquartered in Bengaluru, Karnataka, India.
                </p>
                <p>
                  The platform was developed to solve the single largest bottleneck faced by digital agencies, software consultancies, and creative studios: accessing reliable, verified business clients without suffering spam directories or predatory auction bidding.
                </p>
              </div>

              <div className="space-y-3">
                <p>
                  Our ecosystem maintains active operations in AI automation, software engineering, and sales pipeline optimization under the Arenova banner.
                </p>
                <p>
                  We process all online subscription payments securely via <strong>Razorpay</strong>, India’s leading RBI-authorized payment aggregator, ensuring 100% compliant, transparent financial transactions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[rgba(243,240,232,0.06)] text-xs">
              <div>
                <span className="text-[#A39E93] block">Registered Entity:</span>
                <strong className="text-[#F3F0E8] font-technical">{BUSINESS_CONFIG.legalEntityName}</strong>
              </div>
              <div>
                <span className="text-[#A39E93] block">Headquarters:</span>
                <strong className="text-[#F3F0E8] font-technical">Bengaluru, Karnataka, India</strong>
              </div>
              <div>
                <span className="text-[#A39E93] block">Payment Gateway:</span>
                <strong className="text-[#FFAA3D] font-technical">Razorpay (PCI-DSS Level 1)</strong>
              </div>
            </div>
          </Card>

          {/* Call to action */}
          <div className="text-center space-y-4 pt-4">
            <h3 className="font-display text-2xl font-bold text-[#F3F0E8]">
              Ready to Accelerate Your Client Pipeline?
            </h3>
            <p className="text-xs sm:text-sm text-[#A39E93] max-w-xl mx-auto">
              Explore our transparent subscription tiers starting at ₹499 for 30 days of exclusive commercial prospects.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/pricing">
                <Button variant="primary" size="md">
                  View Subscription Plans <ArrowRight className="w-4 h-4 ml-1.5 inline" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="md">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

