import type { Metadata } from "next";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { createPageMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbListSchema } from "@/lib/seo/structured-data";
import { JsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import {
  Compass,
  CreditCard,
  Send,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = createPageMetadata({
  title: "How It Works — Sourcing, 48h Review, & 30-Day Exclusive Outreach",
  description:
    "Learn how Arova sources and distributes verified B2B leads. From preference setup and 48-hour offer review to 30-day exclusive outreach claims and data replacement guarantees.",
  path: "/how-it-works",
  keywords: [
    "how Arova works",
    "B2B lead delivery process",
    "exclusive lead distribution",
    "lead claim timer",
    "48 hour review window",
  ],
});

export default function HowItWorksPage() {
  const breadcrumbJsonLd = buildBreadcrumbListSchema([
    { name: "How It Works", path: "/how-it-works" },
  ]);

  const steps = [
    {
      num: "01",
      icon: Compass,
      title: "Select Service Category & Location Preferences",
      description:
        "Select from our five strictly flat commercial categories: Programming & Software, Video Editing & Production, Digital Marketing & SEO, Website & E-commerce, or Business Automation & AI. Specify your regional or city target focus.",
      highlight: "5 flat categories, no noisy hierarchies.",
    },
    {
      num: "02",
      icon: CreditCard,
      title: "Choose a Fixed Quota Subscription Plan",
      description:
        "Select between the Starter plan (40 leads for ₹499/30 days) and Growth plan (100 leads for ₹999/30 days). Pre-subscription requests of 1–9 preview leads can also be submitted before subscribing.",
      highlight: "Durable ledger accounting in integer paise.",
    },
    {
      num: "03",
      icon: Send,
      title: "Paced Lead Deliveries & 48-Hour Review",
      description:
        "Leads are distributed smoothly throughout your billing period. When a prospective lead matches your criteria, it arrives with a safe preview masking revealing contact details. Quota is reserved, and you have exactly 48 hours to accept or decline.",
      highlight: "No sudden lead dumps; steady weekly pipeline.",
    },
    {
      num: "04",
      icon: Eye,
      title: "Acceptance & Unlocking of Contact Provenance",
      description:
        "Upon accepting an offer, the reservation converts into consumed quota. Full business contact details, phone numbers, verified emails, and registry source URLs are immediately revealed in your dashboard.",
      highlight: "Atomic transitions protect quota accuracy.",
    },
    {
      num: "05",
      icon: Shield,
      title: "30-Day Exclusive Outreach Claim",
      description:
        "Accepted leads remain exclusively claimed by you for 30 full days. We never pitch or resell an actively claimed prospect to another subscriber. You reach out, pitch your services, and convert the prospect.",
      highlight: "Zero internal competition on active prospects.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />
      <JsonLd data={breadcrumbJsonLd} />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="flame" size="sm">
              ENGINEERING & WORKFLOW
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#F3F0E8]">
              How Arova Operates
            </h1>
            <p className="text-sm sm:text-base text-[#D0CBC1] leading-relaxed">
              A disciplined, deterministic lead intelligence platform designed for freelancers, agencies, and service studios.
            </p>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-8 max-w-4xl mx-auto">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="rounded-[14px] bg-[#111110] border border-[rgba(243,240,232,0.08)] p-8 flex flex-col md:flex-row items-start gap-6 hover:border-[rgba(232,75,44,0.3)] transition-colors"
                >
                  <div className="w-14 h-14 rounded-[10px] bg-[#161514] border border-[rgba(243,240,232,0.12)] flex items-center justify-center shrink-0 text-[#FFAA3D]">
                    <Icon className="w-7 h-7 text-[#E84B2C]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-technical text-xs font-semibold text-[#C86938] uppercase tracking-wider">
                        Step {step.num}
                      </span>
                      <span className="text-[11px] font-technical text-[#9E9B93]">
                        {step.highlight}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-[#F3F0E8]">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A39E93] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Offer Rules Diagram & Explanations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-6 bg-[#161514] border-[rgba(52,211,153,0.3)] space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#34D399]" />
                <h4 className="font-display font-semibold text-base text-[#F3F0E8]">
                  Offer Acceptance Flow
                </h4>
              </div>
              <p className="text-xs text-[#D0CBC1] leading-relaxed">
                When you accept an offered lead within 48 hours, 1 reserved quota unit is converted to consumed quota. The lead is locked to you for 30 days. No other customer can view or claim it during this window.
              </p>
            </Card>

            <Card className="p-6 bg-[#161514] border-[rgba(232,75,44,0.3)] space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#FFAA3D]" />
                <h4 className="font-display font-semibold text-base text-[#F3F0E8]">
                  48-Hour Expiry & Rejection Flow
                </h4>
              </div>
              <p className="text-xs text-[#D0CBC1] leading-relaxed">
                If you reject the offer or if 48 hours elapse without an action, the 1 reserved quota unit is immediately released back to your remaining balance. The lead returns to inventory for others.
              </p>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center space-y-6 max-w-2xl mx-auto pt-6">
            <MandatoryDisclaimerBanner variant="full" />
            <Link href="/pricing" className="inline-block">
              <Button size="lg" variant="primary" className="gap-2">
                Get Started with Arova
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

