import Link from "next/link";
import Image from "next/image";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";
import { BUSINESS_CONFIG } from "@/lib/constants/business";
import { ShieldCheck, Lock, CreditCard, MapPin, Phone, Mail } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-[rgba(243,240,232,0.08)] bg-[#080505] pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info & Operating Entity */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[rgba(232,75,44,0.35)] flex items-center justify-center bg-[#111110]">
                <Image
                  src="/arenova.png"
                  alt="Arenova"
                  width={26}
                  height={26}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg font-bold tracking-wider text-[#F3F0E8]">
                  AROVA
                </span>
                <span className="text-[10px] font-technical tracking-wider text-[#A39E93]">
                  BY {BUSINESS_CONFIG.legalEntityName.toUpperCase()}
                </span>
              </div>
            </div>
            <p className="text-xs text-[#A39E93] max-w-md leading-relaxed">
              Curated B2B lead intelligence and qualified commercial discovery platform. Connecting software developers, creative studios, and marketing agencies with verified business opportunities across India.
            </p>

            {/* Operating Address (Razorpay Mandatory Disclosure) */}
            <div className="pt-2 space-y-1.5 text-[11px] text-[#A39E93] border-t border-[rgba(243,240,232,0.06)]">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FFAA3D] shrink-0 mt-0.5" />
                <span>{BUSINESS_CONFIG.registeredAddress.formatted}</span>
              </div>
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#34D399]" />
                  <span className="font-technical text-[#F3F0E8]">{BUSINESS_CONFIG.contact.helplinePhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#E84B2C]" />
                  <a href={`mailto:${BUSINESS_CONFIG.contact.supportEmail}`} className="hover:text-[#FFAA3D] underline">
                    {BUSINESS_CONFIG.contact.supportEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F3F0E8]">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#A39E93]">
              <li>
                <Link href="/about" className="hover:text-[#FFAA3D] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#FFAA3D] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#FFAA3D] transition-colors">
                  Approved Categories
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-[#FFAA3D] transition-colors">
                  Subscription Plans (INR)
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#FFAA3D] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Statutory Policies (Razorpay Mandatory Links) */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F3F0E8]">
              Policies & Compliance
            </h4>
            <ul className="space-y-2 text-xs text-[#A39E93]">
              <li>
                <Link href="/terms" className="hover:text-[#FFAA3D] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FFAA3D] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#FFAA3D] transition-colors">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="hover:text-[#FFAA3D] transition-colors">
                  Shipping & Delivery Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FFAA3D] transition-colors">
                  Contact Support & Grievance
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment Trust & Gateway Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F3F0E8]">
              Payment Security
            </h4>
            <div className="p-3.5 rounded-[10px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-2.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-[#34D399] font-medium">
                <ShieldCheck className="w-4 h-4 text-[#34D399] shrink-0" />
                <span>Secured by Razorpay</span>
              </div>
              <p className="text-[10px] text-[#A39E93] leading-relaxed">
                PCI-DSS Level 1 Compliant. Encrypted via 256-bit TLS bank-grade security.
              </p>
              <div className="pt-1.5 border-t border-[rgba(243,240,232,0.06)] flex flex-wrap gap-1 text-[9px] font-technical text-[#FFAA3D]">
                <span className="px-1.5 py-0.5 rounded bg-[#161514] border border-[rgba(255,170,61,0.2)]">UPI</span>
                <span className="px-1.5 py-0.5 rounded bg-[#161514] border border-[rgba(255,170,61,0.2)]">Cards</span>
                <span className="px-1.5 py-0.5 rounded bg-[#161514] border border-[rgba(255,170,61,0.2)]">NetBanking</span>
                <span className="px-1.5 py-0.5 rounded bg-[#161514] border border-[rgba(255,170,61,0.2)]">Wallets</span>
              </div>
            </div>
            <p className="text-[10px] text-[#9E9B93]">
              Refund SLA: Credited to source within 5–7 working days.
            </p>
          </div>
        </div>

        {/* Mandatory Disclaimer Callout */}
        <MandatoryDisclaimerBanner variant="full" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[rgba(243,240,232,0.06)] text-[11px] text-[#9E9B93] gap-4">
          <p>
            © {new Date().getFullYear()} {BUSINESS_CONFIG.legalEntityName}. All rights reserved. Operating {BUSINESS_CONFIG.brandName} as a B2B intelligence platform.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/terms" className="hover:text-[#FFAA3D] transition-colors">
              Terms
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-[#FFAA3D] transition-colors">
              Privacy
            </Link>
            <span>·</span>
            <Link href="/refund-policy" className="hover:text-[#FFAA3D] transition-colors">
              Refunds
            </Link>
            <span>·</span>
            <Link href="/shipping-policy" className="hover:text-[#FFAA3D] transition-colors">
              Shipping & Delivery
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
