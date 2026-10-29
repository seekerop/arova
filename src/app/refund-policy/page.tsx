import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Badge } from "@/components/ui/badge";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-3">
            <Badge variant="amber" size="sm">
              FAIR DATA GUARANTEE
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
              Refund & Replacement Policy
            </h1>
            <p className="text-xs text-[#9E9B93]">Last updated: October 2026 · Version 2026.1</p>
          </div>

          <MandatoryDisclaimerBanner variant="full" />

          <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#D0CBC1] leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                1. Core Replacement Principle
              </h2>
              <p>
                Arova operates on a fair data quality replacement model. If a claimed business lead contains provably inaccurate contact information (such as a disconnected phone number, permanent email bounce, or permanently closed entity), we provide a replacement lead credit to your quota.
              </p>
            </section>

            {/* Distinction Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <Card className="p-6 bg-[#161514] border-[rgba(52,211,153,0.3)] space-y-3">
                <div className="flex items-center gap-2 text-[#34D399] font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  Eligible for Quota Replacement
                </div>
                <ul className="space-y-2 text-xs text-[#D0CBC1]">
                  <li>• Phone number out of service or belongs to unrelated party</li>
                  <li>• Hard email bounce (mailbox does not exist)</li>
                  <li>• Business dissolved, closed, or ceased trading</li>
                  <li>• Duplicate lead delivered within the same 30-day window</li>
                  <li>• Lead category blatantly mismatched with requirement</li>
                </ul>
              </Card>

              <Card className="p-6 bg-[#161514] border-[rgba(232,75,44,0.3)] space-y-3">
                <div className="flex items-center gap-2 text-[#FFAA3D] font-semibold text-sm">
                  <XCircle className="w-4 h-4 shrink-0" />
                  Ineligible for Replacement / Refund
                </div>
                <ul className="space-y-2 text-xs text-[#D0CBC1]">
                  <li>• Prospect does not answer calls or respond to email inquiries</li>
                  <li>• Prospect states they do not currently need services</li>
                  <li>• Prospect declines proposal, price quote, or pitch</li>
                  <li>• Prospect has already hired another vendor</li>
                  <li>• Expired offers that were not reviewed in 48 hours</li>
                </ul>
              </Card>
            </div>

            <section className="space-y-3 pt-4">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                2. Subscription Fee Refunds
              </h2>
              <p>
                Subscription purchases (₹499 Starter / ₹999 Growth) cover the immediate infrastructure cost of manual curation and server resources. Subscription fees are generally non-refundable once leads have been accessed or claimed. If a technical failure on Arova’s side prevents lead delivery and cannot be resolved, an administrative prorated refund may be issued via Razorpay.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                3. How to Submit a Replacement Request
              </h2>
              <p>
                Navigate to your claimed lead in your dashboard and click <strong>“Report Data Issue”</strong>. Provide the issue type and proof (such as a bounce screenshot or call recording confirmation). Our support team investigates and responds within 24–48 business hours.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

