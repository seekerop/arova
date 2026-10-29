"use client";

import { useState } from "react";
import { PublicHeader } from "@/components/navigation/public-header";
import { PublicFooter } from "@/components/navigation/public-footer";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Mail, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080505]">
      <PublicHeader />

      <main className="flex-1 py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge variant="amber" size="sm">
              SUPPORT & INQUIRIES
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-[#F3F0E8]">
              Contact the Arova Team
            </h1>
            <p className="text-sm sm:text-base text-[#D0CBC1] leading-relaxed">
              Have questions regarding our subscriptions, enterprise quota allocations, or custom category requirements? We respond promptly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="p-6 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-3">
                <Mail className="w-5 h-5 text-[#E84B2C]" />
                <h3 className="font-display text-sm font-semibold text-[#F3F0E8]">
                  Direct Support
                </h3>
                <p className="text-xs text-[#A39E93]">
                  support@arova.io<br />
                  arenovalabs@gmail.com
                </p>
              </div>

              <div className="p-6 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-3">
                <Clock className="w-5 h-5 text-[#FFAA3D]" />
                <h3 className="font-display text-sm font-semibold text-[#F3F0E8]">
                  Operational Hours
                </h3>
                <p className="text-xs text-[#A39E93]">
                  Monday to Saturday<br />
                  10:00 AM – 7:00 PM IST (Asia/Kolkata)
                </p>
              </div>

              <div className="p-6 rounded-[12px] bg-[#111110] border border-[rgba(243,240,232,0.08)] space-y-3">
                <ShieldCheck className="w-5 h-5 text-[#34D399]" />
                <h3 className="font-display text-sm font-semibold text-[#F3F0E8]">
                  Arenova Ecosystem
                </h3>
                <p className="text-xs text-[#A39E93]">
                  Cinematic Obsidian & Ember Lead Intelligence Suite
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)]">
                {submitted ? (
                  <div className="text-center py-12 space-y-4">
                    <CheckCircle2 className="w-12 h-12 text-[#34D399] mx-auto" />
                    <h3 className="font-display text-xl font-bold text-[#F3F0E8]">
                      Message Received
                    </h3>
                    <p className="text-xs text-[#D0CBC1] max-w-sm mx-auto">
                      Thank you for contacting Arova. Our team will review your message and reply via email within 24 business hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#D0CBC1]">
                          Your Name
                        </label>
                        <Input required placeholder="Akash Sharma" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-[#D0CBC1]">
                          Email Address
                        </label>
                        <Input required type="email" placeholder="akash@agency.com" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#D0CBC1]">
                        Subject
                      </label>
                      <Input required placeholder="Inquiry about Starter Plan or Custom Request" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#D0CBC1]">
                        Message
                      </label>
                      <Textarea
                        required
                        rows={5}
                        placeholder="Please describe your question or agency requirements..."
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full"
                      isLoading={loading}
                    >
                      Send Message
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
