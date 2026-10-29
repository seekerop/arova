"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#080505] relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[rgba(232,75,44,0.35)] flex items-center justify-center bg-[#111110]">
              <Image
                src="/arenova.png"
                alt="Arenova"
                width={26}
                height={26}
                className="object-contain"
              />
            </div>
            <span className="font-display text-xl font-bold tracking-wider text-[#F3F0E8]">
              AROVA
            </span>
          </Link>
          <h2 className="font-display text-2xl font-bold text-[#F3F0E8]">
            Reset your password
          </h2>
          <p className="text-xs text-[#A39E93]">
            We will send a password reset verification link to your email
          </p>
        </div>

        <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          {sent ? (
            <div className="text-center py-6 space-y-4">
              <CheckCircle2 className="w-10 h-10 text-[#34D399] mx-auto" />
              <h3 className="font-display text-base font-semibold text-[#F3F0E8]">
                Reset Link Dispatched
              </h3>
              <p className="text-xs text-[#D0CBC1]">
                Check your inbox for <strong>{email}</strong> and follow instructions to set a new password.
              </p>
              <Link href="/login" className="inline-block pt-2">
                <Button variant="secondary" size="sm">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="subscriber@example.com"
                    className="pl-9"
                  />
                  <Mail className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={loading}
              >
                Send Reset Link
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-xs text-[#A39E93]">
          Remember your password?{" "}
          <Link href="/login" className="text-[#FFAA3D] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

