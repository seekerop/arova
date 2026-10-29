"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(243,240,232,0.08)] bg-[#080505]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[rgba(232,75,44,0.35)] shadow-[0_0_15px_rgba(232,75,44,0.25)] flex items-center justify-center bg-[#111110]">
            <Image
              src="/arenova.png"
              alt="Arenova"
              width={28}
              height={28}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-wider text-[#F3F0E8] group-hover:text-[#FFAA3D] transition-colors">
              AROVA
            </span>
            <span className="text-[9px] font-medium tracking-widest text-[#A39E93] uppercase">
              By Arenova
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#D0CBC1]">
          <Link
            href="/how-it-works"
            className="hover:text-[#F3F0E8] transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/categories"
            className="hover:text-[#F3F0E8] transition-colors"
          >
            Categories
          </Link>
          <Link
            href="/pricing"
            className="hover:text-[#F3F0E8] transition-colors"
          >
            Pricing
          </Link>
          <Link href="/faq" className="hover:text-[#F3F0E8] transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="primary" size="sm" className="gap-1.5">
              Explore Plans
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#D0CBC1] hover:text-[#F3F0E8]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[rgba(243,240,232,0.08)] bg-[#111110] px-4 pt-2 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#D0CBC1]">
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#F3F0E8]"
            >
              How It Works
            </Link>
            <Link
              href="/categories"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#F3F0E8]"
            >
              Categories
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#F3F0E8]"
            >
              Pricing
            </Link>
            <Link
              href="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#F3F0E8]"
            >
              FAQ
            </Link>
          </nav>
          <div className="flex flex-col gap-2 pt-2 border-t border-[rgba(243,240,232,0.06)]">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="secondary" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="primary" className="w-full">
                Explore Plans
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
