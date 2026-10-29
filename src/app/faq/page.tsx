import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import Link from "next/link";
import { HelpCircle, AlertCircle } from "lucide-react";

export default function FAQPage() {
  const faqs = [
    {
      q: "What is Arova and what does it provide?",
      a: "Arova is a subscription-based commercial lead intelligence service under the Arenova ecosystem. Our operators manually identify and verify registered businesses across India that show active requirements in our 5 approved service categories: Programming & Software, Video Editing, Digital Marketing, Websites, and Business Automation.",
    },
    {
      q: "Does Arova guarantee clients, revenue, or closed deals?",
      a: "No. Arova provides potential business leads, NOT guaranteed business opportunities. Leads are prospective companies, not guaranteed customers. Leads are not guaranteed to respond, convert, or generate revenue. You are responsible for contacting each business, pitching your services, following up, negotiating, and closing your own contracts.",
    },
    {
      q: "How does the 48-hour offer window work?",
      a: "When a matched lead is delivered to your dashboard, 1 quota unit is reserved from your balance. You have 48 hours to inspect the generalized business requirement and location in safe preview mode. If you accept, 1 quota unit is consumed and contact details unlock. If you decline or if 48 hours pass without an action, the reserved quota is immediately restored to your account.",
    },
    {
      q: "What does the 30-day exclusive claim guarantee?",
      a: "When you accept a lead, it is exclusively claimed by you for 30 consecutive calendar days. During this period, the lead is completely locked out from other subscribers and will never be offered to another customer.",
    },
    {
      q: "Can I request leads before paying for a subscription?",
      a: "Yes. Signed-in users can request a customized pre-subscription batch of 1 to 9 leads. Our team reviews and prepares the batch (typically ready in 1–2 hours). You can preview the safe generalized requirements for free; full contact profiles unlock when you subscribe to Starter or Growth.",
    },
    {
      q: "What happens if a lead's phone number or email is invalid?",
      a: "We maintain an active lead feedback workflow. If you discover a disconnected number, invalid email, or closed business within 7 days of claiming, you can submit a report directly from the lead details page. Our administration team reviews the report and credits a replacement lead to your quota upon verification.",
    },
    {
      q: "How does subscription billing and cancellation work?",
      a: "Subscriptions are billed through Razorpay every 30 days. You can cancel renewal at any time from your dashboard billing settings. Cancellation stops future recurring charges while allowing you full access to your remaining quota and claimed leads until the end of your current 30-day billing cycle.",
    },
    {
      q: "Why are there only 5 flat categories with no subcategories?",
      a: "To maintain uncompromising lead quality and clear routing. Nested hierarchies and fuzzy subcategories dilute prospect relevance. Our 5 flat categories represent distinct commercial service requirements with dedicated manual verification pipelines.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="amber" size="sm">
              CLARITY & COMPLIANCE
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#F3F0E8]">
              Frequently Asked Questions
            </h1>
            <p className="text-sm sm:text-base text-[#D0CBC1] leading-relaxed">
              Transparent answers regarding our lead sourcing, quota accounting, exclusivity claims, and operational guidelines.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <MandatoryDisclaimerBanner variant="full" />
          </div>

          {/* FAQ Accordion / Cards */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] p-6 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-[#FFAA3D] shrink-0 mt-0.5" />
                  <h3 className="font-display text-base font-semibold text-[#F3F0E8]">
                    {faq.q}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#A39E93] pl-8 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-[#A39E93] pt-4">
            Have more questions? Visit our{" "}
            <Link href="/contact" className="text-[#FFAA3D] hover:underline">
              Contact & Support page
            </Link>{" "}
            or review our{" "}
            <Link href="/terms" className="text-[#FFAA3D] hover:underline">
              Terms of Service
            </Link>
            .
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
