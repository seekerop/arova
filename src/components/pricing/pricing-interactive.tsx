"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DisclaimerAcknowledgementCheckbox } from "@/components/ui/disclaimer";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/plans";
import { Check, ArrowRight } from "lucide-react";

export function PricingInteractive() {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="space-y-12">
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
    </div>
  );
}

