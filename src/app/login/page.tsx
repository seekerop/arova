"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { AlertCircle, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if admin
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();

        if (roleRow?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#080505] relative overflow-hidden">
      {/* Ambient Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(232,75,44,0.08)_0%,transparent_70%)] pointer-events-none blur-3xl" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand */}
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
            Sign in to your account
          </h2>
          <p className="text-xs text-[#A39E93]">
            Access your lead pipeline, active claims, and quota dashboard
          </p>
        </div>

        <Card className="p-8 bg-[#111110] border-[rgba(243,240,232,0.08)] shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-[8px] bg-[rgba(232,75,44,0.1)] border border-[rgba(232,75,44,0.3)] text-xs text-[#E84B2C] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#D0CBC1]">
                Email Address
              </label>
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#D0CBC1]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#FFAA3D] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
              Sign In
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-[#A39E93]">
          Don&apos;t have an account yet?{" "}
          <Link href="/signup" className="text-[#FFAA3D] hover:underline font-medium">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
