import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-3">
            <Badge variant="muted" size="sm">
              DATA PRIVACY & INTEGRITY
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
              Privacy Policy
            </h1>
            <p className="text-xs text-[#9E9B93]">Last updated: October 2026 · Version 2026.1</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#D0CBC1] leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                1. Sourced Commercial Business Information
              </h2>
              <p>
                Arova processes publicly available commercial data regarding registered businesses and corporate entities. We do not harvest, store, or sell sensitive consumer personal data, credit card numbers, or non-commercial private records.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                2. Subscriber Account Data
              </h2>
              <p>
                When you create an account, we collect your email address, business name, and payment confirmation IDs. Payments are handled authoritatively by Razorpay; Arova never stores your raw credit card numbers or UPI MPINs.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                3. Lead Contact Privacy Protection
              </h2>
              <p>
                To prevent spam and protect business records, lead contact details (direct phone, email, and registry profile URLs) remain completely shielded behind database access rules until a subscriber authoritatively accepts an offer and claims the lead.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                4. Data Subject Rights & Removal Requests
              </h2>
              <p>
                If your business is listed in Arova’s commercial directory and you wish to update or remove your public commercial contact information, you may submit a removal request to support@arova.io. Legitimate verification requests are honored within 48 business hours.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

