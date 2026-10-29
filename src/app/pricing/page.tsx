"use client";

import { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  MandatoryDisclaimerBanner,
  DisclaimerAcknowledgementCheckbox,
} from "@/components/ui/disclaimer";
import { SUBSCRIPTION_PLANS, PlanCode } from "@/lib/constants/plans";
import { Check, X, ShieldAlert, Zap, ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />

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

          {/* Mandatory Pre-Checkout Acknowledgement Checkbox */}
          <div className="max-w-2xl mx-auto">
            <DisclaimerAcknowledgementCheckbox
              checked={acknowledged}
              onChange={setAcknowledged}
            />
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card
                key={plan.code}
                className={`bg-[#111110] p-8 border ${
                  plan.popular
                    ? "border-[rgba(232,75,44,0.4)] shadow-[0_0_35px_-5px_rgba(232,75,44,0.25)] relative"
                    : "border-[rgba(243,240,232,0.1)]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-6">
                    <Badge variant="flame" size="sm">
                      Recommended
                    </Badge>
                  </div>
                )}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-[#F3F0E8]">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#A39E93] mt-1">{plan.disclaimer}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-bold text-[#F3F0E8]">
                      ₹{plan.priceINR}
                    </span>
                    <span className="text-xs text-[#A39E93]">/ 30 days</span>
                  </div>

                  <div className="p-3 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] flex items-center justify-between text-xs">
                    <span className="text-[#D0CBC1]">Lead Allocation:</span>
                    <strong className="font-technical text-[#FFAA3D] text-sm">
                      {plan.leadAllocation} prospects
                    </strong>
                  </div>

                  <ul className="space-y-3 text-xs text-[#D0CBC1]">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-[#34D399] shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    {acknowledged ? (
                      <Link href={`/signup?plan=${plan.code}`} className="block">
                        <Button
                          variant={plan.popular ? "primary" : "secondary"}
                          className="w-full gap-2"
                        >
                          Select {plan.name}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    ) : (
                      <div className="space-y-2">
                        <Button
                          disabled
                          variant={plan.popular ? "primary" : "secondary"}
                          className="w-full"
                        >
                          Select {plan.name}
                        </Button>
                        <p className="text-[11px] text-center text-[#FFAA3D]">
                          Please acknowledge the limitation notice above to proceed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Full Disclaimer Banner */}
          <div className="max-w-4xl mx-auto">
            <MandatoryDisclaimerBanner variant="full" />
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto space-y-6 pt-8">
            <h3 className="font-display text-xl font-bold text-[#F3F0E8] text-center">
              Feature Comparison
            </h3>

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
                    <td className="p-4 font-medium text-[#F3F0E8]">Offer Review Deadline</td>
                    <td className="p-4 text-center">48 Hours</td>
                    <td className="p-4 text-center">48 Hours</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Exclusive Outreach Claim</td>
                    <td className="p-4 text-center">30 Days</td>
                    <td className="p-4 text-center">30 Days</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">5 Approved Categories Support</td>
                    <td className="p-4 text-center"><Check className="w-4 h-4 text-[#34D399] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="w-4 h-4 text-[#34D399] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Pre-Subscription Request Unlock (1-9)</td>
                    <td className="p-4 text-center"><Check className="w-4 h-4 text-[#34D399] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="w-4 h-4 text-[#34D399] mx-auto" /></td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Multi-Category Distribution</td>
                    <td className="p-4 text-center text-[#A39E93]">Single Category Focus</td>
                    <td className="p-4 text-center text-[#34D399] font-medium">Multi-Category Supported</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-[#F3F0E8]">Inaccurate Lead Replacement Policy</td>
                    <td className="p-4 text-center"><Check className="w-4 h-4 text-[#34D399] mx-auto" /></td>
                    <td className="p-4 text-center"><Check className="w-4 h-4 text-[#34D399] mx-auto" /></td>
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

