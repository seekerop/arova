"use client";

import { useState } from "react";
import Script from "next/script";
import { DashboardHeader } from "@/components/navigation/dashboard-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  MandatoryDisclaimerBanner,
  DisclaimerAcknowledgementCheckbox,
} from "@/components/ui/disclaimer";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/plans";
import { useDashboardUser } from "@/components/providers/dashboard-user-context";
import { formatDate } from "@/lib/utils";
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function SubscriptionPage() {
  const { user, loading, refreshUser } = useDashboardUser();
  const [acknowledged, setAcknowledged] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isSubscriber = Boolean(user?.isSubscriber && user?.subscription);
  const activePlanCode = user?.subscription?.planCode || null;

  const daysRemaining = user?.subscription?.currentPeriodEnd
    ? Math.max(
        0,
        Math.ceil(
          (new Date(user.subscription.currentPeriodEnd).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const handleSubscribe = async (planCode: "starter" | "growth") => {
    if (!acknowledged) {
      alert("Please acknowledge the lead limitations disclaimer before subscribing.");
      return;
    }
    setUpgrading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/payments/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planCode,
          disclosureAcknowledged: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      // Check if Razorpay script is loaded or mock simulation
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: data.keyId,
          subscription_id: data.subscriptionId,
          name: "AROVA by Arenova",
          description: `${planCode.toUpperCase()} Plan Subscription`,
          image: "/arenova.png",
          handler: async function (response: any) {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                subscriptionId: data.subscriptionId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });
            if (verifyRes.ok) {
              await refreshUser();
              setMessage(`Subscription successfully activated! Your ${planCode} quota has been allocated.`);
            }
          },
          theme: {
            color: "#E84B2C",
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback for development sandbox testing
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscriptionId: data.subscriptionId,
            paymentId: `pay_test_${Date.now()}`,
            signature: "test_sandbox_sig",
          }),
        });
        if (verifyRes.ok) {
          await refreshUser();
          setMessage(`[Test Sandbox Mode] Subscription successfully activated! Your ${planCode} quota has been allocated.`);
        } else {
          await refreshUser();
          setMessage(`Subscription order created: ${data.subscriptionId}.`);
        }
      }
    } catch (err: any) {
      setMessage(`Payment error: ${err.message}`);
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <DashboardHeader
        title="Subscription Management"
        subtitle="Manage plan allocations, quota periods, and renewals"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
        <MandatoryDisclaimerBanner variant="full" />

        {/* Current Active Plan Card */}
        <Card className="p-6 md:p-8 bg-[#111110] border-[rgba(232,75,44,0.3)] shadow-[0_0_35px_-5px_rgba(232,75,44,0.15)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#FFAA3D] uppercase tracking-wider flex items-center gap-1.5">
                {isSubscriber ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-[#34D399]" />
                    CURRENT ACTIVE PLAN
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#FFAA3D]" />
                    SUBSCRIPTION STATUS
                  </>
                )}
              </span>
              <h2 className="font-display text-2xl font-bold text-[#F3F0E8] mt-1 capitalize">
                {loading
                  ? "Loading subscription status..."
                  : isSubscriber
                  ? `${user?.subscription?.planName || activePlanCode} Plan`
                  : "Free Account (No Active Plan)"}
              </h2>
              <p className="text-xs text-[#A39E93]">
                {isSubscriber
                  ? activePlanCode === "starter"
                    ? "₹499 / 30 days · 40 leads allocated per billing cycle"
                    : "₹999 / 30 days · 100 leads allocated per billing cycle"
                  : "You do not have an active subscription. Choose a plan below to start receiving verified leads."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#FFAA3D]" />
              ) : isSubscriber ? (
                <>
                  <Badge variant="success" size="md">
                    Active & Verified
                  </Badge>
                  {daysRemaining !== null && (
                    <Badge variant="muted" size="md">
                      Renews in {daysRemaining} {daysRemaining === 1 ? "Day" : "Days"}
                    </Badge>
                  )}
                </>
              ) : (
                <Badge variant="warning" size="md">
                  No Active Plan
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] text-xs">
            <div>
              <span className="text-[#A39E93] block">Billing Cycle:</span>
              <strong className="text-[#F3F0E8] font-technical">
                {isSubscriber ? "30 Days (Monthly)" : "Inactive"}
              </strong>
            </div>
            <div>
              <span className="text-[#A39E93] block">Allocated Quota:</span>
              <strong className="text-[#FFAA3D] font-technical">
                {isSubscriber
                  ? `${user?.subscription?.leadAllocation || 0} Prospects`
                  : "0 Prospects (Subscribe to activate)"}
              </strong>
            </div>
            <div>
              <span className="text-[#A39E93] block">Exclusive Claim Window:</span>
              <strong className="text-[#34D399] font-technical">
                {isSubscriber ? "30 Days Exclusivity" : "Locked"}
              </strong>
            </div>
          </div>
        </Card>

        {/* Pre-purchase / Change Plan Acknowledgment */}
        <DisclaimerAcknowledgementCheckbox
          checked={acknowledged}
          onChange={setAcknowledged}
        />

        {message && (
          <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(232,75,44,0.4)] text-xs text-[#FFAA3D] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Plan Selection Options */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-bold text-[#F3F0E8]">
            Available Plans
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent = activePlanCode === plan.code;
              return (
                <Card
                  key={plan.code}
                  className={`p-6 bg-[#111110] border ${
                    isCurrent
                      ? "border-[rgba(52,211,153,0.4)]"
                      : "border-[rgba(243,240,232,0.08)] hover:border-[rgba(232,75,44,0.3)]"
                  } space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-base text-[#F3F0E8]">
                      {plan.name}
                    </h4>
                    {isCurrent && (
                      <Badge variant="success" size="sm">
                        Current
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-[#F3F0E8]">
                      ₹{plan.priceINR}
                    </span>
                    <span className="text-xs text-[#A39E93]">/ 30 days</span>
                  </div>

                  <p className="text-xs text-[#D0CBC1]">{plan.disclaimer}</p>

                  <ul className="space-y-2 text-xs text-[#A39E93] pt-2">
                    {plan.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={isCurrent ? "secondary" : "primary"}
                    disabled={isCurrent || upgrading || !acknowledged}
                    onClick={() => handleSubscribe(plan.code)}
                    className="w-full text-xs mt-2"
                  >
                    {isCurrent
                      ? "Active Plan"
                      : isSubscriber
                      ? `Switch to ${plan.name}`
                      : `Subscribe to ${plan.name}`}
                  </Button>
                </Card>
              );
            })}
          </div>

          {/* Razorpay Trust & Compliance Notice */}
          <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] text-[11px] text-[#A39E93] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
              <span>
                100% Secure Checkout via <strong>Razorpay</strong> · All major UPI apps, RuPay, Visa, MasterCard & NetBanking accepted.
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] shrink-0">
              <a href="/terms" target="_blank" className="hover:text-[#FFAA3D] underline">
                Terms of Service
              </a>
              <span>·</span>
              <a href="/refund-policy" target="_blank" className="hover:text-[#FFAA3D] underline">
                Cancellation & Refund Policy
              </a>
              <span>·</span>
              <a href="/shipping-policy" target="_blank" className="hover:text-[#FFAA3D] underline">
                Digital Fulfillment
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
