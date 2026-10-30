import type { Metadata } from "next";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Badge } from "@/components/ui/badge";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { PricingInteractive } from "@/components/pricing/pricing-interactive";
import { createPageMetadata } from "@/lib/seo/metadata";
import {
  buildSoftwareApplicationSchema,
  buildBreadcrumbListSchema,
} from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import { Check, X } from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "Subscription Plans & Pricing — Starter (₹499) and Growth (₹999)",
  description:
    "Predictable, transparent B2B lead subscription pricing. Get 40 to 100 verified business leads per month with 48-hour review windows and 30-day exclusive outreach protection.",
  path: "/pricing",
  keywords: [
    "Arova pricing",
    "B2B lead pricing",
    "lead subscription plans",
    "buy B2B leads India",
    "software lead subscription",
    "marketing leads pricing",
  ],
});

export default function PricingPage() {
  const breadcrumbJsonLd = buildBreadcrumbListSchema([
    { name: "Pricing", path: "/pricing" },
  ]);
  const softwareAppSchema = buildSoftwareApplicationSchema();

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />
      <JsonLd data={[breadcrumbJsonLd, softwareAppSchema]} />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="amber" size="sm">
              SUBSCRIPTION ALLOCATIONS
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#F3F0E8]">
              Transparent Plans for Growth
            </h1>
            <p className="text-sm sm:text-base text-[#D0CBC1] leading-relaxed">
              Choose your monthly allocation of verified business prospects. Every plan includes 48-hour offer review windows and 30-day exclusive outreach protection.
            </p>
          </div>

          {/* Interactive Pricing Component */}
          <PricingInteractive />

          {/* Full Disclaimer Banner */}
          <div className="max-w-4xl mx-auto">
            <MandatoryDisclaimerBanner variant="full" />
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto space-y-6 pt-8">
            <h2 className="font-display text-xl font-bold text-[#F3F0E8] text-center">
              Feature Comparison
            </h2>

            <div className="overflow-x-auto rounded-[12px] border border-[rgba(243,240,232,0.08)] bg-[#111110]">
              <table className="w-full text-left text-xs text-[#D0CBC1]">
                <thead className="border-b border-[rgba(243,240,232,0.08)] bg-[#161514] text-[#F3F0E8]">
                  <tr>
                    <th className="p-4 font-semibold">Capability</th>
                    <th className="p-4 font-semibold text-center">Starter (₹499)</th>
                    <th className="p-4 font-semibold text-center text-[#FFAA3D]">Growth (₹999)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(243,240,232,0.06)]">
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">30-Day Quota Allocation</td>
                    <td className="p-4 text-center font-technical">40 Leads</td>
                    <td className="p-4 text-center font-technical text-[#FFAA3D]">100 Leads</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Billing Cycle Duration</td>
                    <td className="p-4 text-center">30 Days</td>
                    <td className="p-4 text-center">30 Days</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">48-Hour Review Window</td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">30-Day Exclusive Claim</td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Access to All 5 Approved Categories</td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Location & City Preferences</td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Multi-Category Distribution</td>
                    <td className="p-4 text-center text-[#9E9B93]"><X className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Priority Delivery Queue</td>
                    <td className="p-4 text-center text-[#9E9B93]"><X className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Inaccuracy Replacement Guarantee</td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                    <td className="p-4 text-center text-[#34D399]"><Check className="w-4 h-4 mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
