"use client";

import { Shield, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminHeader({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <header className="h-16 border-b border-[rgba(243,240,232,0.08)] bg-[#0D0D0C] px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        {title && (
          <h1 className="font-display text-lg font-bold text-[#F3F0E8] leading-tight">
            {title}
          </h1>
        )}
        {subtitle && <p className="text-xs text-[#A39E93]">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="flame" size="sm" className="gap-1 font-technical">
          <Shield className="w-3 h-3" />
          ADMIN PRIVILEGED
        </Badge>
        <div className="w-8 h-8 rounded-full bg-[#161514] border border-[rgba(232,75,44,0.4)] flex items-center justify-center font-technical text-xs font-bold text-[#E84B2C]">
          AD
        </div>
      </div>
    </header>
  );
}

