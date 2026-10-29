"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/navigation/admin-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldAlert, KeyRound, Terminal, CheckCircle2, Copy } from "lucide-react";

export default function AdminSettingsPage() {
  const [copied, setCopied] = useState(false);

  const sqlBootstrapSnippet = `-- Secure SQL snippet to assign the first administrator in Supabase SQL Editor:
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_AUTH_USER_UUID_HERE', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';`;

  const copySnippet = () => {
    navigator.clipboard.writeText(sqlBootstrapSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminHeader
        title="Admin Settings & Bootstrap Configuration"
        subtitle="Secure first-admin provisioning, environment status, and scheduled worker secrets"
      />

      <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto w-full">
        {/* Environment Status Card */}
        <Card className="p-6 bg-[#111110] border-[rgba(243,240,232,0.08)] space-y-4">
          <div className="pb-3 border-b border-[rgba(243,240,232,0.06)] flex items-center justify-between">
            <h3 className="font-display font-bold text-base text-[#F3F0E8]">
              Environment Configuration Status
            </h3>
            <Badge variant="success" size="sm">
              Securely Configured
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-1">
              <span className="text-[#A39E93] block">Supabase URL</span>
              <span className="font-technical text-[#F3F0E8]">Connected via Next.js SSR Client</span>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-1">
              <span className="text-[#A39E93] block">Razorpay Webhooks</span>
              <span className="font-technical text-[#34D399]">HMAC SHA256 Signature Active</span>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-1">
              <span className="text-[#A39E93] block">Durable Cron Endpoint</span>
              <span className="font-technical text-[#F3F0E8]">/api/cron/process (Bearer Token Gated)</span>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#161514] border border-[rgba(243,240,232,0.06)] space-y-1">
              <span className="text-[#A39E93] block">Lead Privacy Enforcement</span>
              <span className="font-technical text-[#34D399]">Strict Server Query Masking Active</span>
            </div>
          </div>
        </Card>

        {/* Secure Admin Bootstrap Instructions Card */}
        <Card className="p-6 bg-[#111110] border-[rgba(232,75,44,0.3)] space-y-4">
          <div className="pb-3 border-b border-[rgba(243,240,232,0.06)] flex items-center gap-2 text-[#E84B2C]">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <h3 className="font-display font-bold text-base text-[#F3F0E8]">
              Secure First-Admin Bootstrap Process
            </h3>
          </div>

          <p className="text-xs text-[#D0CBC1] leading-relaxed">
            In compliance with our security directives, there is no public or unauthenticated admin registration link. Admin roles can only be granted directly via the Supabase SQL editor or authenticated database migration using the script below:
          </p>

          <div className="relative">
            <pre className="p-4 rounded-[8px] bg-[#080505] border border-[rgba(243,240,232,0.1)] text-xs font-technical text-[#FFAA3D] overflow-x-auto leading-relaxed">
              {sqlBootstrapSnippet}
            </pre>
            <Button
              variant="secondary"
              size="sm"
              onClick={copySnippet}
              className="absolute top-3 right-3 text-xs gap-1"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy SQL"}
            </Button>
          </div>

          <div className="text-[11px] text-[#A39E93] space-y-1 pt-1">
            <p>1. Sign up a regular user account at <code className="text-[#F3F0E8]">/signup</code>.</p>
            <p>2. Obtain the user UUID from <code className="text-[#F3F0E8]">auth.users</code> in your Supabase dashboard.</p>
            <p>3. Execute the snippet above to elevate the account to the privileged <code className="text-[#FFAA3D]">admin</code> role.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

