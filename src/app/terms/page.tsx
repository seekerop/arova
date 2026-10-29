import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="space-y-3">
            <Badge variant="muted" size="sm">
              LEGAL AGREEMENT
            </Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F3F0E8]">
              Terms of Service
            </h1>
            <p className="text-xs text-[#9E9B93]">Last updated: October 2026 · Version 2026.1</p>
          </div>

          <MandatoryDisclaimerBanner variant="full" />

          <div className="prose prose-invert max-w-none space-y-8 text-xs sm:text-sm text-[#D0CBC1] leading-relaxed">
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                1. Acceptance of Terms & Brand Ecosystem
              </h2>
              <p>
                By creating an account, requesting leads, or subscribing to Arova (an Arenova ecosystem platform), you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not access or use the platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                2. Nature of Service & Lead Limitation Notice
              </h2>
              <p>
                Arova provides curated prospective commercial lead records manually sourced from registered business records, trade filings, and public commercial announcements.
              </p>
              <div className="p-4 rounded-[8px] bg-[#161514] border border-[rgba(232,75,44,0.3)] text-xs text-[#FFAA3D]">
                <strong>Strict Non-Guarantee Disclaimer:</strong> Leads are prospects, not guaranteed customers or revenue. Arova does not promise, represent, or warrant that any prospective business will respond to inquiries, accept proposals, enter negotiations, or pay for services. You are solely responsible for outreach etiquette, pitch quality, pricing, and business execution.
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                3. Subscriptions & Quota Allocations
              </h2>
              <p>
                Starter (40 leads per 30-day period @ ₹499) and Growth (100 leads per 30-day period @ ₹999) provide allocated prospect records. Quotas are recorded in our durable ledger. Unused allocations do not roll over to future periods unless explicitly granted as a documented inventory replacement.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                4. 48-Hour Review Window & 30-Day Exclusive Claim
              </h2>
              <p>
                Each lead delivery enters a 48-hour pending review window with 1 reserved quota unit. If you accept the offer, the reservation converts into 1 consumed quota unit and grants an exclusive 30-day claim. No other subscriber may access that lead during your 30-day window. If not accepted within 48 hours, the offer automatically expires and the reservation is restored.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-[#F3F0E8]">
                5. Prohibited Use & Commercial Compliance
              </h2>
              <p>
                You agree not to use lead contact data for unlawful spam, unsolicited bulk robocalls, harassing communications, or resale to third parties. Any unauthorized sharing or reselling of claimed lead records results in immediate account suspension with forfeiture of active quota.
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

