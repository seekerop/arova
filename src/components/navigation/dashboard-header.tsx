"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export function DashboardHeader({
  title,
  subtitle,
  actions,
}: {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="h-16 border-b border-[rgba(243,240,232,0.08)] bg-[#111110] px-6 flex items-center justify-between sticky top-0 z-30">
      <div>
        {title && (
          <h1 className="font-display text-lg font-bold text-[#F3F0E8] leading-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-xs text-[#A39E93]">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <Link
          href="/dashboard/notifications"
          className="p-2 rounded-[8px] text-[#A39E93] hover:text-[#F3F0E8] hover:bg-[#161514] transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#E84B2C] absolute top-1.5 right-1.5" />
        </Link>

        <div className="flex items-center gap-2 pl-2 border-l border-[rgba(243,240,232,0.08)]">
          <div className="w-8 h-8 rounded-full bg-[#161514] border border-[rgba(243,240,232,0.12)] flex items-center justify-center font-technical text-xs font-bold text-[#FFAA3D]">
            SU
          </div>
        </div>
      </div>
    </header>
  );
}
