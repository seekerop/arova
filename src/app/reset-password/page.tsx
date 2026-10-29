"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update password.");
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
            Set new password
          </h2>
          <p className="text-xs text-[#A39E93]">
            Enter your new secure password below
          </p>
        </div>

        <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)]">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#34D399] mx-auto" />
              <h3 className="font-display text-base font-semibold text-[#F3F0E8]">
                Password Updated
              </h3>
              <p className="text-xs text-[#D0CBC1]">
                Redirecting you to the sign-in screen...
              </p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">New Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9"
                  />
                  <Lock className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#D0CBC1]">Confirm Password</label>
                <div className="relative">
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9"
                  />
                  <Lock className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-2"
                isLoading={loading}
              >
                Update Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

