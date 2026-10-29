import Link from "next/link";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { APPROVED_CATEGORIES } from "@/lib/constants/categories";
import { SUBSCRIPTION_PLANS } from "@/lib/constants/plans";
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Lock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />

      <main className="flex-1">
        {/* ============================================================
            HERO SECTION — Obsidian × Ember Atmosphere
            ============================================================ */}
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36 border-b border-[rgba(243,240,232,0.06)]">
          {/* Subtle Ambient Radial Ember Lighting */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(232,75,44,0.12)_0%,rgba(200,105,56,0.03)_50%,transparent_70%)] pointer-events-none blur-2xl" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161514] border border-[rgba(232,75,44,0.3)] shadow-[0_0_20px_rgba(232,75,44,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E84B2C] animate-pulse" />
              <span className="font-technical text-xs font-semibold tracking-wider text-[#FFAA3D] uppercase">
                BUSINESS INTELLIGENCE // LEAD NETWORK
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#F3F0E8] max-w-4xl mx-auto leading-[1.08]">
              Your next opportunity.{" "}
              <span className="text-gradient-flame">Already in motion.</span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg text-[#D0CBC1] max-w-2xl mx-auto leading-relaxed">
              Discover curated business prospects in your service category. Spend
              less time searching for potential clients and more time starting
              conversations.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/pricing">
                <Button size="lg" variant="primary" className="w-full sm:w-auto gap-2">
                  Explore Plans
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Hero Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#A39E93]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                Exclusive 30-day claims
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#FFAA3D]" />
                48-hour review window
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#C86938]" />
                Privacy-protected preview
              </span>
            </div>
          </div>
        </section>

        {/* ============================================================
            MANDATORY NOTICE STRIP
            ============================================================ */}
        <section className="bg-[#111110] border-b border-[rgba(243,240,232,0.06)] py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#D0CBC1]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FFAA3D] shrink-0" />
                <span>
                  <strong>Product Notice:</strong> Leads are prospects, not guaranteed customers. Conversion depends on your outreach and pitch.
                </span>
              </div>
              <Link href="/pricing" className="text-[#FFAA3D] hover:underline shrink-0 text-[11px] font-medium">
                View Pricing & Quotas →
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================
            5 APPROVED CATEGORIES (Strict Non-Negotiable)
            ============================================================ */}
        <section className="py-20 md:py-28 border-b border-[rgba(243,240,232,0.06)] relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="font-editorial text-xs font-semibold tracking-widest text-[#FFAA3D] uppercase">
                COMMERCIAL SPECIALIZATION
              </h2>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
                Five Dedicated Service Categories
              </h3>
              <p className="text-sm text-[#A39E93] max-w-xl mx-auto">
                No cluttered subcategories or vague directories. Strictly flat, focused commercial segments sourced manually for genuine business needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {APPROVED_CATEGORIES.map((cat, idx) => (
                <Card
                  key={cat.slug}
                  className="bg-[#111110] hover:bg-[#161514] border-[rgba(243,240,232,0.08)] hover:border-[rgba(232,75,44,0.35)] transition-all group"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="w-10 h-10 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.1)] flex items-center justify-center text-[#FFAA3D] group-hover:text-[#E84B2C] group-hover:border-[rgba(232,75,44,0.4)] transition-colors">
                      <span className="font-technical text-sm font-bold">0{idx + 1}</span>
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-display font-semibold text-sm text-[#F3F0E8] group-hover:text-[#FFAA3D] transition-colors">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-[#A39E93] leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            HOW IT WORKS — 5-Step Process
            ============================================================ */}
        <section className="py-20 md:py-28 border-b border-[rgba(243,240,232,0.06)] bg-[#0D0D0C]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center space-y-3">
              <h2 className="font-editorial text-xs font-semibold tracking-widest text-[#FFAA3D] uppercase">
                OPERATIONAL DISCIPLINE
              </h2>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
                How Arova Works
              </h3>
              <p className="text-sm text-[#A39E93] max-w-xl mx-auto">
                Deterministic lead routing, exclusive 30-day claims, and transparent quota accounting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[
                {
                  step: "01",
                  title: "Choose Category",
                  desc: "Select one of the 5 approved commercial categories tailored to your core service expertise.",
                },
                {
                  step: "02",
                  title: "Subscribe to a Plan",
                  desc: "Select Starter (40 leads / ₹499) or Growth (100 leads / ₹999) with full 30-day quota allocation.",
                },
                {
                  step: "03",
                  title: "Receive Leads",
                  desc: "Paced delivery of prospective leads matched to your service category throughout the billing cycle.",
                },
                {
                  step: "04",
                  title: "Review & Accept",
                  desc: "Inspect generalized requirements in safe preview. You have 48 hours to accept or decline the offer.",
                },
                {
                  step: "05",
                  title: "Claim & Convert",
                  desc: "Unlocked leads are exclusively yours for 30 days. Outreach, pitch, and convert prospects into clients.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-6 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-3 relative overflow-hidden"
                >
                  <div className="font-technical text-2xl font-bold text-[#C86938]">
                    {item.step}
                  </div>
                  <h4 className="font-display font-semibold text-base text-[#F3F0E8]">
                    {item.title}
                  </h4>
                  <p className="text-xs text-[#A39E93] leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            PRICING OVERVIEW
            ============================================================ */}
        <section className="py-20 md:py-28 border-b border-[rgba(243,240,232,0.06)]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center space-y-3">
              <h2 className="font-editorial text-xs font-semibold tracking-widest text-[#FFAA3D] uppercase">
                TRANSPARENT QUOTA ALLOCATIONS
              </h2>
              <h3 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
                Predictable Subscription Plans
              </h3>
              <p className="text-sm text-[#A39E93] max-w-xl mx-auto">
                Fixed 30-day billing periods. Strict quota accounting. No hidden auto-charges or fake guarantees.
              </p>
            </div>

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
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-display text-xl font-bold text-[#F3F0E8]">
                        {plan.name}
                      </h4>
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
                        {plan.leadAllocation} verified leads
                      </strong>
                    </div>

                    <ul className="space-y-2.5 text-xs text-[#D0CBC1]">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Link href={`/signup?plan=${plan.code}`} className="block pt-2">
                      <Button
                        variant={plan.popular ? "primary" : "secondary"}
                        className="w-full"
                      >
                        Subscribe to {plan.name}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <div className="max-w-4xl mx-auto">
              <MandatoryDisclaimerBanner variant="full" />
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
