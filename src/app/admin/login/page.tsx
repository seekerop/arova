"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Mail, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Successful login
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid administrative credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 bg-[#080505] relative overflow-hidden">
      {/* Ambient Ember Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse_at_center,rgba(232,75,44,0.12)_0%,transparent_70%)] pointer-events-none blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand & Security Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[rgba(232,75,44,0.4)] flex items-center justify-center bg-[#111110] shadow-[0_0_20px_rgba(232,75,44,0.2)]">
              <Image
                src="/arenova.png"
                alt="Arenova"
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
            <div className="text-left">
              <span className="font-display text-xl font-bold tracking-wider text-[#F3F0E8] block">
                AROVA
              </span>
              <span className="text-[10px] font-technical tracking-widest text-[#FFAA3D] uppercase block">
                Executive Portal
              </span>
            </div>
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#F3F0E8]">
              Administrative Gateway
            </h1>
            <p className="text-xs text-[#A39E93] mt-1">
              Single-owner access restricted to platform operator credentials
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] shadow-[0_12px_40px_rgba(0,0,0,0.8)] relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E84B2C] to-transparent opacity-80" />

          {errorMessage && (
            <div className="mb-5 p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C] flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Master Administrator Email
              </label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="avi@arenova.in"
                  className="pl-9 font-technical text-xs"
                />
                <Mail className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Administrative Security Password
              </label>
              <div className="relative">
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              Authenticate as Administrator
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[rgba(243,240,232,0.06)] flex items-center justify-between text-[11px] text-[#A39E93]">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#34D399]" />
              Single Owner Verified
            </span>
            <Link
              href="/login"
              className="text-[#FFAA3D] hover:underline"
            >
              Subscriber Sign In &rarr;
            </Link>
          </div>
        </Card>

        {/* Security Notice */}
        <p className="text-center text-[11px] text-[#9E9B93]">
          Protected by timing-safe cryptographic validation. Unauthorized access attempts are monitored and logged.
        </p>
      </div>
    </div>
  );
}
