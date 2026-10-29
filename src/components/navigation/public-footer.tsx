import Link from "next/link";
import Image from "next/image";
import { MandatoryDisclaimerBanner } from "@/components/ui/disclaimer";

export function PublicFooter() {
  return (
    <footer className="border-t border-[rgba(243,240,232,0.08)] bg-[#080505] pt-12 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[rgba(232,75,44,0.35)] flex items-center justify-center bg-[#111110]">
                <Image
                  src="/arenova.png"
                  alt="Arenova"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <span className="font-display text-lg font-bold tracking-wider text-[#F3F0E8]">
                AROVA
              </span>
            </div>
            <p className="text-xs text-[#A39E93] max-w-md leading-relaxed">
              Arova is Arenova’s curated business lead intelligence network. Connecting agencies and freelancers with prospective clients in 5 specialized commercial categories across India.
            </p>
            <div className="text-[11px] font-technical text-[#9E9B93]">
              ARENOVA ECOSYSTEM · BUSINESS INTELLIGENCE PLATFORM
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F3F0E8]">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#A39E93]">
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
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#FFAA3D] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#F3F0E8]">
              Legal & Compliance
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
                  Refund & Replacement Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#FFAA3D] transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Mandatory Disclaimer Callout */}
        <MandatoryDisclaimerBanner variant="full" />

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-[rgba(243,240,232,0.06)] text-[11px] text-[#9E9B93] gap-4">
          <p>© {new Date().getFullYear()} AROVA. An Arenova Ecosystem Property. All rights reserved.</p>
          <p>Cinematic Obsidian × Ember Intelligence System</p>
        </div>
      </div>
    </footer>
  );
}
