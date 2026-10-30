"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export function ContactForm() {
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
    <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)]">
      {submitted ? (
        <div className="text-center py-12 space-y-4">
          <div className="w-12 h-12 rounded-full bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.3)] flex items-center justify-center mx-auto text-[#34D399]">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-display text-xl font-bold text-[#F3F0E8]">
            Message Received
          </h3>
          <p className="text-xs text-[#A39E93] max-w-sm mx-auto">
            Thank you for reaching out. An Arova ecosystem specialist will review your inquiry and follow up via email within 24 operational hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="text-xs font-medium text-[#D0CBC1]">
              Full Name
            </label>
            <Input
              id="contact-name"
              required
              placeholder="e.g. Vikram Malhotra"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="text-xs font-medium text-[#D0CBC1]">
              Work Email
            </label>
            <Input
              id="contact-email"
              type="email"
              required
              placeholder="e.g. vikram@yourcompany.com"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-subject" className="text-xs font-medium text-[#D0CBC1]">
              Subject
            </label>
            <Input
              id="contact-subject"
              required
              placeholder="e.g. Enterprise lead allocation inquiry"
              className="text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="text-xs font-medium text-[#D0CBC1]">
              Message
            </label>
            <Textarea
              id="contact-message"
              required
              rows={4}
              placeholder="Tell us about your team size, service category focus, or specific technical question..."
              className="text-xs resize-none"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full text-xs"
            disabled={loading}
          >
            {loading ? "Sending Message..." : "Send Inquiry"}
          </Button>
        </form>
      )}
    </Card>
  );
}

