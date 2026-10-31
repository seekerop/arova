"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DisclaimerAcknowledgementCheckbox } from "@/components/ui/disclaimer";
import { AlertCircle, Lock, Mail, User, Building } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "starter";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acknowledged) {
      setErrorMessage("You must acknowledge the lead limitation notice to proceed.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company: company,
            preferred_plan: initialPlan,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        // Create initial profile record if not already triggered by database
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          company,
          updated_at: new Date().toISOString(),
        });

        // Insert customer role
        await supabase.from("user_roles").upsert({
          user_id: data.user.id,
          role: "customer",
        });

        router.push(`/dashboard?plan=${initialPlan}`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
      {errorMessage && (
        <div className="mb-4 p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#D0CBC1]">Full Name</label>
          <div className="relative">
            <Input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="pl-9"
            />
            <User className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#D0CBC1]">Email Address</label>
          <div className="relative">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="pl-9"
            />
            <Mail className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#D0CBC1]">Company / Agency</label>
          <div className="relative">
            <Input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Digital Agency"
              className="pl-9"
            />
            <Building className="w-4 h-4 text-[#A39E93] absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#D0CBC1]">Password</label>
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

        {/* Mandatory Pre-Subscription Disclaimer Checkbox */}
        <div className="pt-2">
          <DisclaimerAcknowledgementCheckbox
            checked={acknowledged}
            onChange={setAcknowledged}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-2"
          isLoading={loading}
          disabled={!acknowledged}
        >
          Create Account & Proceed
        </Button>
      </form>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-[#080505] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(232,75,44,0.08)_0%,transparent_70%)] pointer-events-none blur-3xl" />

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
            Create your account
          </h2>
          <p className="text-xs text-[#A39E93]">
            Start accessing curated commercial leads in your service category
          </p>
        </div>

        <Suspense fallback={<div className="text-center text-xs text-[#A39E93]">Loading...</div>}>
          <SignupForm />
        </Suspense>

        <p className="text-center text-xs text-[#A39E93]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#FFAA3D] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

